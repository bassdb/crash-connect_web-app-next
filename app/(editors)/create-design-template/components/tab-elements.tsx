'use client'

import React, { useState, useEffect, useCallback } from 'react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import {
  ChevronDown,
  Trash2,
  Plus,
  LoaderCircle,
  Layers,
  Type,
  Users,
  User,
  Palette,
  Hash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'
import useExampleTeamsStore from '@/app/(editors)/_hooks/useExampleTeamsStore'
import { useDynamicValues } from '@/app/(editors)/_hooks/useDynamicValues'
import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import { useToast } from '@/hooks/use-toast'
import {
  uploadFileToSupabase,
  getPublicUrl,
  listFiles,
  deleteFile,
} from '../../_canvas-functions/upload-assets'
import {
  addImageToCanvas,
  addTeamLogo,
  addTextLayerName,
  addDynamicColorLayer,
  addDynamicTextLayer,
  addTeamNameLayer,
  addJerseyNumberLayer,
  addUserFirstNameLayer,
  addUserLastNameLayer,
  updateTeamLogo,
  updateTeamName,
  findDynamicLayers,
} from '../../_canvas-functions/layer-management'
import type { FilePondFile, FilePondInitialFile } from 'filepond'

// Register FilePond plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
)
// https://wlnwoxboqmwzsqglisez.supabase.co/storage/v1/object/public/design-template-assets/37/previews/nextFootballHero13_37_1080x1920_289802_preview.jpg

