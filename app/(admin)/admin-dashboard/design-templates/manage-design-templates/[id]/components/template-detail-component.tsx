'use client'

import { useState, useEffect } from 'react'
import { DesignTemplate, templateSchema, TemplateFormData } from '@/types/design-template'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  Send,
  X,
  ImageIcon,
  Calendar,
  User,
  Sparkles,
  Edit,
  Save,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Globe,
  Share2,
} from 'lucide-react'
import Link from 'next/link'
import {
  updateDesignTemplate,
  updateTemplateName,
  getCategories,
  getTypes,
  submitForApproval,
  unpublishTemplate,
  publishTemplate,
} from '../../../_server-actions/design-templates'
import { useAction } from 'next-safe-action/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/server/supabase/client'

// Schema und Type werden jetzt aus der zentralen types/design-template.ts importiert

interface TemplateDetailComponentProps {
  template: DesignTemplate
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
}

interface Type {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
}

export default function TemplateDetailComponent({ template }: TemplateDetailComponentProps) {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(template.name)
  const [displayName, setDisplayName] = useState(template.name)
  const [isSeoPreviewOpen, setIsSeoPreviewOpen] = useState(false)
  const [creatorDisplayName, setCreatorDisplayName] = useState<string | null>(null)
  const [isLoadingCreator, setIsLoadingCreator] = useState<boolean>(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [types, setTypes] = useState<Type[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [hasInvalidCategory, setHasInvalidCategory] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const { execute: executeUpdate, isPending: isSubmitting } = useAction(updateDesignTemplate, {
    onSuccess: (result) => {
      console.log('Update successful:', result)
      toast({
        title: 'Erfolgreich aktualisiert',
        description: 'Das Design-Template wurde erfolgreich aktualisiert.',
        className: 'border-green-500',
      })
      // Aktualisiere die Seite, um die neuesten Daten zu laden
      router.refresh()
    },
    onError: ({ error }) => {
      console.error('Update error:', error)
      toast({
        title: 'Fehler',
        description: error.serverError || 'Fehler beim Aktualisieren des Design-Templates.',
        variant: 'destructive',
      })
    },
  })

  const { execute: executeUpdateName, isPending: isUpdatingName } = useAction(updateTemplateName, {
    onSuccess: () => {
      toast({
        title: 'Name aktualisiert',
        description: 'Der Template-Name wurde erfolgreich geändert.',
        className: 'border-green-500',
      })
      setIsEditingName(false)
      // Aktualisiere die Seite, um die neuesten Daten zu laden
      router.refresh()
    },
    onError: ({ error }) => {
      // Rollback optimistic update on error
      setDisplayName(template.name)
      toast({
        title: 'Fehler',
        description: error.serverError || 'Fehler beim Aktualisieren des Namens.',
        variant: 'destructive',
      })
    },
  })

  const { execute: executeSubmitForApproval, isPending: isSubmittingForApproval } = useAction(
    submitForApproval,
    {
      onSuccess: () => {
        toast({
          title: 'Erfolgreich eingereicht',
          description: 'Das Template wurde zur Genehmigung eingereicht.',
          className: 'border-green-500',
        })
        // Aktualisiere die Seite, um die neuesten Daten zu laden
        router.refresh()
      },
      onError: ({ error }) => {
        toast({
          title: 'Fehler',
          description: error.serverError || 'Fehler beim Einreichen zur Genehmigung.',
          variant: 'destructive',
        })
      },
    }
  )

  const { execute: executePublish, isPending: isPublishing } = useAction(publishTemplate, {
    onSuccess: () => {
      toast({
        title: 'Erfolgreich veröffentlicht',
        description: 'Das Template wurde veröffentlicht.',
        className: 'border-green-500',
      })
      router.refresh()
    },
    onError: ({ error }) => {
      toast({
        title: 'Fehler',
        description: error.serverError || 'Veröffentlichen nicht möglich.',
        variant: 'destructive',
      })
    },
  })

  const { execute: executeUnpublish, isPending: isUnpublishing } = useAction(unpublishTemplate, {
    onSuccess: () => {
      toast({
        title: 'Erfolgreich zurückgenommen',
        description: 'Das Template ist nicht mehr veröffentlicht.',
        className: 'border-green-500',
      })
      router.refresh()
    },
    onError: ({ error }) => {
      toast({
        title: 'Fehler',
        description: error.serverError || 'Unveröffentlichen nicht möglich.',
        variant: 'destructive',
      })
    },
  })

  // Entfernt: Test-Action und zugehörige UI

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    mode: 'onChange',
    defaultValues: {
      category: template.category || '', // Verwende den ursprünglichen Wert
      type: template.type || '',
      tags: template.tags || '',
      description: template.description || '',
    },
  })

  // Lade Kategorien und Types beim Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Lade Kategorien
        const categoriesResult = await getCategories()
        if (categoriesResult.success) {
          setCategories(categoriesResult.categories)

          // Validiere und setze die Kategorie im Formular
          const validCategory = categoriesResult.categories.find(
            (cat) => cat.slug === template.category
          )
          if (validCategory) {
            // Kategorie existiert, setze sie explizit
            form.setValue('category', template.category)
            setHasInvalidCategory(false)
            console.log('Kategorie gesetzt:', template.category)
          } else {
            // Fallback: Setze die erste verfügbare Kategorie
            if (categoriesResult.categories.length > 0) {
              form.setValue('category', categoriesResult.categories[0].slug)
              setHasInvalidCategory(true)
              console.warn(
                `Kategorie "${template.category}" nicht gefunden. Verwende "${categoriesResult.categories[0].slug}" als Fallback.`
              )
            }
          }

          // Trigger form validation nach dem Setzen der Werte
          form.trigger()
        } else {
          toast({
            title: 'Fehler',
            description: 'Fehler beim Laden der Kategorien.',
            variant: 'destructive',
          })
        }

        // Lade Types
        const typesResult = await getTypes()
        if (typesResult.success) {
          setTypes(typesResult.types)

          // Validiere und setze den Type im Formular
          if (template.type) {
            const validType = typesResult.types.find((type) => type.slug === template.type)
            if (validType) {
              form.setValue('type', template.type)
              console.log('Type gesetzt:', template.type)
            } else {
              console.warn(`Type "${template.type}" nicht gefunden.`)
            }
          }

          // Trigger form validation nach dem Setzen der Werte
          form.trigger()
        } else {
          toast({
            title: 'Fehler',
            description: 'Fehler beim Laden der Types.',
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Fehler',
          description: 'Fehler beim Laden der Daten.',
          variant: 'destructive',
        })
      } finally {
        setIsLoadingCategories(false)
        setIsLoadingTypes(false)
      }
    }

    loadData()
  }, [toast])

  // Lade Creator-Name (username/full_name/email) aus profiles
  useEffect(() => {
    const fetchCreator = async () => {
      if (!template?.user_id) {
        setCreatorDisplayName(template?.creator || null)
        return
      }
      try {
        setIsLoadingCreator(true)
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('username, full_name, email')
          .eq('id', template.user_id)
          .single()
        if (error) {
          setCreatorDisplayName(template?.creator || null)
          return
        }
        const resolved =
          data?.username || data?.full_name || data?.email || template?.creator || null
        setCreatorDisplayName(resolved)
      } catch {
        setCreatorDisplayName(template?.creator || null)
      } finally {
        setIsLoadingCreator(false)
      }
    }
    fetchCreator()
  }, [template])

  // Aktualisiere das Formular, wenn sich template ändert
  useEffect(() => {
    if (template) {
      form.reset({
        category: template.category || '',
        type: template.type || '',
        tags: template.tags || '',
        description: template.description || '',
      })
      setTempName(template.name)
      setDisplayName(template.name)
    }
  }, [template, form])

  const handleSubmit = (data: TemplateFormData) => {
    // Finde die Kategorie-ID basierend auf dem ausgewählten Slug
    const selectedCategory = categories.find((cat) => cat.slug === data.category)
    // Finde die Type-ID basierend auf dem ausgewählten Slug
    const selectedType = types.find((type) => type.slug === data.type)

    // Debug-Logs entfernt

    // Validiere, dass die Kategorie existiert
    if (!selectedCategory) {
      toast({
        title: 'Fehler',
        description: `Kategorie "${data.category}" nicht gefunden. Bitte wählen Sie eine gültige Kategorie.`,
        variant: 'destructive',
      })
      return
    }

    // Validiere, dass der Type existiert (falls ausgewählt)
    if (data.type && !selectedType) {
      toast({
        title: 'Fehler',
        description: `Type "${data.type}" nicht gefunden. Bitte wählen Sie einen gültigen Type.`,
        variant: 'destructive',
      })
      return
    }

    const updateData = {
      id: template.id,
      name: displayName, // Verwende den aktuell angezeigten Namen
      category: data.category,
      categoryId: selectedCategory?.id, // UUID für Foreign Key
      type: data.type,
      typeId: selectedType?.id, // UUID für Foreign Key
      tags: data.tags,
      description: data.description,
      status: template.status || undefined, // Konvertiere null zu undefined
    }

    executeUpdate(updateData)
  }

  const isFormValid = form.formState.isValid

  // Prüfe, ob alle erforderlichen Felder für die Genehmigung ausgefüllt sind
  const isReadyForApproval = () => {
    const formValues = form.getValues()
    return (
      template.name &&
      template.name.trim() !== '' &&
      formValues.description &&
      formValues.description.trim() !== '' &&
      formValues.category &&
      formValues.category.trim() !== '' &&
      template.preview_image_url &&
      template.preview_image_url.trim() !== ''
    )
  }

  const handleSubmitForApproval = () => {
    if (!isReadyForApproval()) {
      toast({
        title: 'Unvollständige Daten',
        description:
          'Bitte füllen Sie alle erforderlichen Felder aus (Name, Beschreibung, Kategorie, Vorschau-Bild).',
        variant: 'destructive',
      })
      return
    }

    executeSubmitForApproval({ id: template.id })
  }

  const handleNameEdit = () => {
    setIsEditingName(true)
    setTempName(template.name)
  }

  const handleNameSave = () => {
    if (tempName.trim() && tempName !== template.name) {
      // Optimistic update - update UI immediately
      setDisplayName(tempName.trim())

      executeUpdateName({
        id: template.id,
        name: tempName.trim(),
      })
    } else {
      setIsEditingName(false)
    }
  }

  const handleNameCancel = () => {
    setIsEditingName(false)
    setTempName(template.name)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleNameSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleNameCancel()
    }
  }

  const generateAIDescription = async () => {
    setIsGeneratingDescription(true)
    try {
      // Hier würde die AI-Beschreibung-Generierung implementiert werden
      // Für jetzt setzen wir eine Beispiel-Beschreibung
      const generatedDescription = `Ein professionelles Design-Template für ${template.category} mit modernem Design und benutzerfreundlicher Oberfläche.`

      form.setValue('description', generatedDescription)
      toast({
        title: 'Beschreibung generiert',
        description: 'Eine neue Beschreibung wurde mit KI generiert.',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Fehler beim Generieren der Beschreibung.',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  return (
    <div className='flex flex-col gap-8 p-6 items-start justify-center max-w-7xl mx-auto w-full'>
      {/* Header mit Navigation */}
      {/* <Button variant='ghost' size='sm' asChild>
            <Link href='/admin-dashboard/design-templates/manage-design-templates'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Zurück zur Übersicht
            </Link>
          </Button> */}
      <div className='flex items-start justify-between w-full'>
        <div className='flex-1 w-full'>
          <div className='flex items-center gap-3 mb-2'>
            {isEditingName ? (
              <div className='flex items-center gap-2'>
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className='text-2xl font-bold border-2 border-blue-500 focus:border-blue-600'
                  placeholder='Template Name'
                  autoFocus
                />
                <Button
                  size='sm'
                  onClick={handleNameSave}
                  disabled={isUpdatingName || !tempName.trim()}
                  className='bg-green-500 hover:bg-green-600 text-white'
                >
                  <Check className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleNameCancel}
                  disabled={isUpdatingName}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <h1 className='text-2xl font-bold'>{displayName}</h1>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={handleNameEdit}
                  className='opacity-60 hover:opacity-100'
                >
                  <Edit className='h-4 w-4' />
                </Button>
              </div>
            )}
            <Badge
              variant={
                template.status === 'published'
                  ? 'default'
                  : template.status === 'draft'
                    ? 'secondary'
                    : template.status === 'waiting_for_approval'
                      ? 'outline'
                      : template.status === 'approved'
                        ? 'default'
                        : template.status === 'rejected'
                          ? 'destructive'
                          : template.status === 'archived'
                            ? 'secondary'
                            : 'secondary'
              }
              className={
                template.status === 'published'
                  ? 'bg-transparent border-green-500 text-green-600 hover:bg-green-50'
                  : template.status === 'draft'
                    ? 'bg-transparent border-gray-500 text-gray-600 hover:bg-gray-50'
                    : template.status === 'waiting_for_approval'
                      ? 'bg-transparent border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                      : template.status === 'approved'
                        ? 'bg-transparent border-blue-500 text-blue-600 hover:bg-blue-50'
                        : template.status === 'rejected'
                          ? 'bg-transparent border-red-500 text-red-600 hover:bg-red-50'
                          : template.status === 'archived'
                            ? 'bg-transparent border-gray-400 text-gray-500 hover:bg-gray-50'
                            : 'bg-transparent border-gray-500 text-gray-600 hover:bg-gray-50'
              }
            >
              {template.status === 'published'
                ? 'Veröffentlicht'
                : template.status === 'draft'
                  ? 'Entwurf'
                  : template.status === 'waiting_for_approval'
                    ? 'Wartet auf Genehmigung'
                    : template.status === 'approved'
                      ? 'Genehmigt'
                      : template.status === 'rejected'
                        ? 'Abgelehnt'
                        : template.status === 'archived'
                          ? 'Archiviert'
                          : 'Entwurf'}
            </Badge>
          </div>
          <div className='flex items-center gap-6 text-sm text-muted-foreground mb-2'>
            <span>ID: {template.id}</span>
            {(creatorDisplayName || isLoadingCreator) && (
              <div className='flex items-center gap-2'>
                <User className='h-4 w-4' />
                <span>Ersteller: {isLoadingCreator ? 'Lade…' : creatorDisplayName}</span>
              </div>
            )}
          </div>

          <div className='flex items-center gap-6 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              <span>
                Erstellt:{' '}
                {template.created_at
                  ? new Date(template.created_at).toLocaleString('de-DE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Unbekannt'}
              </span>
            </div>
            {template.updated_at && (
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>
                  Aktualisiert:{' '}
                  {new Date(template.updated_at).toLocaleString('de-DE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className='flex items-start gap-2 ml-6'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsSeoPreviewOpen(true)}
            className='border-blue-500 text-blue-600 hover:bg-blue-50'
          >
            <Globe className='h-4 w-4 mr-2' />
            SEO/OG Vorschau
          </Button>
          {template.status === 'draft' && (
            <div className='flex flex-col gap-2 min-h-[56px]'>
              <Button
                variant='default'
                size='sm'
                onClick={handleSubmitForApproval}
                disabled={isSubmittingForApproval || !isReadyForApproval()}
              >
                <Send className='h-4 w-4 mr-2' />
                {isSubmittingForApproval ? 'Wird eingereicht...' : 'Zur Genehmigung einreichen'}
              </Button>
              <p
                className={`text-xs text-amber-600 flex items-center gap-1 ${isReadyForApproval() ? 'invisible' : ''}`}
              >
                <svg className='h-3 w-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                Alle Felder müssen ausgefüllt sein
              </p>
            </div>
          )}

          {template.status === 'waiting_for_approval' && (
            <Button variant='outline' size='sm' disabled>
              <Eye className='h-4 w-4 mr-2' />
              Publish
            </Button>
          )}

          {template.status === 'approved' && (
            <Button
              variant='default'
              size='sm'
              className='bg-blue-600 hover:bg-blue-700 text-white'
              onClick={() => executePublish({ id: template.id })}
              disabled={isPublishing}
            >
              <Eye className='h-4 w-4 mr-2' />
              {isPublishing ? 'Veröffentliche…' : 'Veröffentlichen'}
            </Button>
          )}

          {template.status === 'published' && (
            <Button
              variant='default'
              size='sm'
              className='bg-blue-600 hover:bg-blue-700 text-white'
              onClick={() => executeUnpublish({ id: template.id })}
              disabled={isUnpublishing}
            >
              <EyeOff className='h-4 w-4 mr-2' />
              {isUnpublishing ? 'Nehme zurück…' : 'Unveröffentlichen'}
            </Button>
          )}

          {template.status === 'rejected' && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                // TODO: Implement resubmit functionality
                console.log('Resubmit for approval')
              }}
            >
              <Send className='h-4 w-4 mr-2' />
              Erneut einreichen
            </Button>
          )}

          {template.status === 'archived' && (
            <Button variant='outline' size='sm' disabled>
              <Send className='h-4 w-4 mr-2' />
              Archiviert
            </Button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 w-full'>
        {/* Design-Template Übersicht */}
        <div className='space-y-4 w-full'>
          {/* Edit im Editor Button - oben über der Bildvorschau, volle Breite */}
          <div className='flex w-full justify-start'>
            <Button asChild className='w-full'>
              <Link href={`/create-design-template?designTemplateId=${template.id}`}>
                <Edit className='h-4 w-4 mr-2' />
                Design im Editor bearbeiten
              </Link>
            </Button>
          </div>
          {/* Preview Image */}
          <div className='space-y-2'>
            {template.preview_image_url ? (
              <div className='relative'>
                <img
                  src={template.preview_image_url}
                  alt={`${template.name} preview`}
                  className='w-full rounded-lg object-contain border bg-gray-50 dark:bg-gray-900'
                  style={{ maxHeight: 'none' }}
                />
                <Badge className='absolute top-2 right-2 bg-black/80 text-white'>Template</Badge>
                <Button
                  asChild
                  size='lg'
                  className='absolute top-2 left-2 bg-white hover:bg-gray-100 text-gray-800 border-0 h-16 w-16 p-0 rounded-full shadow-lg'
                >
                  <Link href={`/create-design-template?designTemplateId=${template.id}`}>
                    <Edit className='h-16 w-16' />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className='relative h-96 w-full rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border'>
                <div className='text-center'>
                  <ImageIcon className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                  <p className='text-sm text-gray-500'>Kein Vorschaubild verfügbar</p>
                </div>
                <Button
                  asChild
                  size='lg'
                  className='absolute top-2 left-2 bg-white hover:bg-gray-100 text-gray-800 border-0 h-16 w-16 p-0 rounded-full shadow-lg'
                >
                  <Link href={`/create-design-template?designTemplateId=${template.id}`}>
                    <Edit className='h-16 w-16' />
                  </Link>
                </Button>
              </div>
            )}

            {/* Edit-Button wurde in die rechte Spalte über die Metadaten verschoben */}
          </div>

          {/* Template Stats */}
          <div className='space-y-3'>
            <div className='flex items-center gap-4 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='text-gray-600 dark:text-gray-400'>Likes:</span>
                <span>{template.user_likes || 0}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-gray-600 dark:text-gray-400'>Bewertung:</span>
                <span>{template.user_rating || 0}/5</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-gray-600 dark:text-gray-400'>Verwendungen:</span>
                <span>{template.usage_counter || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Template Metadaten Formular */}
        <div className='space-y-12 w-full'>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Template Metadaten
          </h3>

          {/* Verfügbare Auflösungen Vorschau */}
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-gray-700'>Verfügbare Auflösungen</h4>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
              {/* Instagram Story - Aktiv (9:16 Seitenverhältnis) */}
              <div className='border-2 border-pink-500 rounded-lg p-3 text-center hover:scale-105 transition-all duration-200 shadow-lg h-24'>
                <div className='h-12 flex items-center justify-center mb-2'>
                  <div
                    className='bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded flex items-center justify-center'
                    style={{ aspectRatio: '9/16', height: '40px' }}
                  >
                    <span className='text-xs font-bold text-white drop-shadow-sm'>1080x1920</span>
                  </div>
                </div>
                <p className='text-xs text-pink-500 font-medium'>Instagram Story</p>
              </div>

              {/* Instagram Post - Aktiv (1:1 Seitenverhältnis) */}
              <div className='border-2 border-blue-500 rounded-lg p-3 text-center hover:scale-105 transition-all duration-200 shadow-lg h-24'>
                <div className='h-12 flex items-center justify-center mb-2'>
                  <div className='w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded flex items-center justify-center'>
                    <span className='text-xs font-bold text-white drop-shadow-sm'>1080x1080</span>
                  </div>
                </div>
                <p className='text-xs text-blue-500 font-medium'>Instagram Post</p>
              </div>

              {/* Facebook Cover - Deaktiviert (1.91:1 Seitenverhältnis) */}
              <div className='border-2 border-gray-300 rounded-lg p-3 text-center opacity-50 cursor-not-allowed h-24'>
                <div className='h-12 flex items-center justify-center mb-2'>
                  <div
                    className='bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center'
                    style={{ aspectRatio: '1.91/1', height: '40px' }}
                  >
                    <span className='text-xs font-medium text-gray-600'>1200x630</span>
                  </div>
                </div>
                <p className='text-xs text-gray-400'>Facebook Cover</p>
              </div>

              {/* Twitter Header - Deaktiviert (3:1 Seitenverhältnis) */}
              <div className='border-2 border-gray-300 rounded-lg p-3 text-center opacity-50 cursor-not-allowed h-24'>
                <div className='h-12 flex items-center justify-center mb-2'>
                  <div
                    className='bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center'
                    style={{ aspectRatio: '3/1', height: '40px' }}
                  >
                    <span className='text-xs font-medium text-gray-600'>1500x500</span>
                  </div>
                </div>
                <p className='text-xs text-gray-400'>Twitter Header</p>
              </div>

              {/* LinkedIn Post - Aktiv (1.91:1 Seitenverhältnis) */}
              <div className='border-2 border-emerald-500 rounded-lg p-3 text-center hover:scale-105 transition-all duration-200 shadow-lg h-24'>
                <div className='h-12 flex items-center justify-center mb-2'>
                  <div
                    className='bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded flex items-center justify-center'
                    style={{ aspectRatio: '1.91/1', height: '40px' }}
                  >
                    <span className='text-xs font-bold text-white drop-shadow-sm'>1200x627</span>
                  </div>
                </div>
                <p className='text-xs text-emerald-500 font-medium'>LinkedIn Post</p>
              </div>

              {/* YouTube Thumbnail - Deaktiviert (16:9 Seitenverhältnis) */}
              <div className='border-2 border-gray-300 rounded-lg p-3 text-center opacity-50 cursor-not-allowed h-24'>
                <div className='h-12 flex items-center justify-center mb-2'>
                  <div
                    className='bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center'
                    style={{ aspectRatio: '16/9', height: '40px' }}
                  >
                    <span className='text-xs font-medium text-gray-600'>1280x720</span>
                  </div>
                </div>
                <p className='text-xs text-gray-400'>YouTube Thumbnail</p>
              </div>
            </div>
          </div>

          {/* Warnung für ungültige Kategorie */}
          {hasInvalidCategory && (
            <div className='border border-yellow-200 rounded-md p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg className='h-5 w-5 text-yellow-400' viewBox='0 0 20 20' fill='currentColor'>
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-yellow-800'>Kategorie nicht gefunden</h3>
                  <div className='mt-2 text-sm text-yellow-700'>
                    <p>
                      Die ursprüngliche Kategorie "{template.category}" existiert nicht mehr in der
                      Datenbank. Eine gültige Kategorie wurde automatisch ausgewählt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
              {/* Kategorie */}
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingCategories ? 'Lade Kategorien...' : 'Kategorie auswählen'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            <div className='flex items-center gap-2'>
                              {category.icon && <span className='text-sm'>{category.icon}</span>}
                              <span>{category.name}</span>
                              {category.color && (
                                <div
                                  className='w-3 h-3 rounded-full'
                                  style={{ backgroundColor: category.color }}
                                />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingTypes}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingTypes ? 'Lade Types...' : 'Type auswählen (optional)'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type.id} value={type.slug}>
                            <div className='flex items-center gap-2'>
                              <span>{type.name}</span>
                              {type.description && (
                                <span className='text-xs text-muted-foreground'>
                                  - {type.description}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags - Disabled for now */}
              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Tags werden bald verfügbar sein'
                        disabled
                        className='bg-gray-50 text-gray-500'
                      />
                    </FormControl>
                    <FormDescription>Tags-Funktion wird in Kürze implementiert</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Beschreibung */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center justify-between'>
                      <FormLabel>Beschreibung *</FormLabel>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={generateAIDescription}
                        disabled={isGeneratingDescription}
                        className='bg-transparent hover:bg-blue-50 text-blue-600 border-blue-500 hover:border-blue-600'
                      >
                        <Sparkles className='h-4 w-4 mr-2' />
                        {isGeneratingDescription ? 'Generiere...' : 'Mit KI generieren'}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Detaillierte Beschreibung des Templates...'
                        className='min-h-[100px]'
                      />
                    </FormControl>
                    <FormDescription>Mindestens 10 Zeichen erforderlich</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Debug Info & Test-Button entfernt */}

              {/* Submit Button */}
              <Button type='submit' className='w-full' disabled={isSubmitting}>
                <Save className='h-4 w-4 mr-2' />
                {isSubmitting ? 'Speichere...' : 'Änderungen speichern'}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* SEO / Social Preview Dialog */}
      <Dialog open={isSeoPreviewOpen} onOpenChange={setIsSeoPreviewOpen}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Vorschau: Suchmaschinen & Social Cards</DialogTitle>
            <DialogDescription>
              So könnten Title, Description und Bilder in Google und sozialen Netzwerken erscheinen.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const title = displayName?.trim() ? `${displayName}` : 'Template Titel'
            const description =
              (form.getValues('description') || '').trim() || 'Kurze Beschreibung des Templates.'
            const imageUrl = template.preview_image_url || ''
            const canonicalPath = `/browse/${template.id}`

            return (
              <div className='mt-2'>
                <Tabs defaultValue='google'>
                  <TabsList className='mb-3'>
                    <TabsTrigger value='google' className='gap-2'>
                      <Globe className='h-4 w-4' /> Google
                    </TabsTrigger>
                    <TabsTrigger value='og' className='gap-2'>
                      <Share2 className='h-4 w-4' /> Open Graph
                    </TabsTrigger>
                    <TabsTrigger value='twitter' className='gap-2'>
                      <svg viewBox='0 0 24 24' className='h-4 w-4' aria-hidden>
                        <path
                          d='M19.633 7.997c.013.177.013.355.013.533 0 5.443-4.142 11.72-11.72 11.72-2.33 0-4.492-.68-6.313-1.85.33.04.647.053.99.053a8.27 8.27 0 0 0 5.125-1.763 4.136 4.136 0 0 1-3.86-2.866c.257.04.513.066.783.066.38 0 .76-.053 1.114-.146a4.128 4.128 0 0 1-3.31-4.055v-.053c.54.3 1.168.48 1.833.5a4.12 4.12 0 0 1-1.84-3.44c0-.78.21-1.5.58-2.13a11.73 11.73 0 0 0 8.51 4.32 4.661 4.661 0 0 1-.106-.944 4.126 4.126 0 0 1 7.136-2.825 8.19 8.19 0 0 0 2.62-1 4.13 4.13 0 0 1-1.813 2.28 8.29 8.29 0 0 0 2.372-.64 8.88 8.88 0 0 1-2.067 2.13z'
                          fill='currentColor'
                        />
                      </svg>
                      Twitter
                    </TabsTrigger>
                  </TabsList>

                  {/* Google Snippet Preview */}
                  <TabsContent value='google' className='mt-0'>
                    <div className='space-y-2 rounded-lg border bg-white p-4 dark:bg-neutral-900'>
                      <div className='text-[#1a0dab] text-lg leading-tight hover:underline'>
                        {title}
                      </div>
                      <div className='text-[#006621] text-sm'>
                        {typeof window !== 'undefined'
                          ? window.location.origin
                          : 'https://example.com'}
                        {canonicalPath}
                      </div>
                      <div className='text-[#545454] text-sm'>{description}</div>
                    </div>
                  </TabsContent>

                  {/* Open Graph Card Preview */}
                  <TabsContent value='og' className='mt-0'>
                    <div className='rounded-lg border bg-white p-3 dark:bg-neutral-900'>
                      <div className='flex flex-col overflow-hidden rounded-md border'>
                        <div
                          className='bg-gray-100 dark:bg-neutral-800 flex items-center justify-center'
                          style={{ aspectRatio: '1200/630' }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt='Open Graph Preview'
                              className='h-full w-full object-cover'
                            />
                          ) : (
                            <div className='flex h-full w-full items-center justify-center text-sm text-gray-500'>
                              Kein Bild
                            </div>
                          )}
                        </div>
                        <div className='p-4 space-y-1'>
                          <div className='text-xs text-gray-500'>
                            {typeof window !== 'undefined' ? window.location.host : 'example.com'}
                          </div>
                          <div className='text-base font-semibold'>{title}</div>
                          <div className='text-sm text-gray-600 line-clamp-2'>{description}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Twitter Card Preview */}
                  <TabsContent value='twitter' className='mt-0'>
                    <div className='rounded-lg border bg-white p-3 dark:bg-neutral-900'>
                      <div className='flex flex-col overflow-hidden rounded-md border max-w-[600px]'>
                        <div
                          className='bg-gray-100 dark:bg-neutral-800 flex items-center justify-center'
                          style={{ aspectRatio: imageUrl ? '1200/630' : '16/9' }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt='Twitter Card Preview'
                              className='h-full w-full object-cover'
                            />
                          ) : (
                            <div className='flex h-full w-full items-center justify-center text-sm text-gray-500'>
                              Kein Bild
                            </div>
                          )}
                        </div>
                        <div className='p-4 space-y-1'>
                          <div className='text-sm font-semibold'>{title}</div>
                          <div className='text-sm text-gray-600 line-clamp-2'>{description}</div>
                          <div className='text-xs text-gray-500'>
                            {typeof window !== 'undefined' ? window.location.host : 'example.com'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )
          })()}

          <DialogFooter>
            <Button variant='default' onClick={() => setIsSeoPreviewOpen(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
