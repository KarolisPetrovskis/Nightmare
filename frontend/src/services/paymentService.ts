export interface RefundRequest {
  paymentId: number;
  amount: number;
  reason: string;
}

export interface RefundResponse {
  paymentId: number;
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: number;
  status: number;
  createdAt: string;
  processedAt?: string;
  transactionId?: string;
  errorMessage?: string;
}

export const paymentService = {
  /**
   * Refund a payment (full or partial)
   * @param paymentId - The ID of the payment to refund
   * @param amount - The amount to refund (must be <= original payment amount)
   * @param reason - The reason for the refund
   */
  async refundPayment(
    paymentId: number,
    amount: number,
    reason: string
  ): Promise<RefundResponse> {
    const response = await fetch('/api/payments/refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        paymentId,
        amount,
        reason,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to process refund');
    }

    return await response.json();
  },

  /**
   * Get payment history for an order
   */
  async getPaymentsByOrder(orderId: number): Promise<RefundResponse[]> {
    const response = await fetch(`/api/payments/order/${orderId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    return await response.json();
  },

  /**
   * Get a single payment by ID
   */
  async getPaymentById(paymentId: number): Promise<RefundResponse> {
    const response = await fetch(`/api/payments/${paymentId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }

    return await response.json();
  },
};
