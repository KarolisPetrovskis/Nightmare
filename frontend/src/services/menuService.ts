export interface MenuItem {
  nid: number;
  name: string;
  businessId: number;
  price: number;
  discount: number | null;
  vatId: number;
  discountTime: string | null;
}

export interface MenuItemIngredient {
  nid: number;
  itemId: number;
  name: string;
  price: number;
}

export interface MenuItemWithAddons {
  menuItem: MenuItem;
  addons: MenuItemIngredient[] | null;
}

export interface MenuCreateDTO {
  name: string;
  businessId: number;
  price: number;
  discount?: number | null;
  vatId: number;
  discountTime?: string | null;
}

export interface MenuUpdateDTO {
  name?: string;
  price?: number;
  discount?: number | null;
  vatId?: number;
  discountTime?: string | null;
}

export const menuApi = {
  // GET /api/menu?BusinessId=1&Page=0&PerPage=10
  getMenu: async (
    businessId: number,
    page: number = 0,
    perPage: number = 100
  ): Promise<MenuItem[]> => {
    const response = await fetch(
      `/api/menu?BusinessId=${businessId}&Page=${page}&PerPage=${perPage}`
    );
    if (!response.ok) throw new Error('Failed to fetch menu items');
    return await response.json();
  },

  // GET /api/menu/{nid}
  getMenuItem: async (nid: number): Promise<MenuItem> => {
    const response = await fetch(`/api/menu/${nid}`);
    if (!response.ok) throw new Error('Failed to fetch menu item');
    return await response.json();
  },

  // GET /api/menu/{nid}/addons
  getMenuItemWithAddons: async (nid: number): Promise<MenuItemWithAddons> => {
    const response = await fetch(`/api/menu/${nid}/addons`);
    if (!response.ok) throw new Error('Failed to fetch menu item with addons');
    return await response.json();
  },

  // POST /api/menu
  createMenuItem: async (data: MenuCreateDTO): Promise<MenuItem> => {
    const response = await fetch(`/api/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create menu item');
    return await response.json();
  },

  // PUT /api/menu/{nid}
  updateMenuItem: async (nid: number, data: MenuUpdateDTO): Promise<void> => {
    const response = await fetch(`/api/menu/${nid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update menu item');
  },

  // DELETE /api/menu/{nid}
  deleteMenuItem: async (nid: number): Promise<void> => {
    const response = await fetch(`/api/menu/${nid}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete menu item');
  },
};
