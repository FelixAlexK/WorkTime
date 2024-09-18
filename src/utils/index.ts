export const getLocalTimeString = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString(undefined, { minute: '2-digit', hour: '2-digit' })
}

export const getLocalDateString = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
}

export const getWorktime = (timeInMs: number) => {
  // Convert milliseconds to seconds
  const totalSeconds = Math.floor(timeInMs / 1000)

  // Extract hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  // Format components to two digits
  const formattedHours = String(hours).padStart(2, '0')
  const formattedMinutes = String(minutes).padStart(2, '0')

  // Return formatted string
  return `${formattedHours}:${formattedMinutes}`
}

export const convertToTimestamp = (dateString: string) => {
  const date = new Date(dateString)
  return date.getTime()
}

export const checkIfDateIsInFuture = (date: Date): boolean => {
  const currentDate = new Date()

  // Compare only year, month, and day
  const currentYearMonthDay =
    currentDate.getFullYear() * 10000 + (currentDate.getMonth() + 1) * 100 + currentDate.getDate()

  const inputYearMonthDay =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()

  return inputYearMonthDay > currentYearMonthDay
}

export const allDatesEqual = (arr: string[]) => {
  if (arr.length === 0) return true // Empty array is considered equal

  const firstDate = new Date(arr[0]).setHours(0, 0, 0, 0) // Normalize to start of day

  return arr.every((item) => {
    const itemDate = new Date(item).setHours(0, 0, 0, 0)
    return itemDate === firstDate
  })
}
