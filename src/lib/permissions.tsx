'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiFetch } from './api'

// ── Role Permission Matrix (mirrors backend) ────────────────────────
const ROLE_PERMISSIONS: Record<string, {
  name: string
  modules: string[]
  actions: Record<string, string[]>
  dataAccess: string
}> = {
  admin: {
    name: 'Admin',
    modules: ['dashboard', 'users', 'leads', 'projects', 'clients', 'vendors', 'expenses', 'payments', 'bills', 'reports', 'settings', 'dpr', 'weeklyPayments', 'workerRates', 'projectAssignments'],
    actions: {
      dashboard: ['read'],
      users: ['read', 'create', 'update', 'delete'],
      projects: ['read', 'create', 'update', 'delete'],
      expenses: ['read', 'create', 'update', 'delete'],
      payments: ['read', 'create', 'update', 'delete'],
      bills: ['read', 'create', 'update', 'delete'],
      vendors: ['read', 'create', 'update', 'delete'],
      reports: ['read', 'create', 'update', 'delete'],
      settings: ['read', 'create', 'update', 'delete'],
      leads: ['read', 'create', 'update', 'delete'],
      clients: ['read', 'create', 'update', 'delete'],
      dpr: ['read', 'create', 'update', 'delete'],
      weeklyPayments: ['read', 'create', 'update', 'delete'],
      workerRates: ['read', 'create', 'update', 'delete'],
      projectAssignments: ['read', 'create', 'update', 'delete'],
    },
    dataAccess: 'all',
  },
  project_manager: {
    name: 'Project Manager',
    modules: ['dashboard', 'projects', 'clients', 'vendors', 'expenses', 'payments', 'bills', 'reports', 'leads', 'dpr', 'weeklyPayments', 'workerRates', 'projectAssignments'],
    actions: {
      dashboard: ['read'],
      projects: ['read', 'create', 'update'],
      clients: ['read'],
      vendors: ['read', 'update'],
      expenses: ['read'],
      payments: ['read'],
      bills: ['read'],
      reports: ['read'],
      leads: ['read', 'create', 'update'],
      dpr: ['read', 'update'],
      weeklyPayments: ['read'],
      workerRates: ['read'],
      projectAssignments: ['read', 'create', 'update'],
    },
    dataAccess: 'assigned_projects',
  },
  site_supervisor: {
    name: 'Site Supervisor',
    modules: ['dashboard', 'projects', 'expenses', 'dpr', 'weeklyPayments'],
    actions: {
      dashboard: ['read'],
      projects: ['read'],
      expenses: ['read', 'create'],
      dpr: ['read', 'create', 'update'],
      weeklyPayments: ['read'],
    },
    dataAccess: 'assigned_projects',
  },
  accountant: {
    name: 'Accountant',
    modules: ['dashboard', 'leads', 'projects', 'clients', 'vendors', 'expenses', 'payments', 'bills', 'reports', 'settings', 'dpr', 'weeklyPayments', 'workerRates'],
    actions: {
      dashboard: ['read'],
      projects: ['read', 'create', 'update', 'delete'],
      expenses: ['read', 'create', 'update', 'delete'],
      payments: ['read', 'create', 'update', 'delete'],
      bills: ['read', 'create', 'update', 'delete'],
      vendors: ['read', 'create', 'update', 'delete'],
      reports: ['read', 'create', 'update', 'delete'],
      settings: ['read', 'create', 'update', 'delete'],
      leads: ['read', 'create', 'update', 'delete'],
      clients: ['read', 'create', 'update', 'delete'],
      dpr: ['read'],
      weeklyPayments: ['read', 'update'],
      workerRates: ['read', 'create', 'update', 'delete'],
    },
    dataAccess: 'all',
  },
  staff: {
    name: 'Staff',
    modules: ['dashboard', 'projects'],
    actions: {
      dashboard: ['read'],
      projects: ['read'],
    },
    dataAccess: 'own_data',
  },
  client: {
    name: 'Client',
    modules: ['dashboard', 'projects', 'clients', 'payments', 'bills'],
    actions: {
      dashboard: ['read'],
      projects: ['read'],
      clients: ['read'],
      payments: ['read'],
      bills: ['read'],
    },
    dataAccess: 'assigned_projects',
  },
}

// ── Types ────────────────────────────────────────────────────────────
type PermContext = {
  role: string | null
  roleName: string
  modules: string[]
  canAccess: (module: string) => boolean
  canDo: (module: string, action: string) => boolean
  loading: boolean
}

const PermissionsContext = createContext<PermContext>({
  role: null,
  roleName: '',
  modules: [],
  canAccess: () => false,
  canDo: () => false,
  loading: true,
})

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedRole = localStorage.getItem('acls_role')
    if (storedRole) {
      setRole(storedRole)
      setLoading(false)
      return
    }

    // Fetch role from backend if not stored
    const token = localStorage.getItem('acls_token')
    if (!token) {
      setLoading(false)
      return
    }

    apiFetch<{ role: string }>('/api/auth/permissions', { token })
      .then((data) => {
        setRole(data.role)
        localStorage.setItem('acls_role', data.role)
      })
      .catch(() => {
        // fallback: try userdetail
        apiFetch<{ userdetails: { role: string } }>('/api/auth/userdetail', { token })
          .then((data) => {
            setRole(data.userdetails.role)
            localStorage.setItem('acls_role', data.userdetails.role)
          })
          .catch(() => {})
      })
      .finally(() => setLoading(false))
  }, [])

  const perms = role ? ROLE_PERMISSIONS[role] : null

  const canAccess = (module: string) => {
    if (!perms) return false
    return perms.modules.includes(module)
  }

  const canDo = (module: string, action: string) => {
    if (!perms) return false
    const modActions = perms.actions[module]
    if (!modActions) return false
    return modActions.includes(action)
  }

  return (
    <PermissionsContext.Provider
      value={{
        role,
        roleName: perms?.name || '',
        modules: perms?.modules || [],
        canAccess,
        canDo,
        loading,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  return useContext(PermissionsContext)
}

export { ROLE_PERMISSIONS }
