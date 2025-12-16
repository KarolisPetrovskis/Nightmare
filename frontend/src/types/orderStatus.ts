export const OrderStatus = {
  Paid: 1,
  Refunded: 2,
  PartiallyRefunded: 3,
  InProgress: 4,
  Cancelled: 5,
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export const OrderStatusLabels: Record<number, string> = {
  [OrderStatus.Paid]: 'Paid',
  [OrderStatus.Refunded]: 'Refunded',
  [OrderStatus.PartiallyRefunded]: 'Partially Refunded',
  [OrderStatus.InProgress]: 'In Progress',
  [OrderStatus.Cancelled]: 'Cancelled',
};

export const getOrderStatusLabel = (status: number): string => {
  return OrderStatusLabels[status] || `Status ${status}`;
};
