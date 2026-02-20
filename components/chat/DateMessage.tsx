import { DateTime } from 'luxon'

import { dateIsToday, toShortDate } from 'utils/date'

type DateMessageProps = {
  date: DateTime
}

export default function DateMessage({ date }: DateMessageProps) {
  const label = dateIsToday(date) ? "Aujourd'hui" : `Le ${toShortDate(date)}`

  return (
    <div className='text-base-regular text-center mb-3'>
      <p>{label}</p>
    </div>
  )
}