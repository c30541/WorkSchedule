export function calcDuration(startTime: number, endTime: number): number {
  const toHours = (t: number) => Math.floor(t / 100) + (t % 100) / 60;
  const s = toHours(startTime);
  const e = toHours(endTime);
  const duration = Math.max(0, parseFloat((e - s).toFixed(2)));
  // 限制最大工時為9小時
  return Math.min(duration, 9);
}

export function formatTime(time: number): string {
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function formatTimeRange(startTime: number, endTime: number): string {
  return `${formatTime(startTime)}-${formatTime(endTime)}`;
}

export function parseDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
}
