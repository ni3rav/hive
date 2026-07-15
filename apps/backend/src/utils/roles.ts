export type MemberRole = 'owner' | 'admin' | 'member';

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export function canManage(acting: MemberRole, target: MemberRole): boolean {
  return ROLE_HIERARCHY[acting] > ROLE_HIERARCHY[target];
}

export function canAssign(acting: MemberRole, assign: MemberRole): boolean {
  return ROLE_HIERARCHY[acting] > ROLE_HIERARCHY[assign];
}
