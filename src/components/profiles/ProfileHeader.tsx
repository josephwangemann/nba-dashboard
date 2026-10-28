import { goBack } from '../../navigation/router'
import BackButton from '../shared/BackButton'

type Props = { title: string }
const ProfileHeader = ({ title }: Props) => <div className="scoreboard-bar view-bar">
  <BackButton onClick={() => goBack()} /><h2>{title}</h2>
</div>

export default ProfileHeader
