import '../Management.css';
import './MenuManagement.css';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import SnackbarNotification from '../../components/SnackBar/SnackNotification';
import {
  menuApi,
  type MenuCreateDTO,
  type MenuUpdateDTO,
} from '../../services/menuService';
import {
  menuAddonsApi,
  addonGroupsApi,
  type MenuAddonCreateDTO,
  type MenuAddonUpdateDTO,
  type MenuAddonGroupCreateDTO,
} from '../../services/menuAddonsService';

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
  vatId?: number; // Changed from vat string to vatId number
  vatName?: string; // Added for display
  vatPercentage?: number; // Added for display
  optionGroups: OptionGroup[];
};

type VatOption = {
  vatId: number;
  name: string;
  percentage: number;
};

const BUSINESS_ID = 1; // TODO: Get from auth context

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editableItem, setEditableItem] = useState<MenuItem | null>(null);
  const [itemDirty, setItemDirty] = useState(false);
  const [optionsDirty, setOptionsDirty] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [vatOptions, setVatOptions] = useState<VatOption[]>([]);
  const [vatDropdownOpen, setVatDropdownOpen] = useState(false);
  const [selectedVatOption, setSelectedVatOption] = useState<VatOption | null>(
    null
  );

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
  const [businessId, setBusinessId] = useState<number | null>(null);

  // Fetch VAT options
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

      // Set default VAT option
      if (mappedVatOptions.length > 0) {
        setSelectedVatOption(mappedVatOptions[0]);
      }
    } catch (error) {
      console.error('Error fetching VAT options:', error);
      setVatOptions([]);
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
          throw new Error('Please login to access services');
        }
        throw new Error(`Failed to get business ID: ${response.statusText}`);
      }

      const id = await response.json();
      setBusinessId(id);
      console.log(id);
      return id;
    } catch (error) {
      console.error('Error fetching business ID:', error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await fetchVatOptions();
        await loadMenuItems();
      } catch (error) {
        console.error('Error loading initial data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load data',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadMenuItems = async () => {
    try {
      const id = await fetchBusinessId();
      const apiItems = await menuApi.getMenu(id);

      // We need to fetch VAT details for each item
      const transformedItems = await Promise.all(
        apiItems.map(async (item) => {
          let vatName = 'Standard';
          let vatPercentage = 21; // Default

          if (item.vatId) {
            try {
              const vatResponse = await fetch(`/api/VAT/${item.vatId}`);
              if (vatResponse.ok) {
                const vatData = await vatResponse.json();
                vatName = vatData.name;
                vatPercentage = vatData.percentage;
              }
            } catch (error) {
              console.error('Error fetching VAT details:', error);
            }
          }

          return {
            id: item.nid,
            name: item.name,
            price: item.price,
            discount: item.discount || 0,
            discountExpiration: item.discountTime || '',
            vatId: item.vatId,
            vatName: vatName,
            vatPercentage: vatPercentage,
            optionGroups: [],
          };
        })
      );

      setItems(transformedItems);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load menu items',
        type: 'error',
      });
    }
  };

  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
  };

  const handleNewItem = () => {
    const defaultVatId =
      vatOptions.length > 0 ? vatOptions[0].vatId : undefined;
    const defaultVatName =
      vatOptions.length > 0 ? vatOptions[0].name : 'Standard';
    const defaultVatPercentage =
      vatOptions.length > 0 ? vatOptions[0].percentage : 21;

    const emptyItem: MenuItem = {
      id: -1,
      name: '',
      price: 0,
      discount: 0,
      discountExpiration: '',
      vatId: defaultVatId,
      vatName: defaultVatName,
      vatPercentage: defaultVatPercentage,
      optionGroups: [],
    };

    setSelectedItem(emptyItem);
    setEditableItem(emptyItem);
    setSelectedVatOption(vatOptions.length > 0 ? vatOptions[0] : null);
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

    const groupsChanged =
      JSON.stringify(editableItem.optionGroups) !==
      JSON.stringify(selectedItem.optionGroups);

    setItemDirty(simpleChanged || groupsChanged);
  }, [editableItem, selectedItem]);

  const handleSave = async () => {
    if (!editableItem || !businessId) return;

    let errorMessage = '';
    if (
      !editableItem.name.trim() ||
      isNaN(editableItem.price) ||
      editableItem.price <= 0
    ) {
      errorMessage = 'Dish name and a valid price (>0) are required.';
    } else if (!editableItem.vatId) {
      errorMessage = 'VAT rate is required.';
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
            errorMessage =
              'All options must have a name and a valid price (>0).';
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
        console.log('we are here creating; ');
        const createData: MenuCreateDTO = {
          name: editableItem.name,
          businessId: businessId,
          price: editableItem.price,
          discount: editableItem.discount || null,
          vatId: editableItem.vatId!,
          discountTime: editableItem.discountExpiration || null,
        };
        const newItem = await menuApi.createMenuItem(createData);

        // Find the selected VAT option for display
        const selectedVat = vatOptions.find(
          (vat) => vat.vatId === editableItem.vatId
        );

        // Create addon groups and addons on backend
        const createdGroups: OptionGroup[] = [];
        for (const group of editableItem.optionGroups) {
          // Create the group
          const groupPayload = {
            name: group.name,
            menuItemId: newItem.nid,
          };
          const groupRes = await fetch('/api/menu/addon-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupPayload),
          });
          if (!groupRes.ok) throw new Error('Failed to create addon group');
          const createdGroup = await groupRes.json();

          // Create addons for this group
          const createdAddons: Array<{
            nid: number;
            name: string;
            price: number;
          }> = [];
          for (const addon of group.options) {
            const addonPayload = {
              name: addon.name,
              groupId: createdGroup.nid,
              price: addon.price,
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
            options: createdAddons.map((addon: { nid: number; name: string; price: number }) => ({
              id: addon.nid,
              name: addon.name,
              price: addon.price,
            })),
          });
        }

        const localItem = {
          id: newItem.nid,
          name: newItem.name,
          price: newItem.price,
          discount: newItem.discount || 0,
          discountExpiration: newItem.discountTime || '',
          vatId: newItem.vatId,
          vatName: selectedVat?.name || 'Standard',
          vatPercentage: selectedVat?.percentage || 21,
          optionGroups: createdGroups,
        };
        setItems((prev) => [...prev, localItem]);
        setSelectedItem(localItem);
        setEditableItem(localItem);
      } else {
        // Update existing menu item
        const updateData: MenuUpdateDTO = {
          name: editableItem.name,
          price: editableItem.price,
          discount: editableItem.discount || null,
          vatId: editableItem.vatId!,
          discountTime: editableItem.discountExpiration || null,
        };
        await menuApi.updateMenuItem(editableItem.id, updateData);

        // Find the selected VAT option for display
        const selectedVat = vatOptions.find(
          (vat) => vat.vatId === editableItem.vatId
        );

        // Sync groups and addons with backend
        if (optionsDirty && selectedItem) {
          const existingGroups = await addonGroupsApi.getGroupsByMenuItemNid(
            editableItem.id
          );
          const existingGroupIds = new Set(existingGroups.map((g) => g.nid));
          const currentGroupIds = new Set(
            editableItem.optionGroups.filter((g) => g.id >= 0).map((g) => g.id)
          );

          // Delete removed groups
          for (const group of existingGroups) {
            if (!currentGroupIds.has(group.nid)) {
              const deleteRes = await fetch(
                `/api/menu/addon-groups/${group.nid}`,
                { method: 'DELETE' }
              );
              if (!deleteRes.ok)
                throw new Error(`Failed to delete group ${group.nid}`);
            }
          }

          // Process each group
          const updatedGroups: OptionGroup[] = [];
          for (const group of editableItem.optionGroups) {
            if (group.id < 0) {
              // Create new group
              const groupData: MenuAddonGroupCreateDTO = {
                name: group.name,
                menuItemId: editableItem.id,
              };
              const createdGroup = await addonGroupsApi.createGroup(groupData);

              // Create addons for new group
              const createdOptions: Option[] = [];
              for (const option of group.options) {
                const addonData: MenuAddonCreateDTO = {
                  name: option.name,
                  groupId: createdGroup.nid,
                  price: option.price,
                };
                const createdAddon = await menuAddonsApi.createAddon(addonData);
                createdOptions.push({
                  id: createdAddon.nid,
                  name: createdAddon.name,
                  price: createdAddon.price,
                });
              }

              updatedGroups.push({
                id: createdGroup.nid,
                name: createdGroup.name,
                options: createdOptions,
              });
            } else {
              // Update existing group
              // Get existing addons for this group
              const existingAddons = await menuAddonsApi.getAddonsByGroupNid(
                group.id
              );
              const existingAddonIds = new Set(
                existingAddons.map((a) => a.nid)
              );
              const currentAddonIds = new Set(
                group.options.filter((o) => o.id >= 0).map((o) => o.id)
              );

              // Delete removed addons
              for (const addon of existingAddons) {
                if (!currentAddonIds.has(addon.nid)) {
                  await fetch(`/api/menu/addons/${addon.nid}`, {
                    method: 'DELETE',
                  });
                }
              }

              // Create/update addons
              const updatedOptions: Option[] = [];
              for (const option of group.options) {
                if (option.id < 0) {
                  // Create new addon
                  const addonData: MenuAddonCreateDTO = {
                    name: option.name,
                    groupId: group.id,
                    price: option.price,
                  };
                  const createdAddon = await menuAddonsApi.createAddon(
                    addonData
                  );
                  updatedOptions.push({
                    id: createdAddon.nid,
                    name: createdAddon.name,
                    price: createdAddon.price,
                  });
                } else if (existingAddonIds.has(option.id)) {
                  // Update existing addon
                  const addonData: MenuAddonUpdateDTO = {
                    name: option.name,
                    price: option.price,
                  };
                  await menuAddonsApi.updateAddon(option.id, addonData);
                  updatedOptions.push(option);
                } else {
                  updatedOptions.push(option);
                }
              }

              updatedGroups.push({
                id: group.id,
                name: group.name,
                options: updatedOptions,
              });
            }
          }

          // Update the editable item with the new IDs
          editableItem.optionGroups = updatedGroups;
        }

        const updatedItem = {
          ...editableItem,
          vatName: selectedVat?.name || editableItem.vatName,
          vatPercentage: selectedVat?.percentage || editableItem.vatPercentage,
        };
        setItems((prev) =>
          prev.map((i) => (i.id === editableItem.id ? updatedItem : i))
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
        const groups = await addonGroupsApi.getGroupsByMenuItemNid(item.id);

        // Load addons for each group
        const optionGroups: OptionGroup[] = await Promise.all(
          groups.map(async (group: any) => {
            const addonsRes = await fetch(
              `/api/menu/addons/by-group/${group.nid}`
            );
            if (!addonsRes.ok) throw new Error('Failed to fetch addons');
            const addons = await addonsRes.json();
            return {
              id: group.nid,
              name: group.name,
              options: addons.map((addon: any) => ({
                id: addon.nid,
                name: addon.name,
                price: addon.price,
              })),
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
    const dish = items.find((i) => i.id === id);
    if (dish) {
      setDishToDelete(dish);
      setConfirmDeleteOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!dishToDelete) return;

    try {
      await menuApi.deleteMenuItem(dishToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== dishToDelete.id));
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
    setEditableItem((prev) => (prev ? { ...prev, [key]: value } : prev));

    if (selectedItem && editableItem) {
      const changed = value !== (selectedItem as any)[key];
      if (changed) setItemDirty(true);
    }
  };

  const handleVatSelect = (vatOption: VatOption) => {
    setSelectedVatOption(vatOption);
    setEditableItem((prev) =>
      prev ? { ...prev, vatId: vatOption.vatId } : prev
    );
    setVatDropdownOpen(false);
    setItemDirty(true);
  };

  return (
    <div className="management">
      <div className="item-list-container">
        <div className="item-actions">
          <Button
            className="item-action-button new-item"
            onClick={handleNewItem}
          >
            New Dish
          </Button>

          <Button
            className={`item-action-button delete-item ${
              deleteMode ? 'active' : ''
            }`}
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
            <p style={{ opacity: 0.5, padding: '20px' }}>
              No dishes found. Create one!
            </p>
          ) : (
            items
              .slice((page - 1) * itemsPerPage, page * itemsPerPage)
              .map((item) => (
                <div
                  key={item.id}
                  className={`item-card ${
                    selectedItem?.id === item.id ? 'selected' : ''
                  }`}
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
              ))
          )}
        </div>
        <div className="item-list-pagination">
          <PaginationComponent
            count={Math.ceil(items.length / itemsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
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
                  value={editableItem?.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div className="info-box">
                <label>Dish Price (€)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  value={editableItem?.price ?? ''}
                  onChange={(e) =>
                    updateField('price', parseFloat(e.target.value))
                  }
                />
              </div>

              <div className="info-box">
                <label>Dish Discount (%)</label>
                <input
                  type="number"
                  placeholder="%"
                  min="0"
                  max="100"
                  value={editableItem?.discount ?? ''}
                  onChange={(e) =>
                    updateField('discount', parseFloat(e.target.value))
                  }
                />

                <label className="small-label">Expiration Date</label>
                <input
                  type="date"
                  value={editableItem?.discountExpiration || ''}
                  onChange={(e) =>
                    updateField('discountExpiration', e.target.value)
                  }
                />
              </div>

              {/* VAT Dropdown */}
              <div className="info-box">
                <label>VAT Rate</label>
                <div className="vat-dropdown-container">
                  <div
                    className="vat-dropdown-toggle"
                    onClick={() => setVatDropdownOpen(!vatDropdownOpen)}
                  >
                    {selectedVatOption ? (
                      <span>
                        {selectedVatOption.name} ({selectedVatOption.percentage}
                        %)
                      </span>
                    ) : (
                      <span>Select VAT rate</span>
                    )}
                    <span className="vat-dropdown-arrow">▼</span>
                  </div>

                  {vatDropdownOpen && vatOptions.length > 0 && (
                    <div className="vat-dropdown-menu">
                      {vatOptions.map((vat) => (
                        <div
                          key={vat.vatId}
                          className={`vat-dropdown-item ${
                            selectedVatOption?.vatId === vat.vatId
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() => handleVatSelect(vat)}
                        >
                          <span className="vat-name">{vat.name}</span>
                          <span className="vat-percentage">
                            {vat.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {vatDropdownOpen && vatOptions.length === 0 && (
                    <div className="vat-dropdown-menu">
                      <div className="vat-dropdown-item disabled">
                        No VAT options available
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              className={`save-button ${
                itemDirty || optionsDirty ? 'active' : ''
              }`}
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
                  name: '',
                  options: [],
                };
                setEditableItem((prev) =>
                  prev
                    ? {
                        ...prev,
                        optionGroups: [...prev.optionGroups, newGroup],
                      }
                    : prev
                );
                setOptionsDirty(true);
              }}
            >
              + Add Option Tree
            </Button>
          </>
        )}
        <h2 className="section-title">Options</h2>

        {!editableItem ? (
          <p style={{ opacity: 0.5, marginTop: 0 }}>
            Select a dish to view options.
          </p>
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
                            setEditableItem((prev) =>
                              prev ? { ...prev, optionGroups: updated } : prev
                            );
                            setOptionsDirty(true);
                          }}
                        />

                        <button
                          className="delete-tree"
                          onClick={() => {
                            const updated = editableItem.optionGroups.filter(
                              (t) => t.id !== group.id
                            );
                            setEditableItem((prev) =>
                              prev ? { ...prev, optionGroups: updated } : prev
                            );
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
                                updated[realIndex].options[optIndex].name =
                                  e.target.value;
                                setEditableItem((prev) =>
                                  prev
                                    ? { ...prev, optionGroups: updated }
                                    : prev
                                );
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
                                updated[realIndex].options[optIndex].price =
                                  parseFloat(e.target.value);
                                setEditableItem((prev) =>
                                  prev
                                    ? { ...prev, optionGroups: updated }
                                    : prev
                                );
                                setOptionsDirty(true);
                              }}
                            />

                            <button
                              className="delete-option"
                              onClick={() => {
                                const updated = [...editableItem.optionGroups];
                                updated[realIndex].options = updated[
                                  realIndex
                                ].options.filter((o) => o.id !== opt.id);
                                setEditableItem((prev) =>
                                  prev
                                    ? { ...prev, optionGroups: updated }
                                    : prev
                                );
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
                              name: '',
                              price: 0,
                            });
                            setEditableItem((prev) =>
                              prev ? { ...prev, optionGroups: updated } : prev
                            );
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
            count={Math.ceil(
              (editableItem?.optionGroups.length ?? 0) / treesPerPage
            )}
            page={treePage}
            onChange={(_, value) => setTreePage(value)}
          />
        </div>
      </div>

      {confirmDeleteOpen && dishToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div
            className="modal-content option-tree-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 400 }}
          >
            <div className="option-tree-header" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Confirm Delete</h3>
              <button
                className="delete-tree modal-close"
                onClick={cancelDelete}
              >
                ✖
              </button>
            </div>

            <p style={{ marginBottom: 24, fontSize: '1rem' }}>
              Are you sure you want to delete "{dishToDelete.name}"? This will
              also delete all its option groups and options. This action cannot
              be undone.
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
                  '&:hover': { backgroundColor: '#bb2929ff' },
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
