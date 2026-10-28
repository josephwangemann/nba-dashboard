import { useState } from 'react'

type Props = { onHome?: () => void }

const SiteHeader = ({ onHome }: Props) => {
  const [animation, setAnimation] = useState(0)
  const masthead = <div className="masthead"><span className="eyebrow">THE INTERNET'S COURTSIDE SEAT FOR NBA SCORES AND STATISTICS</span><h1>Nothing <span>But Net</span></h1></div>

  return <header>
    {onHome ? <a className="site-header-link" href="#" aria-label="Nothing But Net home" onClick={event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      onHome()
    }}>{masthead}</a> : masthead}
    <button type="button" className="basketball" aria-label="Replay basketball animation" onClick={() => setAnimation(value => value + 1)}>
      <span key={animation} className="basketball-motion" aria-hidden="true"><span className="basketball-ball">🏀</span></span>
    </button>
  </header>
}

export default SiteHeader
