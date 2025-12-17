export const UserRole = {
  Employee: 1,
  Manager: 2,
  Owner: 3,
  SuperAdmin: 4,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export function hasAccess(userRole: number | null, requiredRole: number): boolean {
  if (userRole === null) return false;
  
  // SuperAdmin and Owner have access to everything
  if (userRole === UserRole.SuperAdmin || userRole === UserRole.Owner) {
    return true;
  }
  
  // For others, check if they meet the minimum role requirement
  return userRole >= requiredRole;
}
