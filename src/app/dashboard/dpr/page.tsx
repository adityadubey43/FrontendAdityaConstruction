"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";

type DPRRecord = {
  _id: string;
  date: string;
  projectId: {
    _id: string;
    projectName: string;
  };
  siteId: string;
  weather: string;
  status: string;
  attendance: any[];
  workProgress: any[];
  submittedAt: string;
};

export default function DPRPage() {
  const [dprRecords, setDprRecords] = useState<DPRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<any[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("acls_token") || "" : "";

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    siteId: "",
    weather: "sunny",
    attendance: [
      {
        type: "mason",
        count: 0,
        hours: 8,
        image: ""
      }
    ],
    workProgress: [
      {
        category: "RCC",
        description: "",
        quantity: "",
        status: "ongoing",
        images: []
      }
    ],
    issues: [],
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dprData, projectsData] = await Promise.all([
        apiFetch<DPRRecord[]>("/api/dpr/my-dpr", { token }),
        apiFetch<any[]>("/api/project-assignments/my-projects", { token })
      ]);

      setDprRecords(dprData);
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updatedDPR = await apiFetch<DPRRecord>(`/api/dpr/${editingId}`, {
          token,
          method: "PUT",
          body: form
        });
        setDprRecords(prev =>
          prev.map(dpr => (dpr._id === editingId ? updatedDPR : dpr))
        );
      } else {
        const createdDPR = await apiFetch<DPRRecord>("/api/dpr", {
          token,
          method: "POST",
          body: form
        });
        setDprRecords(prev => [createdDPR, ...prev]);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({
        date: new Date().toISOString().split("T")[0],
        projectId: "",
        siteId: "",
        weather: "sunny",
        attendance: [{ type: "mason", count: 0, hours: 8, image: "" }],
        workProgress: [{ category: "RCC", description: "", quantity: "", status: "ongoing", images: [] }],
        issues: [],
        notes: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save DPR");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiFetch(`/api/dpr/${id}`, { token, method: "DELETE" });
      setDprRecords(prev => prev.filter(dpr => dpr._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete DPR");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Daily Progress Reports</h1>
        <Button
          onClick={() => {
            setEditingId(null);
            setShowModal(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New DPR
        </Button>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="space-y-4">
        {dprRecords.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-600">
            No DPR records found. Create one to get started!
          </div>
        ) : (
          dprRecords.map(dpr => (
            <div key={dpr._id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{dpr.projectId.projectName}</h3>
                  <p className="text-sm text-gray-600">{new Date(dpr.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Site: {dpr.siteId}</p>
                  <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {dpr.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(dpr._id);
                      setForm({
                        date: dpr.date,
                        projectId: dpr.projectId._id,
                        siteId: dpr.siteId,
                        weather: dpr.weather,
                        attendance: dpr.attendance,
                        workProgress: dpr.workProgress,
                        issues: [],
                        notes: ""
                      });
                      setShowModal(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDelete(dpr._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{editingId ? "Edit DPR" : "Create DPR"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Project</label>
                  <select
                    value={form.projectId}
                    onChange={e => setForm({ ...form, projectId: e.target.value })}
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-[#1b1b1f]">Select Project</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id} className="bg-[#1b1b1f]">
                        {p.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Site ID</label>
                  <input
                    type="text"
                    value={form.siteId}
                    onChange={e => setForm({ ...form, siteId: e.target.value })}
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Weather</label>
                  <select
                    value={form.weather}
                    onChange={e => setForm({ ...form, weather: e.target.value })}
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option className="bg-[#1b1b1f]">sunny</option>
                    <option className="bg-[#1b1b1f]">rainy</option>
                    <option className="bg-[#1b1b1f]">cloudy</option>
                    <option className="bg-[#1b1b1f]">windy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? "Update" : "Create"} DPR
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
