import { useState } from 'react'
import { shiftDate, today } from '../../utils/date'

type Props = { selectedDate: string; onDateChange: (date: string) => void }

const DatePicker = ({ selectedDate, onDateChange }: Props) => {
  const [currentYear] = useState(() => String(new Date().getFullYear()))

  return (
    <div className="date-navigation" role="group" aria-label="Game date navigation">
      <button type="button" className="date-nav-button date-nav-arrow" aria-label="Previous day" onClick={() => onDateChange(shiftDate(selectedDate, -1))}>←</button>
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
      <button type="button" className="date-nav-button date-nav-arrow" aria-label="Next day" onClick={() => onDateChange(shiftDate(selectedDate, 1))}>→</button>
      <button type="button" className="date-nav-button" disabled={selectedDate === today()} onClick={() => onDateChange(today())}>Today</button>
    </div>
  )
}

export default DatePicker
