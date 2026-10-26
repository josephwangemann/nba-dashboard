type Props = { src?: string; size?: number }

const TeamLogo = ({ src, size = 28 }: Props) => src ? <img
  key={src}
  className="team-logo-inline"
  src={src}
  alt=""
  width={size}
  height={size}
  loading="lazy"
  decoding="async"
  onError={event => { event.currentTarget.hidden = true }}
/> : null

export default TeamLogo
