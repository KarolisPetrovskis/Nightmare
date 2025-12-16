export interface RegisterDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  userType?: number;
  address?: string;
  telephone?: string;
  planId?: number;
  bankAccount?: string;
}

export const authService = {
  async createBusinessOwner(data: RegisterDTO): Promise<void> {
    const response = await fetch('/api/auth/create-business-owner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create business owner');
    }
  },
};
