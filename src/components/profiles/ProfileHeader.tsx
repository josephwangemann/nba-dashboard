import { goBack } from '../../navigation/router'

type Props = { title: string }
const ProfileHeader = ({ title }: Props) => <div className="scoreboard-bar view-bar">
  <button className="back-button" onClick={() => goBack()}>← Back</button><h2>{title}</h2>
</div>

export default ProfileHeader
