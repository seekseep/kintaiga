export const RESERVED_ORGANIZATION_NAMES = [
  'api',
  'admin',
  'auth',
  'callback',
  'confirm-email',
  'dashboard',
  'help',
  'initialize',
  'invite',
  'login',
  'logout',
  'me',
  'new',
  'organizations',
  'register',
  'reports',
  'reset-password',
  'settings',
  'signin',
  'signout',
  'signup',
  'support',
] as const

export function isReservedOrganizationName(name: string): boolean {
  return (RESERVED_ORGANIZATION_NAMES as readonly string[]).includes(name)
}
