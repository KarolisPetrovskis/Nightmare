import '../Management.css';
import './MenuManagement.css';
import Button from '@mui/material/Button';
import { useState, useEffect } from "react";
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import SnackbarNotification from '../../components/SnackBar/SnackNotification';
import { menuApi, type MenuCreateDTO, type MenuUpdateDTO } from '../../services/menuService';
import { menuAddonsApi, ingredientGroupsApi, type MenuAddonCreateDTO, type MenuAddonUpdateDTO, type MenuItemIngredientGroupCreateDTO } from '../../services/menuAddonsService';

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
  vat: string;
  optionGroups: OptionGroup[];
};

const BUSINESS_ID = 1; // TODO: Get from auth context
const VAT_ID_STANDARD = 1; // TODO: Map VAT types properly

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editableItem, setEditableItem] = useState<MenuItem | null>(null);
  const [itemDirty, setItemDirty] = useState(false);
  const [optionsDirty, setOptionsDirty] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

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
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const apiItems = await menuApi.getMenu(BUSINESS_ID);
      const transformedItems = apiItems.map(item => ({
        id: item.nid,
        name: item.name,
        price: item.price,
        discount: item.discount || 0,
        discountExpiration: item.discountTime || "",
        vat: "standard",
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
      vat: "standard",
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
      editableItem.vat !== selectedItem.vat;

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
        const createData: MenuCreateDTO = {
          name: editableItem.name,
          businessId: BUSINESS_ID,
          price: editableItem.price,
          discount: editableItem.discount || null,
          vatId: VAT_ID_STANDARD,
          discountTime: editableItem.discountExpiration || null
        };
        const newItem = await menuApi.createMenuItem(createData);

        // Create ingredient groups and addons on backend
        const createdGroups: OptionGroup[] = [];
        for (const group of editableItem.optionGroups) {
          // Create the group
          const groupData: MenuItemIngredientGroupCreateDTO = {
            name: group.name,
            menuItemId: newItem.nid
          };
          const createdGroup = await ingredientGroupsApi.createGroup(groupData);

          // Create addons for this group
          const createdAddons: Array<{ nid: number; name: string; price: number }> = [];
          for (const addon of group.options) {
            const addonData: MenuAddonCreateDTO = {
              name: addon.name,
              groupId: createdGroup.nid,
              price: addon.price
            };
            const created = await menuAddonsApi.createAddon(addonData);
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
          vat: "standard",
          optionGroups: createdGroups
        };
        setItems(prev => [...prev, localItem]);
        setSelectedItem(localItem);
        setEditableItem(localItem);
      } else {
        const updateData: MenuUpdateDTO = {
          name: editableItem.name,
          price: editableItem.price,
          discount: editableItem.discount || null,
          vatId: VAT_ID_STANDARD,
          discountTime: editableItem.discountExpiration || null
        };
        await menuApi.updateMenuItem(editableItem.id, updateData);

        // Sync groups and addons with backend
        if (optionsDirty && selectedItem) {
          const existingGroups = await ingredientGroupsApi.getGroupsByMenuItemNid(editableItem.id);
          const existingGroupIds = new Set(existingGroups.map(g => g.nid));
          const currentGroupIds = new Set(editableItem.optionGroups.filter(g => g.id > 0).map(g => g.id));

          // Delete removed groups (this will cascade delete addons)
          for (const group of existingGroups) {
            if (!currentGroupIds.has(group.nid)) {
              await ingredientGroupsApi.deleteGroup(group.nid);
            }
          }

          // Process each group
          for (const group of editableItem.optionGroups) {
            if (group.id <= 0) {
              // Create new group
              const groupData: MenuItemIngredientGroupCreateDTO = {
                name: group.name,
                menuItemId: editableItem.id
              };
              const createdGroup = await ingredientGroupsApi.createGroup(groupData);
              
              // Create addons for new group
              for (const option of group.options) {
                const addonData: MenuAddonCreateDTO = {
                  name: option.name,
                  groupId: createdGroup.nid,
                  price: option.price
                };
                await menuAddonsApi.createAddon(addonData);
              }
            } else {
              // Update existing group
              // Get existing addons for this group
              const existingAddons = await menuAddonsApi.getAddonsByGroupNid(group.id);
              const existingAddonIds = new Set(existingAddons.map(a => a.nid));
              const currentAddonIds = new Set(group.options.filter(o => o.id > 0).map(o => o.id));

              // Delete removed addons
              for (const addon of existingAddons) {
                if (!currentAddonIds.has(addon.nid)) {
                  await menuAddonsApi.deleteAddon(addon.nid);
                }
              }

              // Create/update addons
              for (const option of group.options) {
                if (option.id <= 0) {
                  // Create new addon
                  const addonData: MenuAddonCreateDTO = {
                    name: option.name,
                    groupId: group.id,
                    price: option.price
                  };
                  await menuAddonsApi.createAddon(addonData);
                } else if (existingAddonIds.has(option.id)) {
                  // Update existing addon
                  const addonData: MenuAddonUpdateDTO = {
                    name: option.name,
                    price: option.price
                  };
                  await menuAddonsApi.updateAddon(option.id, addonData);
                }
              }
            }
          }
        }

        setItems(prev =>
          prev.map(i => i.id === editableItem.id ? editableItem : i)
        );
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
        // Load ingredient groups for this menu item
        const groups = await ingredientGroupsApi.getGroupsByMenuItemNid(item.id);
        
        // Load addons for each group
        const optionGroups: OptionGroup[] = await Promise.all(
          groups.map(async (group) => {
            const addons = await menuAddonsApi.getAddonsByGroupNid(group.nid);
            return {
              id: group.nid,
              name: group.name,
              options: addons.map(addon => ({
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

  const handleDeleteDish = async (id: number) => {
    try {
      await menuApi.deleteMenuItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) {
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
    }
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
                const newGroup = {
                  id: Date.now(),
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
                              placeholder="Price (€)"
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
                              id: Date.now(),
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
      <SnackbarNotification
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        type={snackbar.type}
      />
    </div>


  );
}