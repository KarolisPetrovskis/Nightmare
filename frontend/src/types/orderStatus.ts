export const OrderStatus = {
  Paid: 1,
  Refunded: 2,
  InProgress: 3,
  Cancelled: 4,
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export const OrderStatusLabels: Record<number, string> = {
  [OrderStatus.Paid]: 'Paid',
  [OrderStatus.Refunded]: 'Refunded',
  [OrderStatus.InProgress]: 'In Progress',
  [OrderStatus.Cancelled]: 'Cancelled',
};

export const getOrderStatusLabel = (status: number): string => {
  return OrderStatusLabels[status] || `Status ${status}`;
};
