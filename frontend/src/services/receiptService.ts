export interface Receipt {
  nid: number;
  orderId: number;
  paymentId: number;
  receiptNumber: string;
  issuedAt: string;
  total: number;
  currency: string;
  stripeReceiptUrl?: string;
  businessId: number;
}

export const receiptService = {
  getReceiptByOrderId: async (orderId: number): Promise<Receipt | null> => {
    try {
      const response = await fetch(`/api/receipts/order/${orderId}`, {
        credentials: 'include',
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch receipt: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  getReceiptByNid: async (nid: number): Promise<Receipt | null> => {
    try {
      const response = await fetch(`/api/receipts/${nid}`, {
        credentials: 'include',
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch receipt: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  getReceiptsByBusinessId: async (businessId: number): Promise<Receipt[]> => {
    const response = await fetch(`/api/receipts/business/${businessId}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch receipts: ${response.statusText}`);
    }
    
    return await response.json();
  },
};
