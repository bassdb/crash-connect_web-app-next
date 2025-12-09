import { useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Users, Palette } from 'lucide-react'
import useExampleTeamsStore, { ExampleTeam } from '../../_hooks/useExampleTeamsStore'
import useDesignTemplateStore from '../../_hooks/useDesignTemplateStore'
import useCanvasStore from '../../_hooks/useCanvasStore'
import useDynamicValuesStore from '../../_hooks/useDynamicValuesStore'
import { useToast } from '@/hooks/use-toast'
import { useAction } from 'next-safe-action/hooks'
import { saveDefaultTeamForTemplate } from '@/app/(editors)/_server/action-saveDafaultTeamForSesignTemplate'
import { applyTeamToCanvas, updateTeamLogo, findDynamicLayers } from '../../_canvas-functions/layer-management'
import ExampleTeamsOverlay from './example-teams-overlay'

interface ExampleTeamSectionProps {
  designTemplateId?: string
}

export default function ExampleTeamSection({ designTemplateId }: ExampleTeamSectionProps) {
  const {
    savedExampleTeamValues,
    previewedExampleTeamValues,
    openOverlay,
    clearPreviewedTeam,
    availableTeams,
    selectTeamForPreview,
    isLoading,
    loadSavedTeam,
    updateSavedTeam,
  } = useExampleTeamsStore()

  const { designTemplateData } = useDesignTemplateStore()
  const { fabricCanvas } = useCanvasStore()
  const { previewValues, _loadFromExampleTeam, _discardPreviewValues, _applyPreviewValues, isSaving, _setIsSaving } = useDynamicValuesStore()
  const { toast } = useToast()

  const { execute: executeSaveDefaultTeam } = useAction(saveDefaultTeamForTemplate, {
    onSuccess: (result) => {
      console.log('Save action result:', result)
      _setIsSaving(false)
      
      // Check if action returned an error (database error, not server exception)
      if (result?.data?.error) {
        console.error('Error from action:', result.data.error)
        toast({
          title: 'Fehler',
          description: result.data.message || result.data.error,
          variant: 'destructive',
        })
        return
      }

      // Success case - check for success property
      if (result?.data?.success) {
        // Find the team by the returned teamId to ensure we update with correct data
        const savedTeamId = result.data.teamId
        const teamToUpdate = previewedExampleTeamValues || availableTeams.find(t => t.id === savedTeamId)
        
        // STEP 1: Apply preview values to saved values in DynamicValuesStore
        // This must happen BEFORE clearing the preview to persist the values
        _applyPreviewValues()
        console.log('Applied preview values to saved values in DynamicValuesStore')
        
        if (teamToUpdate) {
          // STEP 2: Update saved team in ExampleTeamsStore
          updateSavedTeam(teamToUpdate)
          
          // STEP 3: Clear preview WITHOUT triggering re-application
          clearPreviewedTeam()
          
          toast({ 
            title: 'Erfolgreich', 
            description: result.data.message || 'Team-Auswahl wurde gespeichert' 
          })
        } else {
          console.warn('Team not found for updating saved state')
          // Still clear the preview since values were applied
          clearPreviewedTeam()
          toast({ 
            title: 'Erfolgreich gespeichert', 
            description: 'Team wurde in der Datenbank gespeichert' 
          })
        }
        return
      }

      // Fallback - should not normally reach here
      console.warn('Unexpected result structure:', result)
      toast({
        title: 'Warnung',
        description: 'Team wurde möglicherweise gespeichert, aber die Antwort war ungewöhnlich',
        variant: 'default',
      })
    },
    onError: (error) => {
      console.error('Error saving team selection:', error)
      _setIsSaving(false)
      toast({
        title: 'Fehler',
        description: 'Team-Auswahl konnte nicht gespeichert werden',
        variant: 'destructive',
      })
    },
  })

  // Get default team values from designTemplateStore
  const defaultTeamValues = designTemplateData?.default_team_values

  // Apply team to canvas
  const applyTeamToCanvasCallback = useCallback(
    (team: ExampleTeam) => {
      if (team.colors && Array.isArray(team.colors) && fabricCanvas) {
        const teamColors = team.colors.map((color: any) => ({
          name: color.name,
          value: color.value,
        }))

        applyTeamToCanvas(fabricCanvas, team.name, teamColors)
      }
    },
    [fabricCanvas]
  )

  const handleConfirmSelectedTeam = () => {
    if (!previewedExampleTeamValues || !designTemplateId || isSaving) return
    
    // Get the team ID from DynamicValuesStore (the new central store for dynamic values)
    const teamIdFromStore = previewValues.selectedTeamId
    
    if (!teamIdFromStore) {
      console.error('No team ID found in DynamicValuesStore')
      toast({
        title: 'Fehler',
        description: 'Team-ID konnte nicht gefunden werden',
        variant: 'destructive',
      })
      return
    }
    
    console.log('Saving team ID from DynamicValuesStore:', teamIdFromStore)
    console.log('Preview values:', previewValues)
    
    // Set saving flag to prevent multiple saves
    _setIsSaving(true)
    
    // Save the team to the database using the ID from DynamicValuesStore
    // On success, _applyPreviewValues() will be called to persist the preview values
    // as saved values in the DynamicValuesStore
    executeSaveDefaultTeam({ 
      designTemplateId, 
      teamId: teamIdFromStore 
    })
  }

  const handleTeamSelect = async (team: ExampleTeam) => {
    selectTeamForPreview(team)
    
    // Update DynamicValuesStore with the selected team
    const teamLogoUrl = (team as any).avatar_url || (team as any).team_logo_url || null
    const teamColors = team.colors && Array.isArray(team.colors) ? team.colors : []
    _loadFromExampleTeam(team.id, team.name, teamLogoUrl, teamColors)
    
    // Apply team to canvas for preview
    applyTeamToCanvasCallback(team)
  }

  // Available teams werden serverseitig geladen und im EditorContainer hydriert

  // Load saved team immediately on mount using the id from DB; do not wait for availableTeams
  useEffect(() => {
    if (!savedExampleTeamValues && defaultTeamValues) {
      // defaultTeamValues is a string id according to types; pass directly
      loadSavedTeam(defaultTeamValues)
    }
  }, [savedExampleTeamValues, defaultTeamValues, loadSavedTeam])

  // Apply saved team to canvas when it's loaded
  // Only update if this is different from current preview to prevent unnecessary updates after save
  useEffect(() => {
    if (savedExampleTeamValues && !isSaving) {
      const teamLogoUrl = (savedExampleTeamValues as any).avatar_url || (savedExampleTeamValues as any).team_logo_url || null
      const teamColors = savedExampleTeamValues.colors && Array.isArray(savedExampleTeamValues.colors) ? savedExampleTeamValues.colors : []
      
      // Only update if this is different from current saved values
      const currentTeamId = previewValues.selectedTeamId
      
      if (currentTeamId !== savedExampleTeamValues.id) {
        _loadFromExampleTeam(savedExampleTeamValues.id, savedExampleTeamValues.name, teamLogoUrl, teamColors)
        applyTeamToCanvasCallback(savedExampleTeamValues)
      }
    }
  }, [savedExampleTeamValues, applyTeamToCanvasCallback, _loadFromExampleTeam, previewValues.selectedTeamId, isSaving])

  // Automatically update team_logo layers when previewed team changes
  useEffect(() => {
    if (!fabricCanvas || !previewedExampleTeamValues) return
    
    let isCancelled = false
    
    const updateLogo = async () => {
      const existingLogoLayers = findDynamicLayers(fabricCanvas, 'team_logo')
      if (existingLogoLayers.length === 0) return
      const teamLogoUrl = 
        (previewedExampleTeamValues as any).avatar_url || 
        (previewedExampleTeamValues as any).team_logo_url
      
      if (teamLogoUrl && !isCancelled) {
        await updateTeamLogo(fabricCanvas, teamLogoUrl)
      }
    }
    
    updateLogo()
    
    // Cleanup function to prevent race conditions
    return () => {
      isCancelled = true
    }
  }, [previewedExampleTeamValues, fabricCanvas])

  // Automatically update team_name layers when preview team name changes in store
  useEffect(() => {
    if (!fabricCanvas) return
    
    const teamName = previewValues.teamName
    if (!teamName) return
    
    // Find all team_name text layers
    const allTextLayers = findDynamicLayers(fabricCanvas, 'text')
    const teamNameLayers = allTextLayers.filter(
      (layer: any) => layer.textProperty === 'team_name'
    )
    
    // Only update if there are team_name layers on the canvas
    if (teamNameLayers.length > 0) {
      console.log(`Updating ${teamNameLayers.length} team_name layers to: "${teamName}"`)
      
      // Update all team_name layers
      teamNameLayers.forEach((layer: any) => {
        if (layer.set && typeof layer.set === 'function') {
          layer.set('text', teamName)
        }
      })
      
      fabricCanvas.renderAll()
    }
  }, [previewValues.teamName, fabricCanvas])

  // Automatically update team color layers when preview team colors change in store
  useEffect(() => {
    if (!fabricCanvas) return
    
    const { teamPrimaryColor, teamSecondaryColor, teamTertiaryColor } = previewValues
    
    // Only update if we have team colors set
    if (!teamPrimaryColor && !teamSecondaryColor && !teamTertiaryColor) return
    
    let updated = false
    
    // Update primary color layers
    if (teamPrimaryColor) {
      const primaryLayers = findDynamicLayers(fabricCanvas, 'primary_color')
      if (primaryLayers.length > 0) {
        console.log(`Updating ${primaryLayers.length} primary_color layers to: ${teamPrimaryColor}`)
        primaryLayers.forEach((layer: any) => {
          if (layer.set) {
            layer.set('fill', teamPrimaryColor)
            updated = true
          }
        })
      }
    }
    
    // Update secondary color layers
    if (teamSecondaryColor) {
      const secondaryLayers = findDynamicLayers(fabricCanvas, 'secondary_color')
      if (secondaryLayers.length > 0) {
        console.log(`Updating ${secondaryLayers.length} secondary_color layers to: ${teamSecondaryColor}`)
        secondaryLayers.forEach((layer: any) => {
          if (layer.set) {
            layer.set('fill', teamSecondaryColor)
            updated = true
          }
        })
      }
    }
    
    // Update tertiary color layers
    if (teamTertiaryColor) {
      const tertiaryLayers = findDynamicLayers(fabricCanvas, 'tertiary_color')
      if (tertiaryLayers.length > 0) {
        console.log(`Updating ${tertiaryLayers.length} tertiary_color layers to: ${teamTertiaryColor}`)
        tertiaryLayers.forEach((layer: any) => {
          if (layer.set) {
            layer.set('fill', teamTertiaryColor)
            updated = true
          }
        })
      }
    }
    
    if (updated) {
      fabricCanvas.renderAll()
    }
  }, [previewValues.teamPrimaryColor, previewValues.teamSecondaryColor, previewValues.teamTertiaryColor, fabricCanvas])

  const handleClearPreviewedTeam = () => {
    // Only proceed if we're actually clearing a preview (not after save)
    if (!previewedExampleTeamValues) return
    
    // Discard preview values in DynamicValuesStore
    _discardPreviewValues()
    
    // Clear previewed team in ExampleTeamsStore
    clearPreviewedTeam()
    
    // Re-apply saved team to canvas if available
    if (savedExampleTeamValues) {
      applyTeamToCanvasCallback(savedExampleTeamValues)
    }
  }

  return (
    <>
      <div className='space-y-3'>
        <Label className='font-semibold flex items-center gap-2'>
          <Users size={16} />
          Aktuell gespeichertes Beispiel Team
        </Label>
        <div className='p-3 bg-muted/50 rounded-md space-y-3'>
          {savedExampleTeamValues && (
            <div className='flex items-center justify-between p-2 rounded-md border bg-background/60'>
              <div className='flex items-center gap-3'>
                <div className='h-8 w-8 rounded-full overflow-hidden border bg-muted flex items-center justify-center'>
                  {(savedExampleTeamValues as any).avatar_url ||
                  (savedExampleTeamValues as any).team_logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        (savedExampleTeamValues as any).team_logo_url ||
                        (savedExampleTeamValues as any).avatar_url
                      }
                      alt={savedExampleTeamValues.name}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <span className='text-[10px] font-medium'>
                      {savedExampleTeamValues.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>{savedExampleTeamValues.name}</span>
                  <span className='text-xs text-green-600 font-medium'>Gespeichert</span>
                  {(savedExampleTeamValues as any).colors &&
                    Array.isArray((savedExampleTeamValues as any).colors) && (
                      <div className='flex gap-1 mt-1'>
                        {(savedExampleTeamValues as any).colors
                          .slice(0, 5)
                          .map((c: any, idx: number) => (
                            <div
                              key={idx}
                              className='h-3 w-3 rounded-full border'
                              style={{ backgroundColor: c.value }}
                              title={`${c.name}: ${c.value}`}
                            />
                          ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
          <p className='text-xs text-muted-foreground'>
            {savedExampleTeamValues
              ? 'Das gespeicherte Standard-Team wird automatisch angewendet.'
              : 'Wählen Sie ein Team aus, um dessen Farben und Werte zu übernehmen.'}
          </p>

          {previewedExampleTeamValues &&
            (!savedExampleTeamValues ||
              previewedExampleTeamValues.id !== savedExampleTeamValues.id) && (
              <div className='space-y-2'>
                <Label className='font-semibold flex items-center gap-2'>
                  <Palette size={16} />
                  Now Previewing:
                </Label>
                <div className='p-3 bg-muted rounded-md space-y-2'>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs text-muted-foreground'>Vorschau Team:</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-full overflow-hidden border bg-muted flex items-center justify-center'>
                      {(previewedExampleTeamValues as any).avatar_url ||
                      (previewedExampleTeamValues as any).team_logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            (previewedExampleTeamValues as any).team_logo_url ||
                            (previewedExampleTeamValues as any).avatar_url
                          }
                          alt={previewedExampleTeamValues.name}
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <span className='text-[10px] font-medium'>
                          {previewedExampleTeamValues.name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className='text-sm font-medium'>{previewedExampleTeamValues.name}</p>
                  </div>
                  {previewedExampleTeamValues.colors &&
                    Array.isArray(previewedExampleTeamValues.colors) &&
                    previewedExampleTeamValues.colors.length > 0 && (
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                          <Palette className='h-3 w-3 text-muted-foreground' />
                          <p className='text-xs text-muted-foreground'>Team Farben:</p>
                        </div>
                        <div className='flex space-x-2'>
                          {previewedExampleTeamValues.colors
                            .slice(0, 5)
                            .map((color: any, index: number) => (
                              <div
                                key={index}
                                className='w-4 h-4 rounded-full border border-border'
                                style={{ backgroundColor: color.value }}
                                title={`${color.name}: ${color.value}`}
                              />
                            ))}
                          {previewedExampleTeamValues.colors.length > 5 && (
                            <div className='w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground'>
                              +{previewedExampleTeamValues.colors.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  <div className='pt-2 space-y-2'>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleConfirmSelectedTeam}
                      className='w-full text-xs'
                      disabled={isSaving}
                    >
                      {isSaving ? 'Wird gespeichert...' : 'Übernehmen'}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleClearPreviewedTeam}
                      className='w-full text-xs'
                      disabled={isSaving}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </div>
            )}

          <Button onClick={openOverlay} variant='outline' className='w-full gap-2'>
            <Users size={16} />
            Anderes Team auswählen
          </Button>
        </div>
      </div>

      {/* Example Teams Overlay */}
      <ExampleTeamsOverlay onTeamSelect={handleTeamSelect} />
    </>
  )
}
