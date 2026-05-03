"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/ui/date-range-filter";

type Project = { _id: string; projectName: string };

type Payment = {
  _id: string;
  title: string;
  amount: number | string;
  type?: "expense" | "payment";
  category: string;
  paymentMethod?: string;
  date?: string;
  notes?: string;
  project?: Project;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);
  const [form, setForm] = useState<Partial<Payment>>({
    title: "",
    amount: "",
    type: "payment",
    category: "Miscellaneous",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("acls_token") || ""
      : "";

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (projectFilter !== "all") params.set("projectId", projectFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const paymentsPath = params.toString()
        ? `/api/payments?${params.toString()}`
        : "/api/payments";
      const [paymentsData, projectsData] = await Promise.all([
        apiFetch<Payment[]>(paymentsPath, { token }),
        apiFetch<Project[]>("/api/projects", { token }),
      ]);
      setPayments(
        paymentsData.filter(
          (payment) =>
            !(payment.title === "dummy" && Number(payment.amount) === 0),
        ),
      );
      setProjects(projectsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [token, projectFilter, fromDate, toDate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const parsedAmount = Number(
        String(form.amount).replace(/[^0-9.\-]/g, ""),
      );
      const body = {
        ...form,
        amount: parsedAmount,
        type: "payment",
        project: form.project?._id,
      };
      if (isEditing && editingId) {
        await apiFetch<Payment>(`/api/payments/${editingId}`, {
          token,
          method: "PATCH",
          body,
        });
      } else {
        await apiFetch<Payment>("/api/payments", {
          token,
          method: "POST",
          body,
        });
      }
      setShowModal(false);
      setIsEditing(false);
      setEditingId(null);
      setForm({
        title: "",
        amount: "",
        type: "payment",
        category: "Miscellaneous",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      await loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const removePayment = async (id: string) => {
    try {
      setError(null);
      await apiFetch<{ message: string }>(`/api/payments/${id}`, {
        token,
        method: "DELETE",
      });
      await loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete payment");
    }
  };

  const filteredPayments = payments.filter((pay) => {
    const projectMatches =
      projectFilter === "all" || pay.project?._id === projectFilter;
    const categoryMatches =
      categoryFilter === "all" || pay.category === categoryFilter;
    return projectMatches && categoryMatches;
  });

  const totalPayments = filteredPayments.reduce(
    (sum, pay) => sum + Number(pay.amount),
    0,
  );

  const selectedProjectPayments =
    projectFilter !== "all"
      ? payments.filter((pay) => pay.project?._id === projectFilter)
      : [];

  const selectedProjectTotal = selectedProjectPayments.reduce(
    (sum, pay) => sum + Number(pay.amount),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Payments Received</div>
            <div className="mt-2 text-xs text-white/60">
              Track payments received from clients per project.
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
                    ? "Total Payments Received"
                    : `Total Payments Received (${projectFilter !== "all" ? projects.find((p) => p._id === projectFilter)?.projectName : ""}${projectFilter !== "all" && categoryFilter !== "all" ? ", " : ""}${categoryFilter !== "all" ? categoryFilter : ""})`
                        .replace(/^.*\(,/, "(")
                        .replace(/, \)/, ")")}
                </div>
                <div className="text-2xl font-bold text-white">
                  ₹{totalPayments.toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-white/60">
                {filteredPayments.length} payment
                {filteredPayments.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          {loading ? (
            <div className="h-48 animate-pulse" />
          ) : filteredPayments.length === 0 ? (
            <div className="text-sm text-white/60">
              {projectFilter === "all" && categoryFilter === "all"
                ? "No payments received recorded yet."
                : "No payments found for selected filters."}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
                  <tr>
                    <th className="px-4 py-3">Sr No.</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((pay, index) => (
                    <tr
                      key={pay._id}
                      className="border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="px-4 py-4 text-white/60">{index + 1}</td>
                      <td className="px-4 py-4">
                        {pay.project?.projectName ?? "—"}
                      </td>
                      <td className="px-4 py-4">{pay.title}</td>
                      <td className="px-4 py-4">
                        ₹{pay.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">{pay.category}</td>
                      <td className="px-4 py-4">
                        {pay.date
                          ? new Date(pay.date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-4">{pay.notes ?? "-"}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditingId(pay._id);
                            setForm({
                              title: pay.title,
                              amount: String(pay.amount),
                              type: pay.type,
                              category: pay.category,
                              date: pay.date
                                ? new Date(pay.date).toISOString().slice(0, 10)
                                : "",
                              notes: pay.notes,
                              paymentMethod: pay.paymentMethod,
                              project: pay.project,
                            });
                            setShowModal(true);
                          }}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removePayment(pay._id)}
                          className="ml-3 text-red-300 hover:text-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
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
              Add payment received
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Selected Project Payments */}
      {projectFilter !== "all" && (
        <div className="w-80 space-y-4">
          <div className="glass rounded-3xl p-6">
            <div className="mb-4">
              <div className="text-lg font-semibold">
                {projects.find((p) => p._id === projectFilter)?.projectName}
              </div>
              <div className="text-xs text-white/60">
                Payments for this project
              </div>
            </div>

            {selectedProjectPayments.length === 0 ? (
              <div className="text-sm text-white/60">
                No payments received for this project yet.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-sm text-white/60">Total</span>
                  <span className="text-lg font-bold">
                    ₹{selectedProjectTotal.toLocaleString()}
                  </span>
                </div>
                {selectedProjectPayments.map((pay) => (
                  <div
                    key={pay._id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">{pay.title}</div>
                      <div className="font-bold">
                        ₹{Number(pay.amount).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-white/60">
                      {pay.date ? new Date(pay.date).toLocaleDateString() : "-"}{" "}
                      • {pay.category}
                    </div>
                    {pay.notes && (
                      <div className="text-xs text-white/40 mt-1">
                        {pay.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#1b1b1f] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {isEditing ? "Edit Payment Received" : "Add Payment Received"}
                </div>
                <div className="text-xs text-white/60">
                  {isEditing
                    ? "Update the payment record."
                    : "Record a payment received against a project."}
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
                    type: "payment",
                    category: "Miscellaneous",
                    date: new Date().toISOString().slice(0, 10),
                    notes: "",
                  });
                }}
                className="text-white/60 hover:text-white transition-colors"
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

              <input
                required
                value={form.title ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
                placeholder="Title"
              />

              <div className="grid gap-3 md:grid-cols-3">
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
                <input
                  value={form.paymentMethod ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paymentMethod: e.target.value }))
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
                  placeholder="Payment method"
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
                      type: "payment",
                      category: "Miscellaneous",
                      date: new Date().toISOString().slice(0, 10),
                      notes: "",
                    });
                  }}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 transition-all"
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
