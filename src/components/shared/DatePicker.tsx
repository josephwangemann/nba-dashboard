import { useState } from 'react'

type Props = { selectedDate: string; onDateChange: (date: string) => void }

const DatePicker = ({ selectedDate, onDateChange }: Props) => {
  const [currentYear] = useState(() => String(new Date().getFullYear()))

  return (
    <label className="date-picker">
      <span>{new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', ...(selectedDate.slice(0, 4) !== currentYear ? { year: 'numeric' } : {}) }).format(new Date(`${selectedDate}T12:00:00`))} <span aria-hidden="true">▾</span></span>
      <input
        type="date"
        aria-label="Choose game date"
        value={selectedDate}
        onClick={event => event.currentTarget.showPicker?.()}
        onChange={event => {
          if (event.target.value && event.target.value !== selectedDate) {
            onDateChange(event.target.value)
          }
        }}
      />
    </label>
  )
}

export default DatePicker
