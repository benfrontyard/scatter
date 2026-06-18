export type UserRole = "user" | "admin" | "maker";

export type User = {
  id: string;
  name: string;
  role: UserRole;
};

export function isAdminRole(role: UserRole): boolean {
  return role === "admin" || role === "maker";
}
