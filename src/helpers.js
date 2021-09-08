
// Returns two Date objects representing last Sunday at midnight and next Saturday at midnight
// Calculates frm the given input date.
const getWeekBounds = date => {
  const daysSinceSunday = date.getDay(); // Returns 0 for sunday, 1 for Monday, etc
  const msDayMultiplier = 1000*60*60*24;
  const msSinceSunday = msDayMultiplier * daysSinceSunday;
  const lastSundayMs = date.valueOf() - msSinceSunday;
  const nextSaturdayMs = lastSundayMs + (msDayMultiplier * 6);
  const lastSunday = new Date(lastSundayMs);
  const nextSaturday = new Date(nextSaturdayMs)
  lastSunday.setHours(0, 0, 0, 0);
  nextSaturday.setHours(23, 59, 59, 999)
  return { lastSunday, nextSaturday };
}

module.exports = {
  getWeekBounds
}