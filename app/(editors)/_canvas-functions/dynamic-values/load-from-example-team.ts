import useDynamicValuesStore from '@/app/(editors)/_hooks/useDynamicValuesStore'
import type { TeamColor } from '@/types/design-template'

/**
 * Loads team values from an example team into preview values
 * Updates team name, logo, colors, and selected team ID
 * User values remain unchanged
 * @param teamId - ID of the selected team
 * @param teamName - Name of the team
 * @param teamLogoUrl - URL of the team logo (or null)
 * @param colors - Array of team colors
 */
export function loadFromExampleTeam(
  teamId: string,
  teamName: string,
  teamLogoUrl: string | null,
  colors: TeamColor[]
): void {
  const store = useDynamicValuesStore.getState()
  store._loadFromExampleTeam(teamId, teamName, teamLogoUrl, colors)
}

