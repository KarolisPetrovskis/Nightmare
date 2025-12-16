const API_BASE_URL = 'http://localhost:5087/api';

export interface Order {
  nid: number;
  code: string | null;
  vatId: number;
  status: number;
  total: number;
  businessId: number;
  workerId: number | null;
  dateCreated: string;
}

export interface OrderDetail {
  nid: number;
  orderId: number;
  itemId: number;
  priceWoVat: number;
  priceWtVat: number;
  quantity: number;
}

export interface OrderDetailAddOn {
  nid: number;
  detailId: number;
  ingredientId: number;
  priceWoVat: number;
}

export interface OrderAddOnsDTO {
  ingredientId: number;
  priceWoVat: number;
}

export interface OrderDetailRequest {
  itemId: number;
  priceWoVat: number;
  priceWtVat: number;
  quantity?: number;
  addons?: OrderAddOnsDTO[];
  discountPercent?: number | null;
  originalPriceWtVat?: number | null;
}

export interface OrderCreateDTO {
  code?: string | null;
  vatId: number;
  total: number;
  businessId: number;
  workerId?: number | null;
  orderDetails: OrderDetailRequest[];
}

export interface OrderUpdateDTO {
  statusId?: number;
  total?: number;
}

export interface OrderDetailUpdateDTO {
  priceWoVat?: number;
  priceWtVat?: number;
  quantity?: number;
}

export interface OrderWithDetails {
  order: Order;
  details: OrderDetail[];
  addons: OrderDetailAddOn[];
}

export const ordersApi = {
  // GET /api/orders?page=1&perPage=10&workerId=1&dateCreated=2025-12-14
  getAllOrders: async (
    page: number = 1,
    perPage: number = 10,
    workerId?: number,
    dateCreated?: string
  ): Promise<Order[]> => {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
    });
    if (workerId) params.append('workerId', workerId.toString());
    if (dateCreated) params.append('dateCreated', dateCreated);

    const response = await fetch(`${API_BASE_URL}/orders?${params}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  },

  // POST /api/orders
  createOrder: async (data: OrderCreateDTO): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return await response.json();
  },

  // GET /api/orders/{nid}
  getOrderByNid: async (nid: number): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${nid}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return await response.json();
  },

  // GET /api/orders/item/{orderNid}
  getOrderDetails: async (orderNid: number): Promise<OrderDetail[]> => {
    const response = await fetch(`${API_BASE_URL}/orders/item/${orderNid}`);
    if (!response.ok) throw new Error('Failed to fetch order details');
    return await response.json();
  },

  // GET /api/orders/item/addons/{orderNid}
  getOrderDetailAddOns: async (orderNid: number): Promise<OrderDetailAddOn[]> => {
    const response = await fetch(`${API_BASE_URL}/orders/item/addons/${orderNid}`);
    if (!response.ok) throw new Error('Failed to fetch order detail addons');
    return await response.json();
  },

  // GET /api/orders/business/{businessnid}
  getOrdersByBusinessId: async (businessId: number): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/orders/business/${businessId}`);
    if (!response.ok) throw new Error('Failed to fetch orders by business');
    return await response.json();
  },

  // PUT /api/orders/{nid}
  updateOrder: async (nid: number, data: OrderUpdateDTO): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${nid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update order');
  },

  // DELETE /api/orders/{nid}
  deleteOrder: async (nid: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${nid}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete order');
  },

  // POST /api/orders/{orderNid}/items
  addItemToOrder: async (orderNid: number, item: OrderDetailRequest): Promise<OrderDetail> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderNid}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to add item to order');
    return await response.json();
  },

  // DELETE /api/orders/{orderNid}/items/{detailNid}
  removeItemFromOrder: async (orderNid: number, detailNid: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderNid}/items/${detailNid}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove item from order');
  },

  // PUT /api/orders/{orderNid}/items/{detailNid}
  updateOrderItem: async (orderNid: number, detailNid: number, updates: OrderDetailUpdateDTO): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderNid}/items/${detailNid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update order item');
  },

  // PUT /api/orders/{orderNid}/items/{detailNid}/addons
  updateOrderItemAddons: async (orderNid: number, detailNid: number, addons: OrderAddOnsDTO[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderNid}/items/${detailNid}/addons`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addons),
    });
    if (!response.ok) throw new Error('Failed to update order item addons');
  },

  // Helper function to get order with all details and addons
  getOrderWithDetails: async (orderNid: number): Promise<OrderWithDetails> => {
    const [order, details, addons] = await Promise.all([
      ordersApi.getOrderByNid(orderNid),
      ordersApi.getOrderDetails(orderNid),
      ordersApi.getOrderDetailAddOns(orderNid),
    ]);

    return { order, details, addons };
  },
};
