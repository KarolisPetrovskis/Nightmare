// src/services/businessService.ts

export async function fetchBusinessName(businessId: number): Promise<string | null> {
  try {
    const response = await fetch(`/api/business/${businessId}`);
    if (!response.ok) return null;
    const business = await response.json();
    return business.name || null;
  } catch (e) {
    return null;
  }
}
