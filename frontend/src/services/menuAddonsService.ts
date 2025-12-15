const API_BASE_URL = 'http://localhost:5087/api';

export interface MenuItemIngredient {
  nid: number;
  groupId?: number;
  name: string;
  price: number;
}

export interface MenuAddonCreateDTO {
  name: string;
  groupId: number;
  price: number;
}

export interface MenuAddonUpdateDTO {
  name?: string;
  groupId?: number;
  price?: number;
}

export interface MenuAddonGroup {
  nid: number;
  name: string;
  menuItemId: number;
}

export interface MenuAddonGroupCreateDTO {
  name: string;
  menuItemId: number;
}

export interface MenuAddonGroupUpdateDTO {
  name?: string;
  menuItemId?: number;
}

export const menuAddonsApi = {
  // GET /api/menu/addons?Page=0&PerPage=10
  getAllAddons: async (page: number = 0, perPage: number = 100): Promise<MenuItemIngredient[]> => {
    const response = await fetch(
      `${API_BASE_URL}/menu/addons?Page=${page}&PerPage=${perPage}`
    );
    if (!response.ok) throw new Error('Failed to fetch addons');
    return await response.json();
  },

  // GET /api/menu/addons/{nid}
  getAddonByNid: async (nid: number): Promise<MenuItemIngredient> => {
    const response = await fetch(`${API_BASE_URL}/menu/addons/${nid}`);
    if (!response.ok) throw new Error('Failed to fetch addon');
    return await response.json();
  },

  // GET /api/menu/addons/by-group/{groupNid}
  getAddonsByGroupNid: async (groupNid: number): Promise<MenuItemIngredient[]> => {
    const response = await fetch(`${API_BASE_URL}/menu/addons/by-group/${groupNid}`);
    if (!response.ok) throw new Error('Failed to fetch addons by group');
    return await response.json();
  },

  // POST /api/menu/addons
  createAddon: async (data: MenuAddonCreateDTO): Promise<MenuItemIngredient> => {
    const response = await fetch(`${API_BASE_URL}/menu/addons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create addon');
    return await response.json();
  },

  // PUT /api/menu/addons/{nid}
  updateAddon: async (nid: number, data: MenuAddonUpdateDTO): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/menu/addons/${nid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update addon');
  },

  // DELETE /api/menu/addons/{nid}
  deleteAddon: async (nid: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/menu/addons/${nid}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete addon');
  },
};

export const addonGroupsApi = {
  // GET /api/menu/addon-groups?Page=0&PerPage=10
  getAllGroups: async (page: number = 0, perPage: number = 100): Promise<MenuAddonGroup[]> => {
    const response = await fetch(
      `${API_BASE_URL}/menu/addon-groups?Page=${page}&PerPage=${perPage}`
    );
    if (!response.ok) throw new Error('Failed to fetch addon groups');
    return await response.json();
  },

  // GET /api/menu/addon-groups/{nid}
  getGroupByNid: async (nid: number): Promise<MenuAddonGroup> => {
    const response = await fetch(`${API_BASE_URL}/menu/addon-groups/${nid}`);
    if (!response.ok) throw new Error('Failed to fetch addon group');
    return await response.json();
  },

  // GET /api/menu/addon-groups/by-menu-item/{menuItemNid}
  getGroupsByMenuItemNid: async (menuItemNid: number): Promise<MenuAddonGroup[]> => {
    const response = await fetch(`${API_BASE_URL}/menu/addon-groups/by-menu-item/${menuItemNid}`);
    if (!response.ok) throw new Error('Failed to fetch addon groups by menu item');
    return await response.json();
  },

  // POST /api/menu/addon-groups
  createGroup: async (data: MenuAddonGroupCreateDTO): Promise<MenuAddonGroup> => {
    const response = await fetch(`${API_BASE_URL}/menu/addon-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create addon group');
    return await response.json();
  },

  // PUT /api/menu/addon-groups/{nid}
  updateGroup: async (nid: number, data: MenuAddonGroupUpdateDTO): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/menu/addon-groups/${nid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update addon group');
  },

  // DELETE /api/menu/addon-groups/{nid}
  deleteGroup: async (nid: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/menu/addon-groups/${nid}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete addon group');
  },
};
