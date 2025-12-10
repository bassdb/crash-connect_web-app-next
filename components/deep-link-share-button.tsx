'use client'

// UI imports
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Share2, Copy, Mail, MessageSquare, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// React imports
import { useState } from 'react'

// Client logic imports
import { createUniversalLink } from '@/lib/deep-links'

interface DeepLinkShareButtonProps {
  path: string
  params?: Record<string, string>
  title?: string
  description?: string
}

/**
 * Komponente zum Teilen von Deep Links
 * Unterstützt Universal Links für iOS/Android und Copy to Clipboard
 */
export function DeepLinkShareButton({
  path,
  params,
  title = 'Teilen',
  description,
}: DeepLinkShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  // Erstelle Universal Link basierend auf der aktuellen Domain
  const getUniversalLink = () => {
    const domain = window.location.host
    return createUniversalLink(domain, path, params)
  }

  const handleCopyLink = async () => {
    const link = getUniversalLink()

    try {
      await navigator.clipboard.writeText(link)
      setIsCopied(true)

      toast({
        title: 'Link kopiert!',
        description: 'Der Link wurde in die Zwischenablage kopiert.',
      })

      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Der Link konnte nicht kopiert werden.',
        variant: 'destructive',
      })
    }
  }

  const handleShareEmail = () => {
    const link = getUniversalLink()
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(
      `${description || ''}\n\n${link}`
    )

    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleShareNative = async () => {
    const link = getUniversalLink()

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: link,
        })

        toast({
          title: 'Erfolgreich geteilt!',
          description: 'Der Link wurde geteilt.',
        })
      } catch (err) {
        // Benutzer hat das Teilen abgebrochen
        if ((err as Error).name !== 'AbortError') {
          toast({
            title: 'Fehler',
            description: 'Das Teilen ist fehlgeschlagen.',
            variant: 'destructive',
          })
        }
      }
    } else {
      // Fallback zu Copy
      handleCopyLink()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Teilen
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Link teilen</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleShareNative}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Über Apps teilen
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyLink}>
          {isCopied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Link kopiert!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Link kopieren
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShareEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Per E-Mail teilen
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <div className="font-medium mb-1">Universal Link</div>
          <div className="truncate font-mono text-[10px]">
            {getUniversalLink()}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}



