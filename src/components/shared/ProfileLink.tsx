import type { ReactNode } from 'react'
import { navigate } from '../../navigation/router'

type Props = { type: 'player' | 'team'; id: string | number; children: ReactNode }

const ProfileLink = ({ type, id, children }: Props) => {
  const href = `#/${type}/${encodeURIComponent(id)}`
  return <a className="profile-link" href={href} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(href)
  }}>{children}</a>
}

export default ProfileLink
