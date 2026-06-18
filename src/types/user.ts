export type UserRole = "user" | "internal";

export type User = {
  id: string;
  name: string;
  role: UserRole;
};

export function isInternalRole(role: UserRole): boolean {
  return role === "internal";
}

/** @deprecated Use isInternalRole */
export function isAdminRole(role: UserRole): boolean {
  return isInternalRole(role);
}
