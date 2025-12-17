import { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
} from '@stripe/react-stripe-js';
import './StripeCardForm.css';

type StripeCardFormProps = {
  amount: string;
  currency: string;
  orderId: string;
  customerEmail: string;
  tip?: string;
  onSuccess: (transactionId: string) => void;
  onError: (message: string) => void;
};

export default function StripeCardForm({
  amount,
  currency,
  orderId,
  customerEmail,
  tip,
  onSuccess,
  onError,
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      onError('Please enter a valid amount');
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create payment intent on backend
      const createIntentResponse = await fetch(
        '/api/payments/create-payment-intent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderId: parseInt(orderId),
            amount: parseFloat(amount),
            currency: currency,
            tip: tip ? parseFloat(tip) : undefined,
          }),
        }
      );
      console.log('Create Intent Response:', tip, parseFloat(tip ?? '0'));

      if (!createIntentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await createIntentResponse.json();

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: customerEmail || undefined,
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Step 3: Record payment in backend
        const processResponse = await fetch('/api/payments/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderId: parseInt(orderId),
            amount: parseFloat(amount),
            currency: currency,
            paymentMethod: 0, // Card
            customerEmail: customerEmail || undefined,
            paymentIntentId: paymentIntent.id,
            tip: tip ? parseFloat(tip) : undefined,
          }),
        });

        if (!processResponse.ok) {
          throw new Error('Failed to record payment');
        }

        const result = await processResponse.json();
        onSuccess(result.transactionId);
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (error: any) {
      onError(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'rgba(255, 255, 255, 0.87)',
        backgroundColor: '#2d2d2d',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      invalid: {
        color: '#ff5b5b',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Card Details</label>
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#2d2d2d', 
          borderRadius: '4px',
          border: '1px solid #3a3a3a'
        }}>
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <button
        type="submit"
        className="btn-pay"
        disabled={!stripe || processing}
        style={{ width: '100%', marginTop: '20px' }}
      >
        {processing ? 'Processing...' : `Pay ${parseFloat(amount).toFixed(2)} ${currency}`}
      </button>
    </form>
  );
}
