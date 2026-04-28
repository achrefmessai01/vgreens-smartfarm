export type DateFilter =
  | 'today'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'total';

export function getDateRange(filter: DateFilter): {
  dateFrom?: string;
  dateTo?: string;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayISO = `${year}-${month}-${day}`;

  switch (filter) {
    case 'today':
      return { dateFrom: todayISO, dateTo: todayISO };
    case 'thisWeek': {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = today.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - daysToSubtract);
      const sy = startOfWeek.getFullYear();
      const sm = String(startOfWeek.getMonth() + 1).padStart(2, '0');
      const sd = String(startOfWeek.getDate()).padStart(2, '0');
      return { dateFrom: `${sy}-${sm}-${sd}`, dateTo: todayISO };
    }
    case 'thisMonth': {
      const startOfMonth = new Date(year, now.getMonth(), 1);
      const sy = startOfMonth.getFullYear();
      const sm = String(startOfMonth.getMonth() + 1).padStart(2, '0');
      const sd = String(startOfMonth.getDate()).padStart(2, '0');
      return { dateFrom: `${sy}-${sm}-${sd}`, dateTo: todayISO };
    }
    case 'lastWeek': {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = today.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
      const endOfLastWeek = new Date(today);
      endOfLastWeek.setDate(today.getDate() - daysToSubtract - 1);
      const startOfLastWeek = new Date(endOfLastWeek);
      startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
      const sy = startOfLastWeek.getFullYear();
      const sm = String(startOfLastWeek.getMonth() + 1).padStart(2, '0');
      const sd = String(startOfLastWeek.getDate()).padStart(2, '0');
      const ey = endOfLastWeek.getFullYear();
      const em = String(endOfLastWeek.getMonth() + 1).padStart(2, '0');
      const ed = String(endOfLastWeek.getDate()).padStart(2, '0');
      return { dateFrom: `${sy}-${sm}-${sd}`, dateTo: `${ey}-${em}-${ed}` };
    }
    case 'lastMonth': {
      const lastMonth = new Date(year, now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(year, now.getMonth(), 0);
      const sy = lastMonth.getFullYear();
      const sm = String(lastMonth.getMonth() + 1).padStart(2, '0');
      const sd = String(lastMonth.getDate()).padStart(2, '0');
      const ey = endOfLastMonth.getFullYear();
      const em = String(endOfLastMonth.getMonth() + 1).padStart(2, '0');
      const ed = String(endOfLastMonth.getDate()).padStart(2, '0');
      return { dateFrom: `${sy}-${sm}-${sd}`, dateTo: `${ey}-${em}-${ed}` };
    }
    case 'total':
    default:
      return { dateFrom: undefined, dateTo: undefined };
  }
}
