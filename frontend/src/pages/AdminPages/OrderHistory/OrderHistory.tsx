// INSERT INTO public."Orders" 
// ("Nid", "Code", "VatId", "StatusId", "Total", "DateCreated", "BusinessId", "WorkerId", "Discount")
// VALUES
// -- Row 1
// (1, 'ORD-001', '1', 1, 100.50, '2025-12-14 10:30:00', 12, 201, 5.00),
// -- Row 2
// (2, 'ORD-002', '2', 2, 250.00, '2025-12-13 14:15:00', 12, 202, 10.00),
// -- Row 3
// (3, 'ORD-003', '3', 1, 75.25, '2025-12-12 09:00:00', 12, 203, 0.00),
// -- Row 4
// (4, 'ORD-004', '4', 3, 500.00, '2025-12-10 16:45:00', 12, 201, 20.00),
// -- Row 5
// (5, 'ORD-005', '5', 2, 320.75, '2025-12-11 11:20:00', 12, 204, 15.00);
// Insert this for testing purposes.


import "./OrderHistory.css";
import "../../Management.css";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import SnackbarNotification from "../../../components/SnackBar/SnackNotification";
import { useAuth } from "../../../context/AuthContext";

const REFUNDED_STATUS_ID = 3; 

interface OrderRecord {
  nid: number;
  code?: string;
  total: number;
  workerId?: number;
  dateCreated: string;
  statusId: number;
  businessId: number;
  statusName?: string; // Display name for status
}

export default function OrderHistory() {
  const { businessId } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState<{ [key: number]: string }>({
    1: "Finished",
    2: "Unfinished",
    4: "Refunded",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-12-31");
  const [totalMin, setTotalMin] = useState("0");
  const [totalMax, setTotalMax] = useState("1000");
  const [filterId, setFilterId] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterState, setFilterState] = useState("");

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
      
      // Map statusId to statusName for display
      const ordersWithStatus = data.map((order: OrderRecord) => ({
        ...order,
        statusName: statusMap[order.statusId] || `Status ${order.statusId}`,
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
    const matchesName = filterName === "" || (order.code && order.code.includes(filterName));
    
    const statusMatches = filterState === "" || filterState === (order.statusName?.toLowerCase() || '');

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesTotal && matchesId && matchesName && statusMatches;
  });

  const handleRefund = async (orderNid: number) => {
    try {
      const response = await fetch(`/api/orders/${orderNid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusId: REFUNDED_STATUS_ID,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to refund order');
      
      // Update local state
      setOrders(orders.map(o => 
        o.nid === orderNid 
          ? { ...o, statusId: REFUNDED_STATUS_ID, statusName: 'Refunded' } 
          : o
      ));
      
      showSnackbar('Order refunded successfully', 'success');
    } catch (error) {
      console.error('Error refunding order:', error);
      showSnackbar('Failed to refund order', 'error');
    }
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
                  finished
                </label>
                <label>
                  <input
                    type="radio"
                    name="state"
                    value="unfinished"
                    checked={filterState === "unfinished"}
                    onChange={(e) => setFilterState(e.target.value)}
                  />
                  unfinished
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
                      {order.statusName === "Finished" && (
                        <Button
                          className="refund-btn"
                          variant="contained"
                          size="small"
                          onClick={() => handleRefund(order.nid)}
                          disabled={loading}
                        >
                          Refund
                        </Button>
                      )}
                      {order.statusName === "Refunded" && <span className="refunded-badge">Refunded</span>}
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
    </div>
  );
}