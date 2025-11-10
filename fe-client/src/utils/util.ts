export function formatCurrencyVND(value: number): string {
  return `${value} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
