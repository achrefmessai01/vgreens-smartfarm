// A batch's human-readable identifier: <varietyLetters>_<DDMMYYYY>, e.g. variety
// "Alma Karima" planted on 2001-08-08 -> "AK_08082001". Generated once at batch
// creation (frozen afterwards) and derived from the batch's variety and planting
// date. See VSL-198.

// Uppercase initials of each word in the variety name, keeping only letters and
// digits. "Alma Karima" -> "AK", "Red Sweet Pepper" -> "RSP", "Cherry" -> "C".
function varietyLetters(variety: string): string {
  return (variety ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

// Zero-padded day and month with a four-digit year and no separators.
// Reads the YYYY-MM-DD parts directly from a date-only string (or UTC parts of a
// Date) so a "date" column value isn't shifted by the local timezone.
function formatDateDDMMYYYY(plantingDate: string | Date): string {
  let year: string;
  let month: string;
  let day: string;

  if (typeof plantingDate === 'string') {
    const [y, m, d] = plantingDate.slice(0, 10).split('-');
    year = y ?? '';
    month = m ?? '';
    day = d ?? '';
  } else {
    year = String(plantingDate.getUTCFullYear());
    month = String(plantingDate.getUTCMonth() + 1).padStart(2, '0');
    day = String(plantingDate.getUTCDate()).padStart(2, '0');
  }

  return `${day}${month}${year}`;
}

export function buildBatchNumber(
  variety: string,
  plantingDate: string | Date,
): string {
  return `${varietyLetters(variety)}_${formatDateDDMMYYYY(plantingDate)}`;
}
