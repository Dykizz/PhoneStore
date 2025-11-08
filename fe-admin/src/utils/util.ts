export function formatCurrencyVND(value: number): string {
  return `${value} VND`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