export default function TabElements() {
  const {
    fabricCanvas,
    temporaryAssets,
    setTemporaryAssets,
    canvasWidth,
    canvasHeight,
    isTemplateCanvasDataLoaded,
    uploadProgress,
    setUploadProgress,
  } = useCanvasStore()

  const { storeDesignTemplateId, existingFiles, setExistingFiles } = useDesignTemplateStore()

  // Access example teams store (preview + saved values)
  const exampleTeamsStore = useExampleTeamsStore()
  const activeTeam =
    exampleTeamsStore.previewedExampleTeamValues || exampleTeamsStore.savedExampleTeamValues

  const { currentValues } = useDynamicValues()

  // Destructure dynamic values for easier access
  const { name, jerseyNumber, teamName, primaryColor, secondaryColor, tertiaryColor } =
    currentValues

  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Debug: Log active team changes (previewed first, then saved)
  useEffect(() => {
    console.log('TabUpload - activeTeam changed:', activeTeam)
    console.log('TabUpload - team_logo_url:', activeTeam?.team_logo_url)
  }, [activeTeam])

  // Update team name layers when active team changes (consistent helper like logo)
  useEffect(() => {
    if (!fabricCanvas || !activeTeam?.name) return
    let cancelled = false
    const run = async () => {
      try {
        if (!cancelled) {
          await updateTeamName(fabricCanvas, activeTeam.name)
        }
      } catch (e) {
        console.error('Error updating team name on team change:', e)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [activeTeam?.name, fabricCanvas])

  // Update team logo automatically when example team selection changes
  useEffect(() => {
    if (!fabricCanvas) return

    let isCancelled = false

    const run = async () => {
      try {
        const logoLayers = findDynamicLayers(fabricCanvas, 'team_logo')

        const newLogoUrl = activeTeam?.team_logo_url

        if (logoLayers.length > 0 && !isCancelled) {
          if (newLogoUrl) {
            await updateTeamLogo(fabricCanvas, newLogoUrl)
          }
          // Wenn kein neues Logo vorhanden ist, lassen wir das bestehende Logo unverändert
        }

        if (!isCancelled) {
          fabricCanvas.renderAll()
        }
      } catch (e) {
        console.error('Error updating team logo on team change:', e)
      }
    }

    run()

    // Cleanup function to prevent race conditions
    return () => {
      isCancelled = true
    }
  }, [fabricCanvas, activeTeam?.team_logo_url])

  // Debug-Ausgabe für den aktuellen Status
  // console.log(
  //   'TabUpload render - storeDesignTemplateId:',
  //   storeDesignTemplateId,
  //   'existingFiles:',
  //   existingFiles
  // )

  const loadExistingFiles = useCallback(async () => {
    if (!storeDesignTemplateId) {
      console.log('No storeDesignTemplateId available, skipping file load')
      return
    }

    console.log('Loading existing files for template:', storeDesignTemplateId)
    setIsLoading(true)
    try {
      const path = `${storeDesignTemplateId}/assets`
      console.log('Searching for files in path:', path)

      const files = await listFiles(storeDesignTemplateId)
      console.log('Files returned from listFiles:', files)

      if (files && files.length > 0) {
        const urls = files.map((file) => getPublicUrl(`${path}/${file.name}`))
        console.log('Generated URLs:', urls)
        setExistingFiles(urls)
        console.log('existingFiles loaded:', urls)
      } else {
        console.log('No files found, setting empty array')
        setExistingFiles([])
      }
    } catch (error) {
      console.error('Error loading existing files:', error)
      toast({
        title: 'Fehler beim Laden',
        description: 'Die vorhandenen Dateien konnten nicht geladen werden.',
        variant: 'destructive',
      })
      setExistingFiles([])
    } finally {
      setIsLoading(false)
    }
  }, [storeDesignTemplateId, setExistingFiles, toast])

  useEffect(() => {
    if (storeDesignTemplateId) {
      loadExistingFiles()
    }
    if (!storeDesignTemplateId) {
      setExistingFiles([])
    }
  }, [storeDesignTemplateId, loadExistingFiles, setExistingFiles])

  // Zusätzliche useEffect für das Laden bestehender Dateien beim Öffnen eines Templates
  useEffect(() => {
    // Wenn der storeDesignTemplateId gesetzt ist, aber existingFiles leer sind,
    // versuche die Dateien zu laden
    if (storeDesignTemplateId && existingFiles.length === 0) {
      console.log('Template ID vorhanden, aber keine Dateien geladen. Lade Dateien...')
      loadExistingFiles()
    }
  }, [storeDesignTemplateId, existingFiles.length, loadExistingFiles])

  const handleDeleteFile = async (url: string) => {
    if (!storeDesignTemplateId) return
    try {
      const urlObject = new URL(url)
      const pathParts = urlObject.pathname.split('/').filter((part) => part)
      // The expected path for deletion should be relative to the bucket:
      // template-id/assets/file.png
      // Slice index depends on the base Supabase URL structure, typically 5 or 6
      // Let's assume 5: /storage/v1/object/public/design-template-assets/...
      const expectedSliceIndex = 5
      if (pathParts.length > expectedSliceIndex) {
        const filePath = pathParts.slice(expectedSliceIndex).join('/')
        console.log('Attempting to delete file at path:', filePath)

        // Find and remove the corresponding object from the canvas
        if (fabricCanvas) {
          const objects = fabricCanvas.getObjects()
          const objectToRemove = objects.find((obj) => {
            // Check common properties where the URL might be stored
            // Fabric Image objects store it in _element.src or src directly depending on version/load method
            // Also check a potential custom data field
            const objectSrc =
              (obj as any)._element?.src || (obj as any).src || obj.get('data')?.supabaseUrl
            // Compare the full public URL
            return objectSrc === url
          })

          if (objectToRemove) {
            fabricCanvas.remove(objectToRemove)
            fabricCanvas.renderAll()
            console.log('Removed corresponding object from canvas:', objectToRemove)
          } else {
            console.log('No corresponding object found on canvas for URL:', url)
          }
        } else {
          console.warn('Canvas not available to remove object.')
        }

        const success = await deleteFile(filePath)

        if (success) {
          // Update state directly by filtering out the deleted URL
          const currentFiles = useDesignTemplateStore.getState().existingFiles
          const updatedFiles = currentFiles.filter((fileUrl: string) => fileUrl !== url)
          setExistingFiles(updatedFiles)
          toast({
            title: 'Datei gelöscht',
            description: 'Die Datei wurde erfolgreich gelöscht.',
          })
        } else {
          // Error is handled within deleteFile, show toast here
          toast({
            title: 'Fehler beim Löschen',
            description: 'Die Datei konnte nicht aus dem Storage gelöscht werden.',
            variant: 'destructive',
          })
        }
        // No need to call loadExistingFiles() as we updated state directly
      } else {
        console.error('Could not determine file path from URL:', url, 'Path parts:', pathParts)
        throw new Error('Could not determine file path from URL')
      }
    } catch (err) {
      console.error('Error deleting file process:', err)
      toast({
        title: 'Fehler beim Löschen',
        description: 'Die Datei konnte nicht gelöscht werden.',
        variant: 'destructive',
      })
    }
  }

  const handleAddToCanvas = async (url: string) => {
    if (fabricCanvas) {
      try {
        await addImageToCanvas({
          fabricCanvas,
          url,
        })
        toast({
          title: 'Bild hinzugefügt',
          description: 'Das Bild wurde erfolgreich zum Canvas hinzugefügt.',
        })
      } catch (err) {
        console.error('Error adding image to canvas:', err)
        toast({
          title: 'Fehler beim Hinzufügen',
          description: 'Das Bild konnte nicht zum Canvas hinzugefügt werden.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleUpdateFiles = (fileItems: FilePondFile[]) => {
    setTemporaryAssets(fileItems.map((item) => item.file as File))
  }

  if (!storeDesignTemplateId) {
    return (
      <div className='p-4 text-center text-muted-foreground bg-secondary/50 rounded-lg'>
        <p>Initialisiere zuerst ein neues Hype Template (Reiter: Metadata).</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8 gap-4'>
        <div className='animate-spin'>
          <LoaderCircle />
        </div>
        <span>Lade Assets...</span>
      </div>
    )
  }

  return (
    <>
      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
          <Label className='font-semibold'>Add Dynamic Elements</Label>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>
        <CollapsibleContent className='py-2'>
          {/* Colors (Primary, Secondary, Tertiary, Custom) */}
          <div className='space-y-2'>
            <Label className='font-medium flex items-center gap-2'>
              <Palette size={16} />
              Colors
            </Label>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={() => {
                  if (fabricCanvas) {
                    addDynamicColorLayer(
                      fabricCanvas,
                      'primary_color',
                      primaryColor || '#000000',
                      {
                        left: 50,
                        top: 50,
                        width: 200,
                        height: 100,
                      }
                    )
                  }
                }}
              >
                <div className='w-6 h-6 rounded' style={{ backgroundColor: primaryColor || '#000000' }} />
                <span className='text-sm font-medium'>Primary Color</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={() => {
                  if (fabricCanvas) {
                    addDynamicColorLayer(
                      fabricCanvas,
                      'secondary_color',
                      secondaryColor || '#FFFFFF',
                      {
                        left: 300,
                        top: 50,
                        width: 200,
                        height: 100,
                      }
                    )
                  }
                }}
              >
                <div
                  className='w-6 h-6 rounded border'
                  style={{ backgroundColor: secondaryColor || '#FFFFFF' }}
                />
                <span className='text-sm font-medium'>Secondary Color</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={() => {
                  if (fabricCanvas) {
                    addDynamicColorLayer(
                      fabricCanvas,
                      'tertiary_color',
                      tertiaryColor || '#808080',
                      {
                        left: 500,
                        top: 50,
                        width: 200,
                        height: 100,
                      }
                    )
                  }
                }}
              >
                <div className='w-6 h-6 rounded' style={{ backgroundColor: tertiaryColor || '#808080' }} />
                <span className='text-sm font-medium'>Tertiary Color</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={() => {
                  if (fabricCanvas) {
                    addDynamicColorLayer(
                      fabricCanvas,
                      'custom_color',
                      '#CCCCCC',
                      {
                        left: 700,
                        top: 50,
                        width: 200,
                        height: 100,
                      }
                    )
                  }
                }}
              >
                <div className='w-6 h-6 rounded border' style={{ backgroundColor: '#CCCCCC' }} />
                <span className='text-sm font-medium'>Custom Color</span>
              </Button>
            </div>
          </div>
          <Separator className='my-6' />

          {/* User Values */}
          <div className='space-y-2'>
            <Label className='font-medium flex items-center gap-2'>
              <User size={16} />
              User Values
            </Label>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={() => {
                  if (fabricCanvas) {
                    addDynamicTextLayer(fabricCanvas, 'name', name || 'Name', {
                      left: 100,
                      top: 200,
                    })
                  }
                }}
              >
                <Type size={24} />
                <span className='text-sm font-medium'>Name Layer</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={() => {
                  if (fabricCanvas) {
                    addUserFirstNameLayer(fabricCanvas, 'First Name', {
                      left: 100,
                      top: 230,
                    })
                  }
                }}
              >
                <Type size={24} />
                <span className='text-sm font-medium'>First Name</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={() => {
                  if (fabricCanvas) {
                    addUserLastNameLayer(fabricCanvas, 'Last Name', {
                      left: 100,
                      top: 260,
                    })
                  }
                }}
              >
                <Type size={24} />
                <span className='text-sm font-medium'>Last Name</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={() => {
                  if (fabricCanvas) {
                    addJerseyNumberLayer(fabricCanvas, jerseyNumber?.toString() || '10', {
                      left: 100,
                      top: 300,
                    })
                  }
                }}
              >
                <Hash size={24} />
                <span className='text-sm font-medium'>Jersey Number</span>
              </Button>
            </div>
          </div>

          <Separator className='my-3' />

          {/* Team Values */}
          <div className='space-y-2'>
            <Label className='font-medium flex items-center gap-2'>
              <Users size={16} />
              Team Values
            </Label>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={() => {
                  if (fabricCanvas) {
                    const currentTeamName = activeTeam?.name || teamName || 'Team Name'

                    // Count existing team name layers to position new one
                    const existingTeamNameLayers = fabricCanvas
                      .getObjects()
                      .filter((obj: any) => obj.dynamicLayerType === 'team_name')

                    // Position new layer with offset based on existing layers
                    const layerOffset = existingTeamNameLayers.length * 30

                    // Always add new team name layer
                    addTeamNameLayer(fabricCanvas, currentTeamName, {
                      left: 100 + layerOffset,
                      top: 400 + layerOffset,
                    })
                  }
                }}
              >
                <Type size={24} />
                <span className='text-sm font-medium'>Team Name</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={async () => {
                  if (fabricCanvas) {
                    console.log('Active team:', activeTeam)
                    console.log('Team logo URL:', activeTeam?.team_logo_url)

                    if (activeTeam?.team_logo_url) {
                      console.log('Adding team logo:', activeTeam.team_logo_url)
                      await addTeamLogo({ fabricCanvas, teamLogo: activeTeam.team_logo_url })
                    } else {
                      console.log('No team selected or no logo URL, adding default team logo')
                      await addTeamLogo({ fabricCanvas })
                    }
                  }
                }}
              >
                <Layers size={24} />
                <span className='text-sm font-medium'>Team Logo</span>
              </Button>
            </div>
          </div>

          <Separator className='my-6' />

          {/* Custom Values */}
          <div className='space-y-2'>
            <Label className='font-medium flex items-center gap-2'>
              <Palette size={16} />
              Custom Values
            </Label>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='h-24 flex flex-col gap-2 justify-center items-center py-4'
                onClick={() => {
                  if (fabricCanvas) {
                    addDynamicTextLayer(fabricCanvas, 'additional_text', 'Your text', {
                      left: 120,
                      top: 240,
                    })
                  }
                }}
              >
                <Type size={24} />
                <span className='text-sm font-medium'>Custom Text</span>
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className='mt-6'>
        <Collapsible defaultOpen>
          <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
            <h3 className='text-lg font-medium'>Hochgeladene Assets</h3>
            <ChevronDown className='h-4 w-4' />
          </CollapsibleTrigger>
          <CollapsibleContent className='py-2'>
            {existingFiles.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
                {existingFiles.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className='relative group/item aspect-square border rounded-lg overflow-hidden'
                  >
                    <img
                      src={url}
                      alt={`Asset ${index + 1}`}
                      className='w-full h-full object-cover'
                      loading='lazy'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end opacity-0 group-hover/item:opacity-100 transition-opacity'>
                      <div className='flex justify-between w-full p-4'>
                        <Button
                          size='icon'
                          variant='outline'
                          onClick={() => handleAddToCanvas(url)}
                          className='text-white border-white hover:bg-white/20'
                        >
                          <Plus className='h-5 w-5' />
                        </Button>
                        <Button
                          size='icon'
                          variant='destructive'
                          onClick={() => handleDeleteFile(url)}
                        >
                          <Trash2 className='h-5 w-5' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground p-4 text-center bg-secondary/50 rounded-lg'>
                Keine Assets für dieses Template hochgeladen.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
          <Label className='font-semibold'>Assets hochladen</Label>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>
        <CollapsibleContent className='py-2'>
          <FilePond
            onupdatefiles={handleUpdateFiles}
            allowMultiple={true}
            maxFiles={10}
            name='files'
            labelIdle='Drag & Drop deine Dateien oder <span class="filepond--label-action">Browse</span>'
            acceptedFileTypes={['image/*']}
            stylePanelLayout='compact'
            imagePreviewMinHeight={100}
            className='w-full'
            credits={false}
            server={{
              process: async (fieldName, file, metadata, load, error, progress, abort) => {
                console.log('Processing file:', file.name)
                if (!storeDesignTemplateId) {
                  toast({
                    title: 'Kein Hype Template gefunden',
                    description: 'Initialisiere ein neues Hype Template in der rechten Spalte.',
                    variant: 'destructive',
                  })
                  error('Hype Template ID missing')
                  return {
                    abort: () => {
                      console.log('Upload process aborted early due to missing template ID.')
                      abort()
                    },
                  }
                }

                const controller = new AbortController()

                try {
                  const path = `${storeDesignTemplateId}/assets`

                  const data = await uploadFileToSupabase(
                    file as File,
                    path /*, onProgress, controller.signal */
                  )

                  if (data) {
                    const publicUrl = getPublicUrl(`${path}/${file.name}`)
                    console.log('Upload success, publicUrl:', publicUrl)
                    load(publicUrl)
                    // Optimistically update the state with the new file URL
                    const currentFiles = useDesignTemplateStore.getState().existingFiles
                    setExistingFiles([...currentFiles, publicUrl])

                    toast({
                      title: 'Upload erfolgreich',
                      description: `Datei ${file.name} hochgeladen.`,
                    })

                    // Automatically add the uploaded image to the canvas
                    if (fabricCanvas) {
                      try {
                        await addImageToCanvas({
                          fabricCanvas,
                          url: publicUrl,
                        })
                        toast({
                          title: 'Bild zum Canvas hinzugefügt',
                          description: `Datei ${file.name} wurde automatisch hinzugefügt.`,
                        })
                      } catch (addError) {
                        console.error('Error automatically adding image to canvas:', addError)
                        toast({
                          title: 'Fehler beim Hinzufügen',
                          description: `Datei ${file.name} konnte nicht automatisch zum Canvas hinzugefügt werden.`,
                          variant: 'destructive',
                        })
                      }
                    } else {
                      console.warn('Fabric canvas not available to add image automatically.')
                    }
                  } else {
                    toast({
                      title: 'Upload fehlgeschlagen',
                      description: `Datei ${file.name} konnte nicht hochgeladen werden.`,
                      variant: 'destructive',
                    })
                    throw new Error('Upload failed, no data returned')
                  }
                } catch (err: any) {
                  if (err.name === 'AbortError') {
                    console.log(`Upload aborted for ${file.name}`)
                    return
                  }
                  console.error('Upload error:', err)
                  const errorMessage = err.message || 'Upload fehlgeschlagen'
                  error(errorMessage)
                  toast({
                    title: 'Upload fehlgeschlagen',
                    description: `Datei ${file.name}: ${errorMessage}`,
                    variant: 'destructive',
                  })
                }
                return {
                  abort: () => {
                    controller.abort()
                    console.log('Upload abort triggered for:', file.name)
                    abort()
                  },
                }
              },
              load: (source, load) => {
                load(source)
              },
              revert: null,
            }}
          />
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
