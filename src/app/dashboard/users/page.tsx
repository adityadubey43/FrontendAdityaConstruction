"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type User = {
  _id: string;
  name: string;
  email: string;
  countryCode: string;
  mobilenumber: number;
  role: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    countryCode: "",
    mobilenumber: "",
    role: "user",
  });
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateRole, setUpdateRole] = useState<{ [id: string]: string }>({});
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'user' | ''>('');

  useEffect(() => {
    fetchUsers();

    const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''
    if (token) {
      apiFetch<{ userdetails: { role: string } }>('/api/auth/userdetail', { token })
        .then((data) => {
          if (data?.userdetails?.role) {
            const role = data.userdetails.role as 'admin' | 'user'
            setCurrentUserRole(role)
          }
        })
        .catch(() => {})
    }
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await apiFetch<User[]>("/api/users");
      setUsers(data);
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: form,
      });
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", countryCode: "", mobilenumber: "", role: "user" });
      fetchUsers();
    } catch {
      setError("Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await apiFetch(`/api/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch {
      setError("Failed to delete user");
    }
  }

  async function handleRoleUpdate(id: string) {
    if (currentUserRole !== 'admin') {
      setError('You do not have permission to update roles.')
      return
    }

    try {
      await apiFetch(`/api/users/${id}`, {
        method: "PATCH",
        body: { role: updateRole[id] },
      });
      setUpdatingId(null);
      fetchUsers();
    } catch {
      setError("Failed to update role");
    }
  }

  const filteredUsers = users
    .filter((u) => (roleFilter === 'all' ? true : u.role === roleFilter))
    .filter((u) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.mobilenumber.toString().includes(q)
      )
    })

  return (
    <div className="min-h-screen bg-[#18181b] p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xl font-semibold text-white">Users</div>
          <div className="mt-1 text-xs text-white/60">Manage user accounts, roles, and assignments.</div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <input
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">Staff</option>
          </select>
          {currentUserRole === 'admin' ? (
            <Button onClick={() => setShowCreate(true)} variant="secondary">
              Create User
            </Button>
          ) : (
            <div className="text-xs text-white/50">Only admins can create users.</div>
          )}
        </div>
      </div>
      {error && <span className="text-red-500 ml-4">{error}</span>}

      {/* Popup Modal for Create User */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#232326] p-8 rounded-xl shadow-xl w-full max-w-md relative border border-white/10">
            <button
              className="absolute top-2 right-2 text-white text-xl font-bold"
              onClick={() => setShowCreate(false)}
              aria-label="Close"
            >
              ×
            </button>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input className="p-2 rounded border bg-[#18181b] text-white" required placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className="p-2 rounded border bg-[#18181b] text-white" required placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <input className="p-2 rounded border bg-[#18181b] text-white" required placeholder="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              <div className="flex gap-2">
                <input className="p-2 rounded border bg-[#18181b] text-white w-1/3" required placeholder="Country Code" value={form.countryCode} onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))} />
                <input className="p-2 rounded border bg-[#18181b] text-white w-2/3" required placeholder="Mobile Number" type="tel" value={form.mobilenumber} onChange={e => setForm(f => ({ ...f, mobilenumber: e.target.value }))} />
              </div>
              <select className="p-2 rounded border bg-black text-white" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
            </form>
          </div>
        </div>
      )}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-[#232326] rounded-xl text-white">
          <thead>
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-4">No users found.</td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user._id} className="border-t border-white/10">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.countryCode} {user.mobilenumber}</td>
                <td className="p-2">
                  {currentUserRole === 'admin' ? (
                  user.role === "admin" ? (
                    <span className="font-bold text-black">admin</span>
                  ) : updatingId === user._id ? (
                    <select
                      value={updateRole[user._id] ?? user.role}
                      onChange={e => setUpdateRole(r => ({ ...r, [user._id]: e.target.value }))}
                      className="p-1 rounded bg-black text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )
                ) : (
                  <span>{user.role}</span>
                )}
                </td>
                <td className="p-2 flex gap-2">
                  {currentUserRole === 'admin' ? (
                    user.role !== "admin" && updatingId === user._id ? (
                      <>
                        <Button size="sm" onClick={() => handleRoleUpdate(user._id)}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={() => setUpdatingId(null)}>Cancel</Button>
                      </>
                    ) : user.role !== "admin" ? (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => setUpdatingId(user._id)}>Edit Role</Button>
                        <Button size="sm" variant="secondary" onClick={() => handleDelete(user._id)}>Delete</Button>
                      </>
                    ) : null
                  ) : (
                    <span className="text-xs text-white/50">Admins manage roles.</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
