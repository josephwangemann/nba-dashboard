export const parseFavoriteTeams = (value: string | null): string[] => {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]')
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === 'string' && /^\d+$/.test(id)))] : []
  } catch {
    return []
  }
}

type TeamGame = { homeTeam: { teamId: number }; awayTeam: { teamId: number } }

export const prioritizeFavoriteGames = <T extends TeamGame>(games: T[], favoriteTeams: string[]): T[] => {
  const favorites = new Set(favoriteTeams)
  const priority = (game: T) => Number(favorites.has(String(game.homeTeam.teamId)) || favorites.has(String(game.awayTeam.teamId)))
  return [...games].sort((a, b) => priority(b) - priority(a))
}
