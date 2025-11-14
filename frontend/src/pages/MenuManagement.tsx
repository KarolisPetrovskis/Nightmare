import './MenuManagement.css';
import Button from '@mui/material/Button';
import { useState } from "react";

export default function MenuManagement() {
  const [deleteMode, setDeleteMode] = useState(false);

  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
  };

  const dishes = [
    { id: 1, name: 'Spaghetti Carbonara' },
    { id: 2, name: 'Caesar Salad' },
    { id: 3, name: 'Margherita Pizza' },
  ];

  return (
    <div className="menu-management">
      <div className="dish-list-container">

        <div className="dish-actions">
          <Button className="dish-action-button new-dish">New Dish</Button>

          <Button
            className={`dish-action-button delete-dish ${deleteMode ? 'active' : ''}`}
            onClick={toggleDeleteMode}
          >
            Delete Dishes
          </Button>
        </div>

        <h3 className="dish-list-label">Dish List</h3>

        <div className="dish-list">
          {dishes.map((dish) => (
            <div key={dish.id} className="dish-card">
              {dish.name}
              {deleteMode && <span className="delete-x">✖</span>}
            </div>
          ))}
        </div>

      </div>

      {/* --- INFO CONTAINER --- */}
      <div className="info-container">
        <h2 className="section-title">Dish Information</h2>

        <div className="info-grid">
          <div className="info-box">
            <label>Dish Name</label>
            <input type="text" placeholder="Enter dish name" />
          </div>

          <div className="info-box">
            <label>Dish Price (€)</label>
            <input type="number" placeholder="0.00" />
          </div>

          <div className="info-box">
            <label>Dish Discount (%)</label>
            <input type="number" placeholder="%" />
            <label className="small-label">Expiration Date</label>
            <input type="date" />
          </div>

          <div className="info-box">
            <label>VAT Type</label>
            <select>
              <option value="standard">Standard VAT</option>
              <option value="reduced">Reduced VAT</option>
              <option value="none">No VAT</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- OPTION CONTAINER --- */}
      <div className="option-container"></div>

    </div>
  );
}
