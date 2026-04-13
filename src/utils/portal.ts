export type PortalRole = 'agricultor' | 'transportista' | 'acopio' | 'consumidor';

export const PORTAL_ROLES: PortalRole[] = ['agricultor', 'transportista', 'acopio', 'consumidor'];

export const PORTAL_ROLE_LABELS: Record<PortalRole, string> = {
  agricultor: 'Agricultor',
  transportista: 'Transportista',
  acopio: 'Acopio',
  consumidor: 'Consumidor'
};

export function buildPortalUrl(role: PortalRole, siembraId: string) {
  const base = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    portal: '1',
    role,
    siembra: siembraId
  });
  return `${base}?${params.toString()}`;
}

export function createAutoId(prefix: 'S' | 'C' | 'T' | 'A') {
  const stamp = Date.now().toString().slice(-8);
  return `${prefix}${stamp}`;
}

export function createAutoLoteCode() {
  const stamp = Date.now().toString().slice(-6);
  return `LOT-${new Date().getFullYear()}-${stamp}`;
}

export function parsePortalFromLocation() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('portal') !== '1') return null;

  const role = params.get('role');
  const siembraId = params.get('siembra');
  const validRoles = new Set<PortalRole>(PORTAL_ROLES);

  if (!role || !siembraId || !validRoles.has(role as PortalRole)) return null;
  return { role: role as PortalRole, siembraId };
}
