export const ROLE_LABELS = {
    admin:       'Super Admin',
    asset_admin: 'Asset Admin',
    ats_admin:   'ATS Admin',
    viewer:      'Viewer',
}

export const canManageAssets = (role) => ['admin', 'asset_admin'].includes(role)
export const canManageAts    = (role) => ['admin', 'ats_admin'].includes(role)
export const canManageUsers  = (role) => role === 'admin'
