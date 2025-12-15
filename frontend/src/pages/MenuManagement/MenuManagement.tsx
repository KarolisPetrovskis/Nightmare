import '../Management.css';
import './MenuManagement.css';
import Button from '@mui/material/Button';
import { useState, useEffect, useRef } from "react";
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import SnackbarNotification from '../../components/SnackBar/SnackNotification';

type Option = {
  id: number;
  name: string;
  price: number;
};

type OptionGroup = {
  id: number;
  name: string;
  options: Option[];
};

type MenuItem = {
  id: number;
  name: string;
  price: number;
  discount: number;
  discountExpiration: string;
  vatId: number;
  optionGroups: OptionGroup[];
};

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editableItem, setEditableItem] = useState<MenuItem | null>(null);
  const [itemDirty, setItemDirty] = useState(false);
  const [optionsDirty, setOptionsDirty] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const businessIdRef = useRef<number | null>(null);
  const [defaultVatId, setDefaultVatId] = useState<number | null>(null);
  const [vatOptions, setVatOptions] = useState<Array<{ vatId: number; name: string; percentage: number }>>([]);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<MenuItem | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 7;

  const [treePage, setTreePage] = useState(1);
  const treesPerPage = 3;

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const id = await fetchBusinessId();
        businessIdRef.current = id;
        await fetchVatOptions();
        await loadMenuItems();
      } catch (error) {
        // error snackbar set in fetchBusinessId or loadMenuItems
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchVatOptions = async () => {
    try {
      const response = await fetch(`/api/VAT?page=0&perPage=100`);
      if (!response.ok) throw new Error('Failed to fetch VAT options');
      const vatData = await response.json();

      const mappedVatOptions = vatData.map((vat: any) => ({
        vatId: vat.nid,
        name: vat.name,
        percentage: vat.percentage,
      }));

      setVatOptions(mappedVatOptions);

      if (mappedVatOptions.length > 0) {
        setDefaultVatId(mappedVatOptions[0].vatId);
      }
    } catch (error) {
      console.error('Error fetching VAT options:', error);
    }
  };

  const fetchBusinessId = async (): Promise<number> => {
    try {
      const response = await fetch('/api/auth/businessId', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to access menu');
        }
        throw new Error(`Failed to get business ID: ${response.statusText}`);
      }
      const id = await response.json();
      return id;
    } catch (error) {
      console.error('Error fetching business ID:', error);
      setSnackbar({ open: true, message: 'Unable to determine business', type: 'error' });
      throw error as Error;
    }
  };

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      if (!businessIdRef.current) throw new Error('Business not available');
      const response = await fetch(`/api/menu?BusinessId=${businessIdRef.current}&Page=0&PerPage=100`);
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const apiItems = await response.json();
      const transformedItems = apiItems.map((item: any) => ({
        id: item.nid,
        name: item.name,
        price: item.price,
        discount: item.discount || 0,
        discountExpiration: item.discountTime || "",
        vatId: item.vatId,
        optionGroups: []
      }));
      setItems(transformedItems);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load menu items',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
  };

  const handleNewItem = () => {
    const emptyItem: MenuItem = {
      id: -1,
      name: "",
      price: 0,
      discount: 0,
      discountExpiration: "",
      vatId: defaultVatId || 1,
      optionGroups: []
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
      editableItem.vatId !== selectedItem.vatId;

    const groupsChanged = JSON.stringify(editableItem.optionGroups) !== JSON.stringify(selectedItem.optionGroups);

    setItemDirty(simpleChanged || groupsChanged);
  }, [editableItem, selectedItem]);


  const handleSave = async () => {
    if (!editableItem) return;

    let errorMessage = '';
    if (!editableItem.name.trim() || isNaN(editableItem.price) || editableItem.price <= 0) {
      errorMessage = 'Dish name and a valid price (>0) are required.';
    } else {
      for (const group of editableItem.optionGroups) {
        if (!group.name.trim()) {
          errorMessage = 'All option trees must have a name.';
          break;
        }
        if (group.options.length === 0) {
          errorMessage = 'All option trees must have at least one option.';
          break;
        }
        for (const opt of group.options) {
          if (!opt.name.trim() || isNaN(opt.price) || opt.price <= 0) {
            errorMessage = 'All options must have a name and a valid price (>0).';
            break;
          }
        }
        if (errorMessage) break;
      }
    }

    if (errorMessage) {
      setSnackbar({
        open: true,
        message: errorMessage,
        type: 'error',
      });
      return;
    }

    try {
      if (editableItem.id === -1) {
        // Create new menu item
        const createPayload = {
          name: editableItem.name,
          businessId: businessIdRef.current,
          price: editableItem.price,
          discount: editableItem.discount || null,
          vatId: defaultVatId || 1,
          discountTime: editableItem.discountExpiration || null
        };
        const response = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload),
        });
        if (!response.ok) throw new Error('Failed to create menu item');
        const newItem = await response.json();

        // Create addon groups and addons on backend
        const createdGroups: OptionGroup[] = [];
        for (const group of editableItem.optionGroups) {
          // Create the group
          const groupPayload = {
            name: group.name,
            menuItemId: newItem.nid
          };
          const groupRes = await fetch('/api/menu/addon-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupPayload),
          });
          if (!groupRes.ok) throw new Error('Failed to create addon group');
          const createdGroup = await groupRes.json();

          // Create addons for this group
          const createdAddons: Array<{ nid: number; name: string; price: number }> = [];
          for (const addon of group.options) {
            const addonPayload = {
              name: addon.name,
              groupId: createdGroup.nid,
              price: addon.price
            };
            const addonRes = await fetch('/api/menu/addons', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(addonPayload),
            });
            if (!addonRes.ok) throw new Error('Failed to create addon');
            const created = await addonRes.json();
            createdAddons.push(created);
          }

          createdGroups.push({
            id: createdGroup.nid,
            name: createdGroup.name,
            options: createdAddons.map(addon => ({
              id: addon.nid,
              name: addon.name,
              price: addon.price
            }))
          });
        }

        const localItem = {
          id: newItem.nid,
          name: newItem.name,
          price: newItem.price,
          discount: newItem.discount || 0,
          discountExpiration: newItem.discountTime || "",
          vatId: newItem.vatId,
          optionGroups: createdGroups
        };
        setItems(prev => [...prev, localItem]);
        setSelectedItem(localItem);
        setEditableItem(localItem);
      } else {
        // Update existing menu item
        const updatePayload = {
          name: editableItem.name,
          price: editableItem.price,
          discount: editableItem.discount || null,
          vatId: defaultVatId || 1,
          discountTime: editableItem.discountExpiration || null
        };
        const response = await fetch(`/api/menu/${editableItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });
        if (!response.ok) throw new Error('Failed to update menu item');

        // Sync groups and addons with backend
        if (optionsDirty && selectedItem) {
          const groupsRes = await fetch(`/api/menu/addon-groups/by-menu-item/${editableItem.id}`);
          if (!groupsRes.ok) throw new Error('Failed to fetch groups');
          const existingGroups = await groupsRes.json();
          const currentGroupIds = new Set(editableItem.optionGroups.filter(g => g.id > 0).map(g => g.id));

          // Delete removed groups
          for (const group of existingGroups) {
            if (!currentGroupIds.has(group.nid)) {
              const deleteRes = await fetch(`/api/menu/addon-groups/${group.nid}`, { method: 'DELETE' });
              if (!deleteRes.ok) throw new Error(`Failed to delete group ${group.nid}`);
            }
          }

          // Process each group
          const updatedGroups: OptionGroup[] = [];
          for (const group of editableItem.optionGroups) {
            if (group.id < 0) {
              // Create new group
              const groupPayload = { name: group.name, menuItemId: editableItem.id };
              const groupRes = await fetch('/api/menu/addon-groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(groupPayload),
              });
              if (!groupRes.ok) throw new Error('Failed to create group');
              const createdGroup = await groupRes.json();
              
              // Create addons for new group
              const createdOptions: Option[] = [];
              for (const option of group.options) {
                const addonPayload = { name: option.name, groupId: createdGroup.nid, price: option.price };
                const addonRes = await fetch('/api/menu/addons', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(addonPayload),
                });
                if (!addonRes.ok) throw new Error('Failed to create addon');
                const createdAddon = await addonRes.json();
                createdOptions.push({
                  id: createdAddon.nid,
                  name: createdAddon.name,
                  price: createdAddon.price
                });
              }
              
              updatedGroups.push({
                id: createdGroup.nid,
                name: createdGroup.name,
                options: createdOptions
              });
            } else {
              // Update existing group
              const addonsRes = await fetch(`/api/menu/addons/by-group/${group.id}`);
              if (!addonsRes.ok) throw new Error('Failed to fetch addons');
              const existingAddons = await addonsRes.json();
              const existingAddonIds = new Set(existingAddons.map((a: any) => a.nid));
              const currentAddonIds = new Set(group.options.filter(o => o.id >= 0).map(o => o.id));

              // Delete removed addons
              for (const addon of existingAddons) {
                if (!currentAddonIds.has(addon.nid)) {
                  await fetch(`/api/menu/addons/${addon.nid}`, { method: 'DELETE' });
                }
              }

              // Create/update addons
              const updatedOptions: Option[] = [];
              for (const option of group.options) {
                if (option.id < 0) {
                  // Create new addon
                  const addonPayload = { name: option.name, groupId: group.id, price: option.price };
                  const addonRes = await fetch('/api/menu/addons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(addonPayload),
                  });
                  if (!addonRes.ok) throw new Error('Failed to create addon');
                  const createdAddon = await addonRes.json();
                  updatedOptions.push({
                    id: createdAddon.nid,
                    name: createdAddon.name,
                    price: createdAddon.price
                  });
                } else if (existingAddonIds.has(option.id)) {
                  // Update existing addon
                  const addonPayload = { name: option.name, price: option.price };
                  const updateRes = await fetch(`/api/menu/addons/${option.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(addonPayload),
                  });
                  if (!updateRes.ok) throw new Error('Failed to update addon');
                  updatedOptions.push(option);
                } else {
                  updatedOptions.push(option);
                }
              }
              
              updatedGroups.push({
                id: group.id,
                name: group.name,
                options: updatedOptions
              });
            }
          }
          
          editableItem.optionGroups = updatedGroups;
        }

        const updatedItem = { ...editableItem };
        setItems(prev =>
          prev.map(i => i.id === editableItem.id ? updatedItem : i)
        );
        setSelectedItem(updatedItem);
        setEditableItem(updatedItem);
      }

      setItemDirty(false);
      setOptionsDirty(false);
      setSnackbar({
        open: true,
        message: 'Dish saved successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Save error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save dish',
        type: 'error',
      });
    }
  };


  const handleItemClick = async (item: MenuItem) => {
    if (!deleteMode) {
      try {
        // Load addon groups for this menu item
        const groupsRes = await fetch(`/api/menu/addon-groups/by-menu-item/${item.id}`);
        if (!groupsRes.ok) throw new Error('Failed to fetch groups');
        const groups = await groupsRes.json();
        
        // Load addons for each group
        const optionGroups: OptionGroup[] = await Promise.all(
          groups.map(async (group: any) => {
            const addonsRes = await fetch(`/api/menu/addons/by-group/${group.nid}`);
            if (!addonsRes.ok) throw new Error('Failed to fetch addons');
            const addons = await addonsRes.json();
            return {
              id: group.nid,
              name: group.name,
              options: addons.map((addon: any) => ({
                id: addon.nid,
                name: addon.name,
                price: addon.price
              }))
            };
          })
        );

        const itemWithAddons = { ...item, optionGroups };
        setSelectedItem(itemWithAddons);
        setEditableItem({ ...itemWithAddons });
        setItemDirty(false);
      } catch (error) {
        console.error('Failed to load groups and addons:', error);
        setSelectedItem(item);
        setEditableItem({ ...item });
        setItemDirty(false);
      }
    }
  };

  const handleDeleteDish = (id: number) => {
    const dish = items.find(i => i.id === id);
    if (dish) {
      setDishToDelete(dish);
      setConfirmDeleteOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!dishToDelete) return;

    try {
      const response = await fetch(`/api/menu/${dishToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete menu item');
      
      setItems(prev => prev.filter(i => i.id !== dishToDelete.id));
      if (selectedItem?.id === dishToDelete.id) {
        setSelectedItem(null);
        setEditableItem(null);
        setItemDirty(false);
        setOptionsDirty(false);
      }
      setSnackbar({
        open: true,
        message: 'Dish deleted successfully.',
        type: 'success',
      });
    } catch (error) {
      console.error('Delete error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete dish',
        type: 'error',
      });
    } finally {
      setConfirmDeleteOpen(false);
      setDishToDelete(null);
      setDeleteMode(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setDishToDelete(null);
  };


  const updateField = (key: keyof MenuItem, value: string | number) => {
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
          {loading ? (
            <p style={{ opacity: 0.5, padding: '20px' }}>Loading...</p>
          ) : items.length === 0 ? (
            <p style={{ opacity: 0.5, padding: '20px' }}>No dishes found. Create one!</p>
          ) : items
            .slice((page - 1) * itemsPerPage, page * itemsPerPage)
            .map((item) => (
              <div
                key={item.id}
                className={`item-card ${selectedItem?.id === item.id ? "selected" : ""}`}
                onClick={() => handleItemClick(item)}
              >
                {item.name}
                {deleteMode && (
                  <span
                    className="delete-x"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDish(item.id);
                    }}
                  >
                    ✖
                  </span>
                )}
              </div>
            ))}
        </div>
        <div className="item-list-pagination">
          <PaginationComponent
            count={Math.ceil(items.length / itemsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)} // TODO: change _ back to e if event is needed
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
                  min="0"
                  value={editableItem?.price ?? ""}
                  onChange={(e) => updateField("price", parseFloat(e.target.value))}
                />
              </div>

              <div className="info-box">
                <label>Dish Discount (%)</label>
                <input
                  type="number"
                  placeholder="%"
                  min="0"
                  max="100"
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
                  value={editableItem?.vatId || ""}
                  onChange={(e) => updateField("vatId", parseInt(e.target.value, 10))}
                >
                  {vatOptions.map(vat => (
                    <option key={vat.vatId} value={vat.vatId}>
                      {vat.name} ({vat.percentage}%)
                    </option>
                  ))}
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
                const newGroup: OptionGroup = {
                  id: -Date.now(),
                  name: "",
                  options: []
                };
                setEditableItem(prev =>
                  prev ? { ...prev, optionGroups: [...prev.optionGroups, newGroup] } : prev
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
              {editableItem?.optionGroups
                ?.slice((treePage - 1) * treesPerPage, treePage * treesPerPage)
                .map((group, groupIndex) => {
                  const realIndex = (treePage - 1) * treesPerPage + groupIndex;

                  return (
                    <div key={group.id} className="option-tree-box">

                      <div className="option-tree-header">
                        <input
                          type="text"
                          value={group.name}
                          placeholder="Option Tree Name"
                          onChange={(e) => {
                            const updated = [...editableItem.optionGroups];
                            updated[realIndex].name = e.target.value;
                            setEditableItem(prev => prev ? { ...prev, optionGroups: updated } : prev);
                            setOptionsDirty(true);
                          }}
                        />

                        <button
                          className="delete-tree"
                          onClick={() => {
                            const updated = editableItem.optionGroups.filter(t => t.id !== group.id);
                            setEditableItem(prev => prev ? { ...prev, optionGroups: updated } : prev);
                            setOptionsDirty(true);
                          }}
                        >
                          ✖
                        </button>
                      </div>

                      <div className="option-list">
                        {group.options.map((opt, optIndex) => (
                          <div key={opt.id} className="option-row">
                            <input
                              type="text"
                              value={opt.name}
                              placeholder="Option name"
                              onChange={(e) => {
                                const updated = [...editableItem.optionGroups];
                                updated[realIndex].options[optIndex].name = e.target.value;
                                setEditableItem(prev => prev ? { ...prev, optionGroups: updated } : prev);
                                setOptionsDirty(true);
                              }}
                            />

                            <input
                              type="number"
                              value={opt.price}
                              placeholder="0.00 €"
                              min="0"
                              onChange={(e) => {
                                const updated = [...editableItem.optionGroups];
                                updated[realIndex].options[optIndex].price = parseFloat(e.target.value);
                                setEditableItem(prev => prev ? { ...prev, optionGroups: updated } : prev);
                                setOptionsDirty(true);
                              }}
                            />

                            <button
                              className="delete-option"
                              onClick={() => {
                                const updated = [...editableItem.optionGroups];
                                updated[realIndex].options =
                                  updated[realIndex].options.filter(o => o.id !== opt.id);
                                setEditableItem(prev => prev ? { ...prev, optionGroups: updated } : prev);
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
                            const updated = [...editableItem.optionGroups];
                            updated[realIndex].options.push({
                              id: -Date.now(),
                              name: "",
                              price: 0
                            });
                            setEditableItem(prev => prev ? { ...prev, optionGroups: updated } : prev);
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
          <PaginationComponent
            count={Math.ceil((editableItem?.optionGroups.length ?? 0) / treesPerPage)}
            page={treePage}
            onChange={(_, value) => setTreePage(value)} // TODO: change _ back to e if event is needed
          />
        </div>

      </div>
      
      {confirmDeleteOpen && dishToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content option-tree-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="option-tree-header" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Confirm Delete</h3>
              <button className="delete-tree modal-close" onClick={cancelDelete}>✖</button>
            </div>

            <p style={{ marginBottom: 24, fontSize: '1rem' }}>
              Are you sure you want to delete "{dishToDelete.name}"? This will also delete all its option groups and options. This action cannot be undone.
            </p>

            <div className="modal-actions">
              <Button
                className="item-action-button new-item"
                onClick={cancelDelete}
              >
                Cancel
              </Button>

              <Button 
                onClick={confirmDelete}
                sx={{ 
                  backgroundColor: '#d32f2f', 
                  color: 'white', 
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#bb2929ff' }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <SnackbarNotification
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        type={snackbar.type}
      />
    </div>


  );
}