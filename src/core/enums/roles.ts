export enum ENonAdminRole {
  RENTOR = 'RENTOR',
  CLIENT = 'CLIENT',
}

export enum EAdminRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
}

export type ERole = ENonAdminRole | EAdminRole
export const ERole = { ...ENonAdminRole, ...EAdminRole }
