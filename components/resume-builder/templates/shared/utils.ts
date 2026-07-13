export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  current: boolean
): string {
  const start = startDate ? formatDate(startDate) : "";
  const end = current ? "Present" : endDate ? formatDate(endDate) : "";
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

export function filterEmpty(items: string[] | undefined): string[] {
  return (items || []).filter((item) => item && item.trim());
}

export function skillProgressValue(index: number, total: number): number {
  if (total <= 1) return 90;
  return Math.max(55, 95 - index * Math.floor(40 / Math.max(total - 1, 1)));
}
