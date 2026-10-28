type Props = { onClick: () => void }

const BackButton = ({ onClick }: Props) => <button type="button" className="back-button" onClick={onClick}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5m6-6-6 6 6 6" />
  </svg>
  <span>Back</span>
</button>

export default BackButton
