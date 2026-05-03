"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";

type AttendanceItem = {
  type: string;
  count: number;
  hours: number;
  image: string;
};

type WorkProgressItem = {
  category: string;
  description: string;
  quantity: string;
  status: string;
  images: string[];
};

type IssueItem = {
  type: string;
  description: string;
  impact: string;
};

type ProjectItem = {
  _id: string;
  projectName: string;
};

type DPRRecord = {
  _id: string;
  date: string;
  projectId: ProjectItem;
  siteId: string;
  weather: string;
  status: string;
  attendance: AttendanceItem[];
  workProgress: WorkProgressItem[];
  issues: IssueItem[];
  materials?: {
    cement: number;
    steel: number;
    sand: number;
    gravel: number;
  };
  notes?: string;
  submittedAt: string;
};

export default function DPRPage() {
  const [dprRecords, setDprRecords] = useState<DPRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("acls_token") || ""
      : "";

  const [form, setForm] = useState<{
    date: string;
    projectId: string;
    siteId: string;
    weather: string;
    attendance: AttendanceItem[];
    workProgress: WorkProgressItem[];
    issues: IssueItem[];
    materials: {
      cement: number;
      steel: number;
      sand: number;
      gravel: number;
    };
    notes: string;
  }>({
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    siteId: "",
    weather: "sunny",
    attendance: [
      {
        type: "mason",
        count: 0,
        hours: 8,
        image: "",
      },
    ],
    workProgress: [
      {
        category: "RCC",
        description: "",
        quantity: "",
        status: "ongoing",
        images: [],
      },
    ],
    issues: [],
    materials: {
      cement: 0,
      steel: 0,
      sand: 0,
      gravel: 0,
    },
    notes: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dprData, projectsData] = await Promise.all([
        apiFetch<DPRRecord[]>("/api/dpr/my-dpr", { token }),
        apiFetch<ProjectItem[]>("/api/projects", {
          token,
        }),
      ]);

      setDprRecords(dprData);
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updatedDPR = await apiFetch<DPRRecord>(`/api/dpr/${editingId}`, {
          token,
          method: "PUT",
          body: form,
        });
        setDprRecords((prev) =>
          prev.map((dpr) => (dpr._id === editingId ? updatedDPR : dpr)),
        );
      } else {
        const createdDPR = await apiFetch<DPRRecord>("/api/dpr", {
          token,
          method: "POST",
          body: form,
        });
        setDprRecords((prev) => [createdDPR, ...prev]);
      }
      setShowModal(false);
      setEditingId(null);
      setIsEditing(false);
      resetForm();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save DPR");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiFetch(`/api/dpr/${id}`, { token, method: "DELETE" });
      setDprRecords((prev) => prev.filter((dpr) => dpr._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete DPR");
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split("T")[0],
      projectId: "",
      siteId: "",
      weather: "sunny",
      attendance: [{ type: "mason", count: 0, hours: 8, image: "" }],
      workProgress: [
        {
          category: "RCC",
          description: "",
          quantity: "",
          status: "ongoing",
          images: [],
        },
      ],
      issues: [],
      materials: { cement: 0, steel: 0, sand: 0, gravel: 0 },
      notes: "",
    });
    setCurrentStep(1);
  };

  const openNewDPR = () => {
    resetForm();
    setEditingId(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditDPR = (dpr: DPRRecord) => {
    setForm({
      date: dpr.date,
      projectId: dpr.projectId._id,
      siteId: dpr.siteId,
      weather: dpr.weather,
      attendance: dpr.attendance || [
        { type: "mason", count: 0, hours: 8, image: "" },
      ],
      workProgress: dpr.workProgress || [
        {
          category: "RCC",
          description: "",
          quantity: "",
          status: "ongoing",
          images: [],
        },
      ],
      issues: dpr.issues || [],
      materials: dpr.materials || { cement: 0, steel: 0, sand: 0, gravel: 0 },
      notes: dpr.notes || "",
    });
    setEditingId(dpr._id);
    setIsEditing(true);
    setCurrentStep(1);
    setShowModal(true);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Daily Progress Reports</h1>
        <Button onClick={openNewDPR} className="gap-2">
          <Plus className="h-4 w-4" />
          New DPR
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <div className="space-y-4">
        {dprRecords.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-600">
            No DPR records found. Create one to get started!
          </div>
        ) : (
          dprRecords.map((dpr) => (
            <div
              key={dpr._id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">
                      {dpr.projectId.projectName}
                    </h3>
                    <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {dpr.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(dpr.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Site: {dpr.siteId} | Weather: {dpr.weather}
                  </p>

                  {/* Attendance Summary */}
                  {dpr.attendance && dpr.attendance.length > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Attendance:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dpr.attendance.map((att, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white px-2 py-1 rounded border"
                          >
                            {att.type}: {att.count} × {att.hours}h
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Progress Summary */}
                  {dpr.workProgress && dpr.workProgress.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Work Progress:
                      </p>
                      <div className="space-y-1">
                        {dpr.workProgress.slice(0, 2).map((work, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium">
                              {work.category}:
                            </span>{" "}
                            {work.quantity} - {work.status}
                          </div>
                        ))}
                        {dpr.workProgress.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{dpr.workProgress.length - 2} more...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Issues Summary */}
                  {dpr.issues && dpr.issues.length > 0 && (
                    <div className="mt-2 p-2 bg-red-50 rounded">
                      <p className="text-xs font-semibold text-red-700 mb-1">
                        Issues ({dpr.issues.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {dpr.issues.slice(0, 3).map((issue, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-red-100 px-2 py-1 rounded"
                          >
                            {issue.type}
                          </span>
                        ))}
                        {dpr.issues.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{dpr.issues.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openEditDPR(dpr)}
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
          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? "bg-blue-600 text-white"
                      : step < currentStep
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 5 && (
                    <div
                      className={`w-12 h-1 ${
                        step < currentStep ? "bg-green-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Titles */}
            <div className="flex justify-between text-xs text-gray-400 mb-6">
              <span>Site Info</span>
              <span>Manpower</span>
              <span>Work Progress</span>
              <span>Issues & Materials</span>
              <span>Review</span>
            </div>

            <h2 className="text-xl font-bold text-white">
              {isEditing ? "Edit DPR" : "Create DPR"} - Step {currentStep}
            </h2>

            {/* Step 1: Site Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Step 1: Site Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Project</label>
                    <select
                      value={form.projectId}
                      onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                      className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="bg-[#1b1b1f]">Select Project</option>
                      {projects.map((p) => (
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
                      onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                      className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Weather</label>
                    <select
                      value={form.weather}
                      onChange={(e) => setForm({ ...form, weather: e.target.value })}
                      className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option className="bg-[#1b1b1f]">sunny</option>
                      <option className="bg-[#1b1b1f]">rainy</option>
                      <option className="bg-[#1b1b1f]">cloudy</option>
                      <option className="bg-[#1b1b1f]">windy</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Manpower Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Step 2: Manpower Information</h3>
                <div className="space-y-2">
                  {form.attendance.map((att, index) => (
                    <div key={index} className="border border-white/10 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2 items-center">
                        <select
                          value={att.type}
                          onChange={(e) => {
                            const newAttendance = [...form.attendance];
                            newAttendance[index].type = e.target.value;
                            setForm({ ...form, attendance: newAttendance });
                          }}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="mason" className="bg-[#1b1b1f]">Mason</option>
                          <option value="helper" className="bg-[#1b1b1f]">Helper</option>
                          <option value="electrician" className="bg-[#1b1b1f]">Electrician</option>
                          <option value="plumber" className="bg-[#1b1b1f]">Plumber</option>
                          <option value="carpenter" className="bg-[#1b1b1f]">Carpenter</option>
                          <option value="other" className="bg-[#1b1b1f]">Other</option>
                        </select>

                        <input
                          type="number"
                          placeholder="Count"
                          value={att.count}
                          onChange={(e) => {
                            const newAttendance = [...form.attendance];
                            newAttendance[index].count = parseInt(e.target.value) || 0;
                            setForm({ ...form, attendance: newAttendance });
                          }}
                          className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                          type="number"
                          placeholder="Hours"
                          value={att.hours}
                          onChange={(e) => {
                            const newAttendance = [...form.attendance];
                            newAttendance[index].hours = parseInt(e.target.value) || 0;
                            setForm({ ...form, attendance: newAttendance });
                          }}
                          className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const newAttendance = form.attendance.filter((_, i) => i !== index);
                            setForm({ ...form, attendance: newAttendance });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white mb-1">Manpower Photo URL (Required)</label>
                        <input
                          type="text"
                          placeholder="Upload manpower group photo URL"
                          value={att.image}
                          onChange={(e) => {
                            const newAttendance = [...form.attendance];
                            newAttendance[index].image = e.target.value;
                            setForm({ ...form, attendance: newAttendance });
                          }}
                          className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {att.image && (
                          <div className="mt-2">
                            <img src={att.image} alt="Manpower" className="h-20 w-20 object-cover rounded" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setForm({
                        ...form,
                        attendance: [...form.attendance, { type: "mason", count: 0, hours: 8, image: "" }],
                      });
                    }}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Manpower Type
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Work Progress */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Step 3: Work Progress Details</h3>
                <div className="space-y-2">
                  {form.workProgress.map((work, index) => (
                    <div key={index} className="border border-white/10 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={work.category}
                          onChange={(e) => {
                            const newWorkProgress = [...form.workProgress];
                            newWorkProgress[index].category = e.target.value;
                            setForm({ ...form, workProgress: newWorkProgress });
                          }}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="RCC" className="bg-[#1b1b1f]">RCC</option>
                          <option value="Brickwork" className="bg-[#1b1b1f]">Brickwork</option>
                          <option value="Flooring" className="bg-[#1b1b1f]">Flooring</option>
                          <option value="Plastering" className="bg-[#1b1b1f]">Plastering</option>
                          <option value="Painting" className="bg-[#1b1b1f]">Painting</option>
                          <option value="Electrical" className="bg-[#1b1b1f]">Electrical</option>
                          <option value="Plumbing" className="bg-[#1b1b1f]">Plumbing</option>
                          <option value="Other" className="bg-[#1b1b1f]">Other</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Quantity"
                          value={work.quantity}
                          onChange={(e) => {
                            const newWorkProgress = [...form.workProgress];
                            newWorkProgress[index].quantity = e.target.value;
                            setForm({ ...form, workProgress: newWorkProgress });
                          }}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <select
                          value={work.status}
                          onChange={(e) => {
                            const newWorkProgress = [...form.workProgress];
                            newWorkProgress[index].status = e.target.value;
                            setForm({ ...form, workProgress: newWorkProgress });
                          }}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="completed" className="bg-[#1b1b1f]">Completed</option>
                          <option value="ongoing" className="bg-[#1b1b1f]">Ongoing</option>
                          <option value="delayed" className="bg-[#1b1b1f]">Delayed</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        placeholder="Work description"
                        value={work.description}
                        onChange={(e) => {
                          const newWorkProgress = [...form.workProgress];
                          newWorkProgress[index].description = e.target.value;
                          setForm({ ...form, workProgress: newWorkProgress });
                        }}
                        className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div>
                        <label className="block text-xs font-medium text-white mb-1">Work Images (comma-separated URLs)</label>
                        <input
                          type="text"
                          placeholder="Work progress images"
                          value={work.images.join(', ')}
                          onChange={(e) => {
                            const newWorkProgress = [...form.workProgress];
                            newWorkProgress[index].images = e.target.value.split(',').map(url => url.trim()).filter(url => url);
                            setForm({ ...form, workProgress: newWorkProgress });
                          }}
                          className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const newWorkProgress = form.workProgress.filter((_, i) => i !== index);
                          setForm({ ...form, workProgress: newWorkProgress });
                        }}
                      >
                        <X className="h-3 w-3" />
                        Remove Work
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setForm({
                        ...form,
                        workProgress: [...form.workProgress, { category: "RCC", description: "", quantity: "", status: "ongoing", images: [] }],
                      });
                    }}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Work Progress
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Issues & Materials */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Step 4: Issues & Materials</h3>
                
                {/* Issues Section */}
                <div>
                  <h4 className="text-md font-medium text-white mb-2">Issues Encountered</h4>
                  <div className="space-y-2">
                    {form.issues.map((issue, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <select
                          value={issue.type}
                          onChange={(e) => {
                            const newIssues = [...form.issues];
                            newIssues[index].type = e.target.value;
                            setForm({ ...form, issues: newIssues });
                          }}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="material" className="bg-[#1b1b1f]">Material</option>
                          <option value="labour" className="bg-[#1b1b1f]">Labour</option>
                          <option value="weather" className="bg-[#1b1b1f]">Weather</option>
                          <option value="equipment" className="bg-[#1b1b1f]">Equipment</option>
                          <option value="safety" className="bg-[#1b1b1f]">Safety</option>
                          <option value="other" className="bg-[#1b1b1f]">Other</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Issue description"
                          value={issue.description}
                          onChange={(e) => {
                            const newIssues = [...form.issues];
                            newIssues[index].description = e.target.value;
                            setForm({ ...form, issues: newIssues });
                          }}
                          className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <select
                          value={issue.impact}
                          onChange={(e) => {
                            const newIssues = [...form.issues];
                            newIssues[index].impact = e.target.value;
                            setForm({ ...form, issues: newIssues });
                          }}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low" className="bg-[#1b1b1f]">Low</option>
                          <option value="medium" className="bg-[#1b1b1f]">Medium</option>
                          <option value="high" className="bg-[#1b1b1f]">High</option>
                        </select>

                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const newIssues = form.issues.filter((_, i) => i !== index);
                            setForm({ ...form, issues: newIssues });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setForm({
                          ...form,
                          issues: [...form.issues, { type: "material", description: "", impact: "low" }],
                        });
                      }}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Issue
                    </Button>
                  </div>
                </div>

                {/* Materials Section */}
                <div>
                  <h4 className="text-md font-medium text-white mb-2">Materials Used (Optional)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">Cement (bags)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.materials?.cement || ""}
                        onChange={(e) => setForm({
                          ...form,
                          materials: { ...form.materials, cement: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">Steel (tons)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.materials?.steel || ""}
                        onChange={(e) => setForm({
                          ...form,
                          materials: { ...form.materials, steel: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">Sand (cubic ft)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.materials?.sand || ""}
                        onChange={(e) => setForm({
                          ...form,
                          materials: { ...form.materials, sand: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">Gravel (cubic ft)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.materials?.gravel || ""}
                        onChange={(e) => setForm({
                          ...form,
                          materials: { ...form.materials, gravel: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Step 5: Review & Submit</h3>
                
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-white">Site Information</h4>
                    <p className="text-sm text-gray-300">Date: {form.date}</p>
                    <p className="text-sm text-gray-300">Project: {projects.find(p => p._id === form.projectId)?.projectName || 'Not selected'}</p>
                    <p className="text-sm text-gray-300">Site ID: {form.siteId}</p>
                    <p className="text-sm text-gray-300">Weather: {form.weather}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-white">Manpower ({form.attendance.length} types)</h4>
                    {form.attendance.map((att, idx) => (
                      <p key={idx} className="text-sm text-gray-300">
                        {att.type}: {att.count} workers × {att.hours} hours
                      </p>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-medium text-white">Work Progress ({form.workProgress.length} items)</h4>
                    {form.workProgress.map((work, idx) => (
                      <p key={idx} className="text-sm text-gray-300">
                        {work.category}: {work.quantity} - {work.status}
                      </p>
                    ))}
                  </div>

                  {form.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white">Issues ({form.issues.length})</h4>
                      {form.issues.map((issue, idx) => (
                        <p key={idx} className="text-sm text-gray-300">
                          {issue.type}: {issue.description} ({issue.impact})
                        </p>
                      ))}
                    </div>
                  )}

                  {form.notes && (
                    <div>
                      <h4 className="font-medium text-white">Notes</h4>
                      <p className="text-sm text-gray-300">{form.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep === 5 ? (
                <Button type="submit" onClick={handleSubmit} className="gap-2">
                  <Check className="h-4 w-4" />
                  {isEditing ? "Update" : "Submit"} DPR
                </Button>
              ) : (
                <Button type="button" onClick={nextStep} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
