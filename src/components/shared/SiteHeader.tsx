type Props = { onHome?: () => void }

const SiteHeader = ({ onHome }: Props) => {
  const header = <header>
    <div className="masthead"><span className="eyebrow">THE INTERNET'S COURTSIDE SEAT FOR NBA SCORES AND STATISTICS</span><h1>Nothing <span>But Net</span></h1></div>
    <span className="basketball" aria-hidden="true">🏀</span>
  </header>

  return onHome ? <a className="site-header-link" href="#" aria-label="Nothing But Net home" onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onHome()
  }}>{header}</a> : header
}

export default SiteHeader
