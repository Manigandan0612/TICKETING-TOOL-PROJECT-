const ROLE_ROUTES = {
  ADMIN: '/admin',
  DEPARTMENT_ADMIN: '/department-admin',
  SUPPORT: '/support',
  DEVELOPER: '/developer',
  CLIENT: '/client',
  GENERAL: '/general',
};

export function getRoleRoute(role) {
  return ROLE_ROUTES[role] || '/login';
}
