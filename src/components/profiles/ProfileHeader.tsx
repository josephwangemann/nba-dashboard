import { goBack } from '../../navigation/router'

type Props = { title: string }
const ProfileHeader = ({ title }: Props) => <div className="scoreboard-bar view-bar">
  <h2>{title}</h2><button className="back-button" onClick={() => goBack()}>← Back</button>
</div>

export default ProfileHeader
