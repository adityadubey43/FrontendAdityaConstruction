"use client";

import { useEffect, useState } from "react";
import { Plus, Edit } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/ui/date-range-filter";


type Project = { _id: string; projectName: string };

type Vendor = { _id: string; name: string; companyName: string };

type VendorPopulated = { _id: string; vendorName: string; companyName: string };

type Expense = {
  _id: string;
  title: string;
  amount: number | string;
  category: string;
  paymentMethod?: string;
  date?: string;
  notes?: string;
  project?: Project;
  vendor?: VendorPopulated;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);

  const sortExpensesByDateDesc = (items: Expense[]) => {
    return [...items].sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return bTime - aTime;
    });
  };

  const [form, setForm] = useState<{
    title: string;
    amount: string;
    category: string;
    date: string;
    notes: string;
    project?: Project;
    vendorId?: string;
  }>({
    title: "",
    amount: "",
    category: "Miscellaneous",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("acls_token") || ""
      : "";

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (projectFilter !== "all") params.set("projectId", projectFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    Promise.all([
      apiFetch<Expense[]>(`/api/expenses?${params.toString()}`, { token }),
      apiFetch<Project[]>("/api/projects", { token }),
      apiFetch<Vendor[]>("/api/vendors", { token }),
    ])
      .then(([expensesData, projectsData, vendorsData]) => {
        setExpenses(sortExpensesByDateDesc(expensesData));
        setProjects(projectsData);
        setVendors(vendorsData);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load expenses"),
      )
      .finally(() => setLoading(false));
  }, [token, projectFilter, fromDate, toDate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedAmount = Number(
        String(form.amount).replace(/[^0-9.\-]/g, ""),
      );
      const body = {
        ...form,
        amount: parsedAmount,
        type: "expense",
        project: form.project?._id,
        vendor: form.vendorId,
      };
      if (isEditing && editingId) {
        const updated = await apiFetch<Expense>(`/api/expenses/${editingId}`, {
          token,
          method: "PATCH",
          body,
        });
        setExpenses((prev) =>
          sortExpensesByDateDesc(
            prev.map((exp) => (exp._id === editingId ? updated : exp)),
          ),
        );
      } else {
        const created = await apiFetch<Expense>("/api/expenses", {
          token,
          method: "POST",
          body,
        });
        setExpenses((prev) => sortExpensesByDateDesc([created, ...prev]));
      }
      setShowModal(false);
      setIsEditing(false);
      setEditingId(null);
      setForm({
        title: "",
        amount: "",
        category: "Miscellaneous",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    const projectMatches =
      projectFilter === "all" || exp.project?._id === projectFilter;
    const categoryMatches =
      categoryFilter === "all" || exp.category === categoryFilter;
    return projectMatches && categoryMatches;
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Expenses</div>
          <div className="mt-2 text-xs text-white/60">
            Track all project expenses here.
          </div>
        </div>
        <div className="flex items-center gap-4">
          <DateRangeFilter
            label="Date range"
            from={fromDate}
            to={toDate}
            onChange={({ from, to }) => {
              setFromDate(from);
              setToDate(to);
            }}
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-300">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectName}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Labor">Labor</option>
              <option value="Material">Material</option>
              <option value="Equipment">Equipment</option>
              <option value="Transport">Transport</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
          <div className="flex items-center justify-between md:justify-end md:gap-8">
            <div>
              <div className="text-sm text-white/60">
                {projectFilter === "all" && categoryFilter === "all"
                  ? "Total Expenses"
                  : `Total Expenses (${projectFilter !== "all" ? projects.find((p) => p._id === projectFilter)?.projectName : ""}${projectFilter !== "all" && categoryFilter !== "all" ? ", " : ""}${categoryFilter !== "all" ? categoryFilter : ""})`
                      .replace(/^.*\(,/, "(")
                      .replace(/, \)/, ")")}
              </div>
              <div className="text-2xl font-bold text-white">
                ₹{totalExpenses.toLocaleString()}
              </div>
            </div>
            <div className="text-sm text-white/60">
              {filteredExpenses.length} expense
              {filteredExpenses.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        {loading ? (
          <div className="h-48 animate-pulse" />
        ) : filteredExpenses.length === 0 ? (
          <div className="text-sm text-white/60">
            {projectFilter === "all" && categoryFilter === "all"
              ? "No expenses recorded yet."
              : "No expenses found for the selected filters."}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
                <tr>
                  <th className="px-4 py-3">Sr No.</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp, index) => (
                  <tr
                    key={exp._id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4">
                      {exp.date ? new Date(exp.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">{exp.category}</td>
                    <td className="px-4 py-4">
                      {exp.vendor
                        ? `${exp.vendor.vendorName} (${exp.vendor.companyName})`
                        : "—"}
                    </td>
                    <td className="px-4 py-4">{exp.title}</td>
                    <td className="px-4 py-4">
                      {exp.project?.projectName ?? "—"}
                    </td>
                    <td className="px-4 py-4">{exp.notes ?? "-"}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditingId(exp._id);
                          setForm({
                            title: exp.title,
                            amount: String(exp.amount),
                            category: exp.category,
                            date: exp.date
                              ? new Date(exp.date).toISOString().slice(0, 10)
                              : "",
                            notes: exp.notes || "",
                            project: exp.project,
                            vendorId: exp.vendor?._id,
                          });
                          setShowModal(true);
                        }}
                        className="text-white/60 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add record
          </Button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#1b1b1f] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {isEditing ? "Edit Expense" : "Add Expense"}
                </div>
                <div className="text-xs text-white/60">
                  {isEditing
                    ? "Update the expense record."
                    : "Record a new expense."}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setEditingId(null);
                  setForm({
                    title: "",
                    amount: "",
                    category: "Miscellaneous",
                    date: new Date().toISOString().slice(0, 10),
                    notes: "",
                  });
                }}
                className="text-white/60 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={submit} className="mt-6 grid gap-3">
              <select
                required
                value={form.project?._id ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: projects.find((p) => p._id === e.target.value),
                  }))
                }
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectName}
                  </option>
                ))}
              </select>

              <select
                value={form.vendorId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    vendorId: e.target.value || undefined,
                  }))
                }
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="">Select vendor (optional)</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.companyName})
                  </option>
                ))}
              </select>

              <input
                required
                value={form.title ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
                placeholder="Title"
              />

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  required
                  value={form.category ?? "Miscellaneous"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="Labor">Labor</option>
                  <option value="Material">Material</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Transport">Transport</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
                <input
                  required
                  type="text"
                  value={form.amount ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
                  placeholder="Amount (e.g. 1234.56)"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="date"
                  value={form.date ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
                />
                <input
                  value={form.notes ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
                  placeholder="Notes"
                />
              </div>

              {error && <div className="text-sm text-red-300">{error}</div>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditing(false);
                    setEditingId(null);
                    setForm({
                      title: "",
                      amount: "",
                      category: "Miscellaneous",
                      date: new Date().toISOString().slice(0, 10),
                      notes: "",
                    });
                  }}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-primary/40 hover:bg-primary/90"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
