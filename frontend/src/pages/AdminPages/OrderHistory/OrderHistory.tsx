import "./OrderHistory.css";
import "../../Management.css";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import SnackbarNotification from "../../../components/SnackBar/SnackNotification";
import { getOrderStatusLabel } from "../../../types/orderStatus";
import { useAuth } from "../../../context/AuthContext";
import RefundDialog from "../../../components/RefundDialog/RefundDialog";
import { paymentService } from "../../../services/paymentService";
import { receiptService, type Receipt } from "../../../services/receiptService";

interface Payment {
  paymentId: number;
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: number;
  status: number;
  createdAt: string;
  processedAt?: string;
  transactionId?: string;
}

interface OrderRecord {
  nid: number;
  code?: string;
  total: number;
  workerId?: number;
  dateCreated: string;
  status: number;
  businessId: number;
  statusName?: string;
  payments?: Payment[];
}

export default function OrderHistory() {
  const { businessId } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-12-31");
  const [totalMin, setTotalMin] = useState("0");
  const [totalMax, setTotalMax] = useState("1000");
  const [filterId, setFilterId] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterWorkerId, setFilterWorkerId] = useState("");
  
  // Payment details modal
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedOrderPayments, setSelectedOrderPayments] = useState<Payment[]>([]);
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<Receipt | null>(null);

  // Fetch orders from API on component mount
  useEffect(() => {
    if (businessId) {
      fetchOrders();
    }
  }, [businessId]);

  const fetchOrders = async () => {
    if (!businessId) {
      console.log('No businessId available yet');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching orders for businessId:', businessId);
      const response = await fetch(`/api/orders/business/${businessId}`, {
        credentials: 'include',
      });
      console.log('Response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      console.log('Fetched orders:', data);
      
      // Map status to statusName for display
      const ordersWithStatus = data.map((order: OrderRecord) => ({
        ...order,
        statusName: getOrderStatusLabel(order.status),
      }));
      
      setOrders(ordersWithStatus);
      console.log('Orders set successfully:', ordersWithStatus.length, 'orders');
    } catch (error) {
      console.error('Error fetching orders:', error);
      showSnackbar('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setSnackbar({ open: true, message, type });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter orders based on all criteria
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchQuery === "" || 
      (order.code && order.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.nid.toString().includes(searchQuery);
    
    const matchesDateFrom = new Date(order.dateCreated) >= new Date(dateFrom);
    const matchesDateTo = new Date(order.dateCreated) <= new Date(dateTo);
    const matchesTotal = order.total >= parseFloat(totalMin || "0") && order.total <= parseFloat(totalMax || "999999");
    const matchesId = filterId === "" || order.nid.toString() === filterId;
    const matchesName = filterName === "" || (order.code && order.code.toLowerCase().includes(filterName.toLowerCase()));
    const matchesWorkerId = filterWorkerId === "" || (order.workerId && order.workerId.toString() === filterWorkerId);
    
    const statusMatches = filterState === "" || filterState === (order.statusName?.toLowerCase() || '');

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesTotal && matchesId && matchesName && statusMatches && matchesWorkerId;
  });

  const handleRefundClick = async (orderNid: number) => {
    try {
      // Fetch payments for this order
      const payments = await paymentService.getPaymentsByOrder(orderNid);
      
      // Find the most recent completed payment
      const completedPayment = payments.find(p => p.status === 2); // Status 2 = Completed
      
      if (!completedPayment) {
        showSnackbar('No completed payment found for this order', 'error');
        return;
      }
      
      setSelectedPayment(completedPayment);
      setSelectedOrderId(orderNid);
      setShowRefundDialog(true);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      showSnackbar('Failed to load payment details', 'error');
    }
  };

  const handleShowPaymentDetails = async (orderNid: number) => {
    try {
      const payments = await paymentService.getPaymentsByOrder(orderNid);
      setSelectedOrderPayments(payments);
      
      // Try to fetch receipt for this order
      try {
        const receipt = await receiptService.getReceiptByOrderId(orderNid);
        setSelectedOrderReceipt(receipt);
      } catch (error) {
        console.log('No receipt found for order:', orderNid);
        setSelectedOrderReceipt(null);
      }
      
      setShowPaymentDetails(true);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      showSnackbar('Failed to load payment details', 'error');
    }
  };

  const handleRefundSuccess = async () => {
    setShowRefundDialog(false);
    setSelectedPayment(null);
    setSelectedOrderId(null);
    
    // Refresh orders to show updated status
    await fetchOrders();
    
    showSnackbar('Refund processed successfully', 'success');
  };

  const handleRefundCancel = () => {
    setShowRefundDialog(false);
    setSelectedPayment(null);
    setSelectedOrderId(null);
  };

  return (
    <div className="order-history-page">
      {/* Search bar at top */}
      <div className="search-bar-top">
        <input
          type="text"
          placeholder="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-top"
        />
      </div>

      {/* Main content */}
      <div className="order-history-container">
        {/* Filters sidebar */}
        <div className="filters-container">
          <fieldset className="filter-group">
            <legend>Filters:</legend>

            <div className="filter-item">
              <label>Date</label>
              <div className="date-range">
                <span>from</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-item">
              <label>Total</label>
              <div className="range-inputs">
                <span>min:</span>
                <input
                  type="number"
                  value={totalMin}
                  onChange={(e) => setTotalMin(e.target.value)}
                  style={{ width: "50px" }}
                />
                <span>max:</span>
                <input
                  type="number"
                  value={totalMax}
                  onChange={(e) => setTotalMax(e.target.value)}
                  style={{ width: "50px" }}
                />
              </div>
            </div>

            <div className="filter-item">
              <label>ID:</label>
              <input
                type="text"
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
                placeholder="151627"
              />
            </div>

            <div className="filter-item">
              <label>Name:</label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="ORD2510000001"
              />
            </div>

            <div className="filter-item">
              <label>Worker ID:</label>
              <input
                type="text"
                value={filterWorkerId}
                onChange={(e) => setFilterWorkerId(e.target.value)}
                placeholder="123"
              />
            </div>

            <div className="filter-item">
              <label>State:</label>
              <div className="state-options">
                <label>
                  <input
                    type="radio"
                    name="state"
                    value=""
                    checked={filterState === ""}
                    onChange={(e) => setFilterState(e.target.value)}
                  />
                  all
                </label>
                <label>
                  <input
                    type="radio"
                    name="state"
                    value="paid"
                    checked={filterState === "paid"}
                    onChange={(e) => setFilterState(e.target.value)}
                  />
                  paid
                </label>
                <label>
                  <input
                    type="radio"
                    name="state"
                    value="in progress"
                    checked={filterState === "in progress"}
                    onChange={(e) => setFilterState(e.target.value)}
                  />
                  in progress
                </label>
                <label>
                  <input
                    type="radio"
                    name="state"
                    value="refunded"
                    checked={filterState === "refunded"}
                    onChange={(e) => setFilterState(e.target.value)}
                  />
                  refunded
                </label>
                <label>
                  <input
                    type="radio"
                    name="state"
                    value="partially refunded"
                    checked={filterState === "partially refunded"}
                    onChange={(e) => setFilterState(e.target.value)}
                  />
                  partially refunded
                </label>
                <label>
                  <input
                    type="radio"
                    name="state"
                    value="cancelled"
                    checked={filterState === "cancelled"}
                    onChange={(e) => setFilterState(e.target.value)}
                  />
                  cancelled
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Orders table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Code</th>
                <th>Total</th>
                <th>Worker ID</th>
                <th>Date created</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.nid}>
                    <td>{order.nid}</td>
                    <td>{order.code || '-'}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>{order.workerId || '-'}</td>
                    <td>{new Date(order.dateCreated).toLocaleDateString()}</td>
                    <td>{order.statusName}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleShowPaymentDetails(order.nid)}
                          sx={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            textTransform: 'none',
                          }}
                        >
                          Details
                        </Button>
                        {(order.statusName === "Paid" || order.statusName === "Partially Refunded") && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleRefundClick(order.nid)}
                            disabled={loading}
                            sx={{
                              backgroundColor: '#d32f2f',
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              '&:hover': { backgroundColor: '#bb2929ff' },
                            }}
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    {loading ? 'Loading orders...' : 'No orders found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Dialog */}
      {showRefundDialog && selectedPayment && selectedOrderId && (
        <RefundDialog
          paymentId={selectedPayment.paymentId}
          orderId={selectedOrderId}
          maxAmount={selectedPayment.amount}
          currency={selectedPayment.currency}
          onSuccess={handleRefundSuccess}
          onCancel={handleRefundCancel}
        />
      )}

      {/* Payment Details Modal */}
      {showPaymentDetails && (
        <div className="modal-overlay" onClick={() => setShowPaymentDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <h3 className="modal-title">Payment History</h3>
            
            {/* Receipt Section */}
            {selectedOrderReceipt && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '16px', 
                backgroundColor: 'rgba(62, 68, 179, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(62, 68, 179, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#3e44b3' }}>Receipt Available</h4>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#ccc' }}>
                      Receipt #: {selectedOrderReceipt.receiptNumber}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#ccc' }}>
                      Issued: {new Date(selectedOrderReceipt.issuedAt).toLocaleString()}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#ccc' }}>
                      Total: {selectedOrderReceipt.currency} {selectedOrderReceipt.total.toFixed(2)}
                    </p>
                  </div>
                  {selectedOrderReceipt.stripeReceiptUrl && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => window.open(selectedOrderReceipt.stripeReceiptUrl, '_blank')}
                      sx={{
                        backgroundColor: '#3e44b3',
                        fontSize: '0.8rem',
                        padding: '6px 16px',
                        '&:hover': { backgroundColor: '#2e34a3' },
                      }}
                    >
                      View Receipt
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {selectedOrderPayments.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>No payments found</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.9rem' }}>ID</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.9rem' }}>Amount</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.9rem' }}>Method</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.9rem' }}>Status</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.9rem' }}>Date</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.9rem' }}>Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderPayments.map((payment) => (
                      <tr key={payment.paymentId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{payment.paymentId}</td>
                        <td style={{ 
                          padding: '12px 8px', 
                          fontSize: '0.85rem',
                          color: payment.amount < 0 ? '#ff6b6b' : '#4caf50',
                          fontWeight: 500
                        }}>
                          {payment.amount < 0 ? '-' : ''}{payment.currency} {Math.abs(payment.amount).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>
                          {payment.paymentMethod === 0 ? 'Card' : payment.paymentMethod === 1 ? 'Cash' : 'Gift Card'}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            backgroundColor: 
                              payment.status === 2 ? '#1a4d1a' :
                              payment.status === 4 || payment.status === 5 ? '#4d1a1a' :
                              payment.status === 3 ? '#4d1a1a' : '#3a3a3a',
                            color: 'white'
                          }}>
                            {payment.status === 0 ? 'Pending' :
                             payment.status === 1 ? 'Processing' :
                             payment.status === 2 ? 'Completed' :
                             payment.status === 3 ? 'Failed' :
                             payment.status === 4 ? 'Refunded' :
                             payment.status === 5 ? 'Partial Refund' : 'Unknown'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#999' }}>
                          {new Date(payment.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '0.75rem', color: '#999', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {payment.transactionId || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <Button
                variant="contained"
                onClick={() => setShowPaymentDetails(false)}
                sx={{
                  backgroundColor: '#3e44b3',
                  '&:hover': { backgroundColor: '#2e34a3' },
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      <SnackbarNotification
        open={snackbar.open}
        onClose={closeSnackbar}
        message={snackbar.message}
        type={snackbar.type}
      />
    </div>
  );
}