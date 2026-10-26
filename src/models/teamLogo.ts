export type TeamBranding = { logo?: string; logos?: { href: string; rel?: string[] }[] }

export const getTeamLogo = (team: TeamBranding): string | undefined =>
  team.logos?.find(logo => logo.rel?.includes('dark'))?.href ?? team.logo ?? team.logos?.[0]?.href
