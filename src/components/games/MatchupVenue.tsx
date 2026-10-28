import { useEffect, useRef, useState } from 'react'
import { useScoreboard } from '../../api/queries'

type Props = { gameId: string; date: string }

const MatchupVenue = ({ gameId, date }: Props) => {
  const ref = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window))
  useEffect(() => {
    if (!ref.current) return
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect() }
    }, { rootMargin: '200px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  const { data, isPending } = useScoreboard(date, visible, false)
  const venue = data?.games.find(game => game.gameId === gameId)?.venue
  return <span ref={ref}>{venue || (isPending ? 'Loading venue…' : 'Venue unavailable')}</span>
}

export default MatchupVenue
