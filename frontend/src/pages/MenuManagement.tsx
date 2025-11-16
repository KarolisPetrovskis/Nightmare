import './MenuManagement.css';
import Button from '@mui/material/Button';
import { useState, useEffect } from "react";

type Dish = {
  id: number;
  name: string;
  price: number;
  discount: number;
  vat: string;
};

export default function MenuManagement() {
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [editableDish, setEditableDish] = useState<Dish | null>(null);
  const [isDirty, setIsDirty] = useState(false);


  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
  };

const handleNewDish = () => {
  const emptyDish: Dish = {
    id: -1,
    name: "",
    price: 0,
    discount: 0,
    vat: "standard"
  };

  setSelectedDish(emptyDish);
  setEditableDish(emptyDish);
  setIsDirty(false);
};




  const dishes: Dish[] = [
    { id: 1, name: 'Spaghetti Carbonara', price: 12.50, discount: 0, vat: 'standard' },
    { id: 2, name: 'Caesar Salad', price: 8.90, discount: 10, vat: 'reduced' },
    { id: 3, name: 'Margherita Pizza', price: 10.00, discount: 0, vat: 'standard' },
    { id: 4, name: 'Grilled Salmon', price: 18.50, discount: 5, vat: 'standard' },
    { id: 5, name: 'Beef Tacos', price: 9.40, discount: 0, vat: 'standard' },
    { id: 6, name: 'Chicken Curry', price: 13.20, discount: 15, vat: 'reduced' },
    { id: 7, name: 'Veggie Burger', price: 11.00, discount: 0, vat: 'reduced' },
    { id: 8, name: 'Sushi Platter', price: 22.00, discount: 5, vat: 'standard' },
    // { id: 9, name: 'French Fries', price: 4.50, discount: 0, vat: 'reduced' },
    // { id: 10, name: 'Chocolate Cake', price: 6.00, discount: 0, vat: 'standard' },
  ];

useEffect(() => {
  if (!editableDish || !selectedDish) return;
  
  const isChanged =
    editableDish.name !== selectedDish.name ||
    editableDish.price !== selectedDish.price ||
    editableDish.discount !== selectedDish.discount ||
    editableDish.vat !== selectedDish.vat;

  setIsDirty(isChanged);
}, [editableDish, selectedDish]);




  const handleDishClick = (dish: Dish) => {
    if (!deleteMode) {
      setSelectedDish(dish);
      setEditableDish({ ...dish });   // copy for editing
      setIsDirty(false);
    }
  };


  const updateField = (key: keyof Dish, value: string | number) => {
    setEditableDish(prev => prev ? { ...prev, [key]: value } : prev);

    if (selectedDish && editableDish) {
      const changed = value !== (selectedDish as any)[key];
      if (changed) setIsDirty(true);
    }
  };


  return (
    <div className="menu-management">

      {/* DISH LIST */}
      <div className="dish-list-container">
        <div className="dish-actions">
          <Button className="dish-action-button new-dish" onClick={handleNewDish}>
  New Dish
</Button>

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
            <div
              key={dish.id}
              className={`dish-card ${selectedDish?.id === dish.id ? "selected" : ""}`}
              onClick={() => handleDishClick(dish)}
            >
              {dish.name}
              {deleteMode && <span className="delete-x">✖</span>}
            </div>
          ))}
        </div>
      </div>

      {/* INFO Container */}
      <div className="info-container">
        <h2 className="section-title">Dish Information</h2>

        <div className="info-grid">
          <div className="info-box">
            <label>Dish Name</label>
            <input
              type="text"
              value={editableDish?.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
            />

          </div>

          <div className="info-box">
            <label>Dish Price (€)</label>
            <input
              type="number"
              placeholder="0.00"
              value={editableDish?.price ?? ""}
              onChange={(e) => updateField("price", parseFloat(e.target.value))}
            />
          </div>

          <div className="info-box">
            <label>Dish Discount (%)</label>
            <input
              type="number"
              placeholder="%"
              value={editableDish?.discount ?? ""}
              onChange={(e) => updateField("discount", parseFloat(e.target.value))}
            />

            <label className="small-label">Expiration Date</label>
            <input type="date" />
          </div>

          <div className="info-box">
            <label>VAT Type</label>
            <select
              value={editableDish?.vat || "standard"}
              onChange={(e) => updateField("vat", e.target.value)}
            >
              <option value="standard">Standard VAT</option>
              <option value="reduced">Reduced VAT</option>
              <option value="none">No VAT</option>
            </select>
          </div>
        </div>

        <Button
          className={`save-button ${isDirty ? "active" : ""}`}
          disabled={!isDirty}
        >
          Save
        </Button>

      </div>

      <div className="option-container"></div>
    </div>
  );
}
