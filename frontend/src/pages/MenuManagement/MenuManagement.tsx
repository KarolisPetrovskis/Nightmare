import '../Management.css';
import Button from '@mui/material/Button';
import { useState, useEffect } from "react";
import dishesData from '../dishesData.json';
import Pagination from '@mui/material/Pagination';

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

type Item = {
  id: number;
  name: string;
  price: number;
  discount: number;
  discountExpiration: string;
  vat: string;
  optionTrees: OptionTree[];
};


export default function MenuManagement() {
  const [items, setItems] = useState<Item[]>(dishesData.dishes);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editableItem, setEditableItem] = useState<Item | null>(null);
  const [itemDirty, setItemDirty] = useState(false);
  const [optionsDirty, setOptionsDirty] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  const [page, setPage] = useState(1);
  const itemsPerPage = 7;
  
  const [treePage, setTreePage] = useState(1);
  const treesPerPage = 3;


  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
  };

  const handleNewItem = () => {
    const emptyItem: Item = {
      id: -1,
      name: "",
      price: 0,
      discount: 0,
      discountExpiration: "",
      vat: "standard",
      optionTrees: []
    };

    setSelectedItem(emptyItem);
    setEditableItem(emptyItem);
    setItemDirty(false);
  };

  useEffect(() => {
    if (!editableItem || !selectedItem) return;
    const simpleChanged =
      editableItem.name !== selectedItem.name ||
      editableItem.price !== selectedItem.price ||
      editableItem.discount !== selectedItem.discount ||
      editableItem.discountExpiration !== selectedItem.discountExpiration ||
      editableItem.vat !== selectedItem.vat;

    const treesChanged = JSON.stringify(editableItem.optionTrees) !== JSON.stringify(selectedItem.optionTrees);

    setItemDirty(simpleChanged || treesChanged);
  }, [editableItem, selectedItem]);


  const handleSave = () => {
    if (!editableItem) return;

    if (editableItem.id === -1) {
      // Create a new ID
      const newItem = { ...editableItem, id: Date.now() };
      setItems(prev => [...prev, newItem]);
      setSelectedItem(newItem);
    } else {
      // Editing an existing item
      setItems(prev =>
        prev.map(i => i.id === editableItem.id ? editableItem : i)
      );
    }

    setItemDirty(false);
    setOptionsDirty(false);
  };


  const handleItemClick = (item: Item) => {
    if (!deleteMode) {
      setSelectedItem(item);
      setEditableItem({ ...item });
      setItemDirty(false);
    }
  };


  const updateField = (key: keyof Item, value: string | number) => {
    setEditableItem(prev => prev ? { ...prev, [key]: value } : prev);

    if (selectedItem && editableItem) {
      const changed = value !== (selectedItem as any)[key];
      if (changed) setItemDirty(true);
    }
  };


  return (
    <div className="management">

      <div className="item-list-container">
        <div className="item-actions">
          <Button className="item-action-button new-item" onClick={handleNewItem}>
            New Dish
          </Button>

          <Button
            className={`item-action-button delete-item ${deleteMode ? 'active' : ''}`}
            onClick={toggleDeleteMode}
          >
            Delete Dishes
          </Button>
        </div>

        <h3 className="item-list-label">Dish List</h3>
        <div className="item-list">
          {items
            .slice((page - 1) * itemsPerPage, page * itemsPerPage)
            .map((item) => (
              <div
                key={item.id}
                className={`item-card ${selectedItem?.id === item.id ? "selected" : ""}`}
                onClick={() => handleItemClick(item)}
              >
                {item.name}
                {deleteMode && <span className="delete-x">✖</span>}
              </div>
            ))}
        </div>
        <div className="item-list-pagination">
          <Pagination
            count={Math.ceil(items.length / itemsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            variant="outlined"
            color="secondary"
            className="dish-pagination"
          />
        </div>

      </div>

      <div className="info-container">
        <h2 className="section-title">Dish Information</h2>
        {!editableItem ? (
          <p style={{ opacity: 0.5 }}>Select or create an dish.</p>
        ) : (
          <>
            <div className="info-grid">
              <div className="info-box">
                <label>Dish Name</label>
                <input
                  type="text"
                  value={editableItem?.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                />

              </div>

              <div className="info-box">
                <label>Dish Price (€)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={editableItem?.price ?? ""}
                  onChange={(e) => updateField("price", parseFloat(e.target.value))}
                />
              </div>

              <div className="info-box">
                <label>Dish Discount (%)</label>
                <input
                  type="number"
                  placeholder="%"
                  value={editableItem?.discount ?? ""}
                  onChange={(e) => updateField("discount", parseFloat(e.target.value))}
                />

                <label className="small-label">Expiration Date</label>
                <input
                  type="date"
                  value={editableItem?.discountExpiration || ""}
                  onChange={(e) => updateField("discountExpiration", e.target.value)}
                />

              </div>

              <div className="info-box">
                <label>VAT Type</label>
                <select
                  value={editableItem?.vat || "standard"}
                  onChange={(e) => updateField("vat", e.target.value)}
                >
                  <option value="standard">Standard VAT</option>
                  <option value="reduced">Reduced VAT</option>
                  <option value="none">No VAT</option>
                </select>
              </div>
            </div>

            <Button
              className={`save-button ${itemDirty || optionsDirty ? "active" : ""}`}
              disabled={!(itemDirty || optionsDirty)}
              onClick={handleSave}
            >
              Save
            </Button>

          </>
        )}
      </div>

<div className="option-container">
  {!editableItem && <></>}
  {editableItem && (
    <>
            <Button
              className="option-tree-button item-action-button new-item"
              onClick={() => {
                const newTree = {
                  id: Date.now(),
                  name: "",
                  options: []
                };
                setEditableItem(prev =>
                  prev ? { ...prev, optionTrees: [...prev.optionTrees, newTree] } : prev
                );
                setOptionsDirty(true);
              }}
            >
              + Add Option Tree
            </Button></>
        )}
        <h2 className="section-title">Options</h2>

        {!editableItem ? (
          <p style={{ opacity: 0.5, marginTop: 0 }}>Select a dish to view options.</p>
        ) : (
          <>


            <div className="option-tree-list">
{editableItem?.optionTrees
  ?.slice((treePage - 1) * treesPerPage, treePage * treesPerPage)
  .map((tree, treeIndex) => {
    const realIndex = (treePage - 1) * treesPerPage + treeIndex;

    return (
      <div key={tree.id} className="option-tree-box">

        <div className="option-tree-header">
          <input
            type="text"
            value={tree.name}
            placeholder="Option Tree Name"
            onChange={(e) => {
              const updated = [...editableItem.optionTrees];
              updated[realIndex].name = e.target.value;
              setEditableItem(prev => prev ? { ...prev, optionTrees: updated } : prev);
              setOptionsDirty(true);
            }}
          />

          <button
            className="delete-tree"
            onClick={() => {
              const updated = editableItem.optionTrees.filter(t => t.id !== tree.id);
              setEditableItem(prev => prev ? { ...prev, optionTrees: updated } : prev);
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
                  const updated = [...editableItem.optionTrees];
                  updated[realIndex].options[optIndex].name = e.target.value;
                  setEditableItem(prev => prev ? { ...prev, optionTrees: updated } : prev);
                  setOptionsDirty(true);
                }}
              />

              <input
                type="number"
                value={opt.price}
                placeholder="Price (€)"
                onChange={(e) => {
                  const updated = [...editableItem.optionTrees];
                  updated[realIndex].options[optIndex].price = parseFloat(e.target.value);
                  setEditableItem(prev => prev ? { ...prev, optionTrees: updated } : prev);
                  setOptionsDirty(true);
                }}
              />

              <button
                className="delete-option"
                onClick={() => {
                  const updated = [...editableItem.optionTrees];
                  updated[realIndex].options =
                    updated[realIndex].options.filter(o => o.id !== opt.id);
                  setEditableItem(prev => prev ? { ...prev, optionTrees: updated } : prev);
                  setOptionsDirty(true);
                }}
              >
                ✖
              </button>
            </div>
          ))}

          <Button
            className="item-action-button new-item add-option"
            onClick={() => {
              const updated = [...editableItem.optionTrees];
              updated[realIndex].options.push({
                id: Date.now(),
                name: "",
                price: 0
              });
              setEditableItem(prev => prev ? { ...prev, optionTrees: updated } : prev);
              setOptionsDirty(true);
            }}
          >
            + Add Option
          </Button>
        </div>
      </div>
    );
  })}

            </div>
          </>
        )}

        <div className="option-tree-pagination">
  <Pagination
    count={Math.ceil((editableItem?.optionTrees.length ?? 0) / treesPerPage)}
    page={treePage}
    onChange={(e, value) => setTreePage(value)}
    variant="outlined"
    color="secondary"
    className='dish-pagination'
  />
</div>

      </div>

    </div>
  );
}
