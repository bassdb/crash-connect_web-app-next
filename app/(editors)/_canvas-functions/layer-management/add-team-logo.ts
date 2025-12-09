import * as fabric from 'fabric'
import type { TeamLogoProps } from './types'

export const addTeamLogo = async ({ fabricCanvas, teamLogo }: TeamLogoProps) => {
  if (!fabricCanvas) return
  let teamLogoImageUrl: string
  console.log('addTeamLogo called with teamLogo:', teamLogo)

  if (!teamLogo) {
    console.log('No team logo provided, using default')
    const teamLogoImageLoader = await fetch(
      'https://wlnwoxboqmwzsqglisez.supabase.co/storage/v1/object/public/team-assets/teams/9fc068a4-350e-4aa0-93ec-db9079f39963/logo/1754313527617_cropped-TBM-Logo-white_3-1536x1536.png'
    )

    teamLogoImageUrl = teamLogoImageLoader.url
    console.log('Default team logo image URL:', teamLogoImageUrl)
  } else {
    teamLogoImageUrl = teamLogo
    console.log('Using provided team logo URL:', teamLogoImageUrl)
  }

  // Erstelle ein Promise, das aufgelöst wird, wenn das Bild geladen ist
  const loadImage = () => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const imageElement = document.createElement('img')
      imageElement.onload = () => resolve(imageElement)
      imageElement.onerror = (err) => reject(err)
      imageElement.src = teamLogoImageUrl
      imageElement.crossOrigin = 'anonymous'
    })
  }

  try {
    const imageElement = await loadImage()
    console.log('Image element:', imageElement)
    const teamLogoImage = new fabric.FabricImage(imageElement, {
      scaleX: 250 / imageElement.width,
      scaleY: 250 / imageElement.height,
      dynamicLayerType: 'team_logo',
      name: 'Team Logo',
    } as any)
    fabricCanvas.add(teamLogoImage)
    fabricCanvas.setActiveObject(teamLogoImage)

    fabricCanvas.centerObject(teamLogoImage)

    // Log dynamicLayerType for verification
    console.log('Team logo added with dynamicLayerType:', (teamLogoImage as any).dynamicLayerType)

    fabricCanvas.renderAll()
  } catch (error) {
    console.error('Error loading image:', error)
    return { error: 'Error loading image' }
  }
}

