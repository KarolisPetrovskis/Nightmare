import './MenuManagement.css';
import Button from '@mui/material/Button';
import { useState, useEffect } from "react";

type Option = {
  id: number;
  name: string;
  price: number;
};

type OptionTree = {
  id: number;
  name: string;
  options: Option[];
};

type Dish = {
  id: number;
  name: string;
  price: number;
  discount: number;
  discountExpiration: string;
  vat: string;

  optionTrees: OptionTree[];
};



export default function MenuManagement() {
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [editableDish, setEditableDish] = useState<Dish | null>(null);
  const [dishDirty, setDishDirty] = useState(false);
  const [optionsDirty, setOptionsDirty] = useState(false);



  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
  };

  const handleNewDish = () => {
    const emptyDish: Dish = {
      id: -1,
      name: "",
      price: 0,
      discount: 0,
      discountExpiration: "",
      vat: "standard",
      optionTrees: []
    };

    setSelectedDish(emptyDish);
    setEditableDish(emptyDish);
    setDishDirty(false);
  };


  const [dishes, setDishes] = useState<Dish[]>([
    {
      id: 1,
      name: 'Spaghetti Carbonara',
      price: 12.50,
      discount: 0,
      discountExpiration: "",
      vat: 'standard',
      optionTrees: [
        {
          id: 101,
          name: "Choose Pasta Size",
          options: [
            { id: 1001, name: "Regular", price: 0 },
            { id: 1002, name: "Large", price: 2.00 },
          ]
        },
        {
          id: 102,
          name: "Extra Toppings",
          options: [
            { id: 1003, name: "Parmesan", price: 0.50 },
            { id: 1004, name: "Bacon", price: 1.00 }
          ]
        }
      ]
    },

    {
      id: 2,
      name: 'Caesar Salad',
      price: 8.90,
      discount: 10,
      discountExpiration: "2025-01-10",
      vat: 'reduced',
      optionTrees: [
        {
          id: 201,
          name: "Add Protein",
          options: [
            { id: 2001, name: "Chicken", price: 2.00 },
            { id: 2002, name: "Shrimp", price: 3.50 }
          ]
        }
      ]
    },

    {
      id: 3,
      name: 'Margherita Pizza',
      price: 10.00,
      discount: 0,
      discountExpiration: "",
      vat: 'standard',
      optionTrees: [
        {
          id: 301,
          name: "Choose Crust",
          options: [
            { id: 3001, name: "Thin Crust", price: 0 },
            { id: 3002, name: "Thick Crust", price: 1.00 }
          ]
        },
        {
          id: 302,
          name: "Extra Cheese",
          options: [
            { id: 3003, name: "Mozzarella", price: 1.20 },
            { id: 3004, name: "Cheddar", price: 1.00 }
          ]
        }
      ]
    }
  ]);



  useEffect(() => {
    if (!editableDish || !selectedDish) return;

    const simpleChanged =
      editableDish.name !== selectedDish.name ||
      editableDish.price !== selectedDish.price ||
      editableDish.discount !== selectedDish.discount ||
      editableDish.discountExpiration !== selectedDish.discountExpiration ||
      editableDish.vat !== selectedDish.vat;

    const treesChanged = JSON.stringify(editableDish.optionTrees) !== JSON.stringify(selectedDish.optionTrees);

    setDishDirty(simpleChanged || treesChanged);
  }, [editableDish, selectedDish]);


  const handleSave = () => {
    if (!editableDish) return;

    if (editableDish.id === -1) {
      // Create a new ID
      const newDish = { ...editableDish, id: Date.now() };

      setDishes(prev => [...prev, newDish]);
      setSelectedDish(newDish);
    } else {
      // Editing an existing dish
      setDishes(prev =>
        prev.map(d => d.id === editableDish.id ? editableDish : d)
      );
    }

    setDishDirty(false);
    setOptionsDirty(false);
  };


  const handleDishClick = (dish: Dish) => {
    if (!deleteMode) {
      setSelectedDish(dish);
      setEditableDish({ ...dish });
      setDishDirty(false);
    }
  };
  

  

  const updateField = (key: keyof Dish, value: string | number) => {
    setEditableDish(prev => prev ? { ...prev, [key]: value } : prev);

    if (selectedDish && editableDish) {
      const changed = value !== (selectedDish as any)[key];
      if (changed) setDishDirty(true);
    }
  };


  return (
    <div className="menu-management">

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

      <div className="info-container">
        <h2 className="section-title">Dish Information</h2>
        {!editableDish ? (
          <p style={{ opacity: 0.5 }}>Select or create a dish.</p>
        ) : (
          <>
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
                <input
                  type="date"
                  value={editableDish?.discountExpiration || ""}
                  onChange={(e) => updateField("discountExpiration", e.target.value)}
                />

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
              className={`save-button ${dishDirty || optionsDirty ? "active" : ""}`}
              disabled={!(dishDirty || optionsDirty)}
              onClick={handleSave}
            >
              Save
            </Button>

          </>
        )}
      </div>

      <div className="option-container">
        {!editableDish ? (
          <></>
        ) : (
          <>
            <Button
              className="option-tree-button dish-action-button new-dish"
              onClick={() => {
                const newTree = {
                  id: Date.now(),
                  name: "",
                  options: []
                };
                setEditableDish(prev =>
                  prev ? { ...prev, optionTrees: [...prev.optionTrees, newTree] } : prev
                );
                setOptionsDirty(true);
              }}
            >
              + Add Option Tree
            </Button></>
        )}
        <h2 className="section-title">Options</h2>

        {!editableDish ? (
          <p style={{ opacity: 0.5, marginTop: 0 }}>Select a dish to view options.</p>
        ) : (
          <>


            <div className="option-tree-list">
              {editableDish.optionTrees.map((tree, treeIndex) => (
                <div key={tree.id} className="option-tree-box">
                  <div className="option-tree-header">
                    <input
                      type="text"
                      value={tree.name}
                      placeholder="Option Tree Name"
                      onChange={(e) => {
                        const updated = [...editableDish.optionTrees];
                        updated[treeIndex].name = e.target.value;
                        setEditableDish(prev => prev ? { ...prev, optionTrees: updated } : prev);
                        setOptionsDirty(true);
                      }}
                    />
                    <button
                      className="delete-tree"
                      onClick={() => {
                        const updated = editableDish.optionTrees.filter(t => t.id !== tree.id);
                        setEditableDish(prev => prev ? { ...prev, optionTrees: updated } : prev);
                        setOptionsDirty(true);
                      }}
                    >
                      ✖
                    </button>
                  </div>

                  <div className="option-list">
                    {tree.options.map((opt, optIndex) => (
                      <div key={opt.id} className="option-row">
                        <input
                          type="text"
                          value={opt.name}
                          placeholder="Option name"
                          onChange={(e) => {
                            const updated = [...editableDish.optionTrees];
                            updated[treeIndex].options[optIndex].name = e.target.value;
                            setEditableDish(prev => prev ? { ...prev, optionTrees: updated } : prev);
                            setOptionsDirty(true);
                          }}
                        />

                        <input
                          type="number"
                          value={opt.price}
                          placeholder="Price (€)"
                          onChange={(e) => {
                            const updated = [...editableDish.optionTrees];
                            updated[treeIndex].options[optIndex].price = parseFloat(e.target.value);
                            setEditableDish(prev => prev ? { ...prev, optionTrees: updated } : prev);
                            setOptionsDirty(true);
                          }}
                        />

                        <button
                          className="delete-option"
                          onClick={() => {
                            const updated = [...editableDish.optionTrees];
                            updated[treeIndex].options = updated[treeIndex].options.filter(o => o.id !== opt.id);
                            setEditableDish(prev => prev ? { ...prev, optionTrees: updated } : prev);
                            setOptionsDirty(true);
                          }}
                        >
                          ✖
                        </button>
                      </div>
                    ))}

                    <Button
                      className="dish-action-button new-dish add-option"
                      onClick={() => {
                        const newOption = {
                          id: Date.now(),
                          name: "",
                          price: 0
                        };
                        const updated = [...editableDish.optionTrees];
                        updated[treeIndex].options.push(newOption);
                        setEditableDish(prev => prev ? { ...prev, optionTrees: updated } : prev);
                        setOptionsDirty(true);
                      }}
                    >
                      + Add Option
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
