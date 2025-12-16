import { useState } from 'react';
import Button from '@mui/material/Button';
import { paymentService } from '../../services/paymentService';
import SnackbarNotification from '../SnackBar/SnackNotification';
import '../../pages/Management.css';

interface RefundDialogProps {
  paymentId: number;
  orderId: number;
  maxAmount: number;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RefundDialog({
  paymentId,
  orderId: _orderId,
  maxAmount,
  currency,
  onSuccess,
  onCancel,
}: RefundDialogProps) {
  const [amount, setAmount] = useState<string>(maxAmount.toString());
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    type: 'info',
  });

  const handleRefund = async () => {
    const refundAmount = parseFloat(amount);

    // Validation
    if (!amount || refundAmount <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid refund amount',
        type: 'error',
      });
      return;
    }

    if (refundAmount > maxAmount) {
      setSnackbar({
        open: true,
        message: `Refund amount cannot exceed ${maxAmount.toFixed(2)} ${currency}`,
        type: 'error',
      });
      return;
    }

    if (!reason.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a reason for the refund',
        type: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      await paymentService.refundPayment(paymentId, refundAmount, reason);

      setSnackbar({
        open: true,
        message: 'Refund processed successfully',
        type: 'success',
      });

      // Call success callback after a short delay to show the message
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to process refund',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Process Refund</h3>

        <div className="info-box">
          <label>
            Refund Amount * (Max: {maxAmount.toFixed(2)} {currency})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            max={maxAmount}
            step="0.01"
            disabled={loading}
          />
        </div>

        <div className="info-box">
          <label>Refund Reason *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for refund..."
            rows={4}
            maxLength={500}
            disabled={loading}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#1f1f1f',
              color: 'white',
              fontSize: '1rem',
              width: '100%',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>
            {reason.length}/500 characters
          </div>
        </div>

        <div className="modal-actions">
          <Button
            variant="contained"
            className="modal-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRefund}
            disabled={loading}
            sx={{
              backgroundColor: '#d32f2f',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#bb2929ff' },
              '&.Mui-disabled': {
                backgroundColor: '#555',
                color: '#888',
              },
            }}
          >
            {loading ? 'Processing...' : 'Process Refund'}
          </Button>
        </div>

        <SnackbarNotification
          open={snackbar.open}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          type={snackbar.type}
        />
      </div>
    </div>
  );
}
