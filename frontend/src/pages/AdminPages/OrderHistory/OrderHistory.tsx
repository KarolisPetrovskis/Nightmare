import "./OrderHistory.css";
import "../../Management.css";
import { useState } from "react";
import Button from "@mui/material/Button";

interface OrderRecord {
  id: number;
  name: string;
  total: number;
  employeeId: number;
  dateCreated: string;
  status: string;
  code: string;
}

// Mock data
const SAMPLE_ORDERS: OrderRecord[] = [
  { id: 50, name: "ORD2510000001", total: 12.10, employeeId: 16185, dateCreated: "2025-10-09", status: "Finished", code: "ORD50" },
  { id: 51, name: "ORD2510000002", total: 12.10, employeeId: 16184, dateCreated: "2025-10-10", status: "Unfinished", code: "ORD51" },
  { id: 49, name: "ORD2510000003", total: 25.60, employeeId: 16184, dateCreated: "2025-10-08", status: "Finished", code: "ORD49" },
];

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderRecord[]>(SAMPLE_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-12-31");
  const [totalMin, setTotalMin] = useState("0");
  const [totalMax, setTotalMax] = useState("1000");
  const [filterId, setFilterId] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterState, setFilterState] = useState("");

  // TODO: On component mount, fetch all orders from API: GET /api/orders
  // TODO: Set orders state with API response data

  // Filter orders based on all criteria specified in the
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchQuery === "" || 
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery);
    
    const matchesDateFrom = new Date(order.dateCreated) >= new Date(dateFrom);
    const matchesDateTo = new Date(order.dateCreated) <= new Date(dateTo);
    const matchesTotal = order.total >= parseFloat(totalMin || "0") && order.total <= parseFloat(totalMax || "999999");
    const matchesId = filterId === "" || order.id.toString() === filterId;
    const matchesName = filterName === "" || order.name.includes(filterName);
    
    const statusMatches = filterState === "" || filterState === order.status.toLowerCase();

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesTotal && matchesId && matchesName && statusMatches;
  });

  const handleRefund = (orderId: number) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "Refunded" } : o));
    // TODO: Call API to update order status
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
                <th>Name</th>
                <th>Total</th>
                <th>Employee ID</th>
                <th>Date created</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.name}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>{order.employeeId}</td>
                  <td>{order.dateCreated}</td>
                  <td>{order.status}</td>
                  <td>
                    {order.status === "Finished" && (
                      <Button
                        className="refund-btn"
                        variant="contained"
                        size="small"
                        onClick={() => handleRefund(order.id)}
                      >
                        Refund
                      </Button>
                    )}
                    {order.status === "Refunded" && <span className="refunded-badge">Refunded</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="no-orders">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}