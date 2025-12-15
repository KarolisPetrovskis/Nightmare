import './PaymentProcessing.css';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import SnackbarNotification from '../../components/SnackBar/SnackNotification';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCardForm from './StripeCardForm';

const PaymentMethod = {
  Card: 0,
  Cash: 1,
  GiftCard: 2,
} as const;

type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];

const PaymentStatus = {
  Pending: 0,
  Processing: 1,
  Completed: 2,
  Failed: 3,
  Refunded: 4,
  PartiallyRefunded: 5,
} as const;

type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

type PaymentHistoryItem = {
  paymentId: number;
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  status: PaymentStatusType;
  createdAt: string;
  processedAt?: string;
  transactionId?: string;
  errorMessage?: string;
};

type Order = {
  nid: number;
  code: string;
  total: number;
  statusId: number;
  dateCreated: string;
};

export default function PaymentProcessingWithTip() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    PaymentMethod.Card
  );
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [currency] = useState<string>('EUR');
  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingCost, setLoadingCost] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    []
  );
  const [stripePromise, setStripePromise] = useState<any>(null);

  // Tip related states
  const [tip, setTip] = useState<string>('0');
  const [finalCost, setFinalCost] = useState<number | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderId: parseInt(orderId || '0'),
            amount: 1.0,
            currency: 'eur',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.publishableKey) {
            setStripePromise(loadStripe(data.publishableKey));
          }
        }
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
      }
    };

    initializeStripe();
  }, [orderId]);

  // Fetch order details
  useEffect(() => {
    if (orderId) {
      fetchOrder();
      fetchPaymentHistory();
    }
  }, [orderId]);

  // Fetch final cost when tip changes
  useEffect(() => {
    const fetchFinalCost = async () => {
      if (!orderId || !order) return;

      try {
        setLoadingCost(true);
        const response = await fetch(
          `/api/orders/getFinalCost/${orderId}/${tip || 0}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to calculate final cost');
        }

        const data = await response.json();
        setFinalCost(data);
      } catch (error) {
        console.error('Failed to fetch final cost:', error);
        setSnackbar({
          open: true,
          message: 'Failed to calculate final cost',
          type: 'error',
        });
      } finally {
        setLoadingCost(false);
      }
    };

    // Debounce the API call
    const timer = setTimeout(() => {
      fetchFinalCost();
    }, 300);

    return () => clearTimeout(timer);
  }, [tip, orderId, order]);

  const fetchOrder = async () => {
    try {
      setLoadingOrder(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data);

      // Get initial cost with 0 tip
      const costResponse = await fetch(
        `/api/orders/getFinalCost/${orderId}/0`,
        {
          credentials: 'include',
        }
      );

      if (costResponse.ok) {
        const costData = await costResponse.json();
        setFinalCost(costData);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load order details',
        type: 'error',
      });
    } finally {
      setLoadingOrder(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch(`/api/payments/order/${orderId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    }
  };

  const handleProcessPayment = async () => {
    if (!orderId || !finalCost || finalCost <= 0) {
      setSnackbar({
        open: true,
        message: 'Invalid payment amount',
        type: 'error',
      });
      return;
    }

    // For non-card payments, process directly
    if (paymentMethod !== PaymentMethod.Card) {
      setLoading(true);

      try {
        const response = await fetch('/api/payments/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderId: parseInt(orderId),
            amount: finalCost,
            currency: currency,
            paymentMethod: paymentMethod,
            customerEmail: customerEmail || undefined,
            tipAmount: parseFloat(tip) || 0,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Payment processing failed');
        }

        const result = await response.json();

        setSnackbar({
          open: true,
          message: `Payment processed successfully! Transaction ID: ${result.transactionId}`,
          type: 'success',
        });

        // Refresh payment history
        await fetchPaymentHistory();

        // Reset form
        setCustomerEmail('');
        setTip('0');
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.message || 'Payment processing failed',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStripeSuccess = async (transactionId: string) => {
    setSnackbar({
      open: true,
      message: `Payment processed successfully! Transaction ID: ${transactionId}`,
      type: 'success',
    });

    // Refresh payment history
    await fetchPaymentHistory();

    // Reset form
    setCustomerEmail('');
    setTip('0');
  };

  const handleStripeError = (message: string) => {
    setSnackbar({
      open: true,
      message: message,
      type: 'error',
    });
  };

  const handleTipChange = (value: string) => {
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setTip(value);
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethodType) => {
    switch (method) {
      case PaymentMethod.Card:
        return <CreditCardIcon />;
      case PaymentMethod.Cash:
        return <LocalAtmIcon />;
      case PaymentMethod.GiftCard:
        return <CardGiftcardIcon />;
      default:
        return <CreditCardIcon />;
    }
  };

  const getStatusClassName = (status: PaymentStatusType) => {
    switch (status) {
      case PaymentStatus.Completed:
        return 'completed';
      case PaymentStatus.Pending:
      case PaymentStatus.Processing:
        return 'pending';
      case PaymentStatus.Failed:
        return 'failed';
      case PaymentStatus.Refunded:
      case PaymentStatus.PartiallyRefunded:
        return 'refunded';
      default:
        return '';
    }
  };

  const getStatusText = (status: PaymentStatusType) => {
    switch (status) {
      case PaymentStatus.Pending:
        return 'Pending';
      case PaymentStatus.Processing:
        return 'Processing';
      case PaymentStatus.Completed:
        return 'Completed';
      case PaymentStatus.Failed:
        return 'Failed';
      case PaymentStatus.Refunded:
        return 'Refunded';
      case PaymentStatus.PartiallyRefunded:
        return 'Partially Refunded';
      default:
        return 'Unknown';
    }
  };

  if (loadingOrder) {
    return (
      <div className="payment-container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="payment-container">
        <div className="error-message">Order not found</div>
        <Button
          variant="contained"
          className="back-button"
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <Button
          variant="contained"
          className="back-button"
          onClick={() => navigate('/order-management')}
        >
          Back to Orders
        </Button>
        <h1>Payment Processing</h1>
      </div>

      <div className="payment-form">
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Order Number:</span>
            <span>{order.code}</span>
          </div>
          <div className="summary-row">
            <span>Order Date:</span>
            <span>{new Date(order.dateCreated).toLocaleDateString()}</span>
          </div>
          <div className="summary-row">
            <span>Order Total:</span>
            <span>
              {order.total.toFixed(2)} {currency}
            </span>
          </div>
        </div>

        <div className="form-section">
          <h2>Payment Details</h2>

          <div className="form-group">
            <label>
              <AttachMoneyIcon
                style={{ marginRight: '8px', verticalAlign: 'middle' }}
              />
              Tip Amount ({currency})
            </label>
            <input
              type="text"
              value={tip}
              onChange={(e) => handleTipChange(e.target.value)}
              placeholder="Enter tip amount"
              className="tip-input"
            />
            <small className="tip-hint">
              Enter flat tip amount (e.g., 5.50)
            </small>
          </div>

          <div className="cost-summary">
            <div className="cost-row">
              <span>Order Total:</span>
              <span>
                {order.total.toFixed(2)} {currency}
              </span>
            </div>
            <div className="cost-row">
              <span>Tip:</span>
              <span>
                {(parseFloat(tip) || 0).toFixed(2)} {currency}
              </span>
            </div>
            <div className="cost-row total-cost">
              <span>Final Amount to Pay:</span>
              <span className="final-amount">
                {loadingCost ? (
                  <span className="loading-text">Calculating...</span>
                ) : (
                  <strong>
                    {finalCost !== null ? finalCost.toFixed(2) : '0.00'}{' '}
                    {currency}
                  </strong>
                )}
              </span>
            </div>
            <div className="cost-note">
              <small>Final amount is calculated by the server</small>
            </div>
          </div>

          <div className="form-group">
            <label>Customer Email (Optional)</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-method-options">
              <button
                className={`payment-method-btn ${
                  paymentMethod === PaymentMethod.Card ? 'selected' : ''
                }`}
                onClick={() => setPaymentMethod(PaymentMethod.Card)}
              >
                <CreditCardIcon />
                <span>Card</span>
              </button>
              <button
                className={`payment-method-btn ${
                  paymentMethod === PaymentMethod.Cash ? 'selected' : ''
                }`}
                onClick={() => setPaymentMethod(PaymentMethod.Cash)}
              >
                <LocalAtmIcon />
                <span>Cash</span>
              </button>
              <button
                className={`payment-method-btn ${
                  paymentMethod === PaymentMethod.GiftCard ? 'selected' : ''
                }`}
                onClick={() => setPaymentMethod(PaymentMethod.GiftCard)}
              >
                <CardGiftcardIcon />
                <span>Gift Card</span>
              </button>
            </div>
          </div>

          {/* Stripe Card Payment Form */}
          {paymentMethod === PaymentMethod.Card &&
            stripePromise &&
            orderId &&
            finalCost && (
              <Elements stripe={stripePromise}>
                <StripeCardForm
                  amount={finalCost.toString()}
                  currency={currency}
                  orderId={orderId}
                  customerEmail={customerEmail}
                  tipAmount={parseFloat(tip) || 0}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              </Elements>
            )}
        </div>

        {/* Show regular payment button for non-card payments */}
        {paymentMethod !== PaymentMethod.Card && finalCost && (
          <div className="payment-actions">
            <button
              className="btn-pay"
              onClick={handleProcessPayment}
              disabled={loading || !finalCost || finalCost <= 0 || loadingCost}
            >
              {loading
                ? 'Processing...'
                : `Pay ${finalCost.toFixed(2)} ${currency}`}
            </button>
            <button
              className="btn-cancel"
              onClick={() => navigate('/order-management')}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="payment-history">
        <h2>Payment History</h2>
        {paymentHistory.length > 0 ? (
          <div className="payment-list">
            {paymentHistory.map((payment) => (
              <div key={payment.paymentId} className="payment-item">
                <div className="payment-info">
                  <div className="transaction-id">
                    {getPaymentMethodIcon(payment.paymentMethod)}{' '}
                    {payment.transactionId || 'N/A'}
                  </div>
                  <div className="payment-date">
                    {new Date(payment.createdAt).toLocaleString()} •{' '}
                    {payment.amount.toFixed(2)} {payment.currency}
                  </div>
                </div>
                <div
                  className={`payment-status ${getStatusClassName(
                    payment.status
                  )}`}
                >
                  {getStatusText(payment.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-payments">No payment history available</div>
        )}
      </div>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </div>
  );
}
