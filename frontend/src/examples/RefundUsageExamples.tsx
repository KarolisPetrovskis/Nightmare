/**
 * STRIPE REFUND IMPLEMENTATION GUIDE
 * ====================================
 * 
 * The refund system is already fully implemented in the backend.
 * Here's how to use it:
 */

// Example 1: Using the payment service directly
import { paymentService } from '../services/paymentService';

async function processFullRefund() {
  try {
    const result = await paymentService.refundPayment(
      12345, // Payment ID
      50.00, // Amount to refund (full amount)
      'Customer requested refund'
    );
    
    console.log('Refund successful:', result);
    // Result includes:
    // - paymentId: new refund payment record ID
    // - amount: negative value (e.g., -50.00)
    // - status: 4 (Refunded) or 5 (PartiallyRefunded)
    // - transactionId: Stripe refund ID (starts with "re_")
  } catch (error) {
    console.error('Refund failed:', error.message);
  }
}

// Example 2: Partial refund
async function processPartialRefund() {
  try {
    const result = await paymentService.refundPayment(
      12345,  // Payment ID
      25.00,  // Partial amount (e.g., half of 50.00)
      'Partial refund for damaged item'
    );
    
    console.log('Partial refund successful:', result);
  } catch (error) {
    console.error('Partial refund failed:', error.message);
  }
}

// Example 3: Using the RefundDialog component
import { useState } from 'react';
import RefundDialog from '../components/RefundDialog/RefundDialog';

function PaymentHistoryPage() {
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const handleRefundClick = (payment: any) => {
    // Only allow refunds for completed payments
    if (payment.status === 2) { // Completed
      setSelectedPayment(payment);
      setShowRefundDialog(true);
    }
  };

  const handleRefundSuccess = () => {
    setShowRefundDialog(false);
    setSelectedPayment(null);
    // Refresh payment list
    fetchPayments();
  };

  return (
    <div>
      {/* Payment list */}
      {payments.map(payment => (
        <div key={payment.paymentId}>
          <span>Payment #{payment.paymentId}</span>
          <span>{payment.amount} {payment.currency}</span>
          {payment.status === 2 && (
            <button onClick={() => handleRefundClick(payment)}>
              Refund
            </button>
          )}
        </div>
      ))}

      {/* Refund Dialog */}
      {showRefundDialog && selectedPayment && (
        <RefundDialog
          paymentId={selectedPayment.paymentId}
          maxAmount={selectedPayment.amount}
          currency={selectedPayment.currency}
          onSuccess={handleRefundSuccess}
          onCancel={() => setShowRefundDialog(false)}
        />
      )}
    </div>
  );
}

/**
 * IMPORTANT NOTES:
 * ================
 * 
 * 1. Only COMPLETED payments (status = 2) can be refunded
 * 2. Refund amount must be > 0 and <= original payment amount
 * 3. For Stripe payments (card), the refund is processed through Stripe API
 * 4. For other payment methods (cash, gift card), only a refund record is created
 * 5. Refunds create a new payment record with negative amount
 * 6. Original payment status changes to:
 *    - Refunded (4) if full amount refunded
 *    - PartiallyRefunded (5) if partial amount refunded
 * 
 * PAYMENT STATUS CODES:
 * =====================
 * 0 = Pending
 * 1 = Processing
 * 2 = Completed
 * 3 = Failed
 * 4 = Refunded
 * 5 = PartiallyRefunded
 * 
 * PAYMENT METHOD CODES:
 * =====================
 * 0 = Card (Stripe)
 * 1 = Cash
 * 2 = GiftCard
 */
