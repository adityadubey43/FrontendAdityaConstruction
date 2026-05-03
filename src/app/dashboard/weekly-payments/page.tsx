"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, DollarSign } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

type WeeklyPayment = {
  _id: string;
  weekStartDate: string;
  weekEndDate: string;
  projectId: {
    _id: string;
    projectName: string;
  };
  siteId: string;
  breakdown: any[];
  totalAmount: number;
  status: "pending" | "approved" | "paid";
  createdAt: string;
};

export default function WeeklyPaymentsPage() {
  const [payments, setPayments] = useState<WeeklyPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "paid">("all");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [projects, setProjects] = useState<any[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("acls_token") || "" : "";

  useEffect(() => {
    fetchPayments();
  }, [token, statusFilter, projectFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      let url = "/api/weekly-payments";
      const params = [];
      
      if (statusFilter !== "all") {
        params.push(`status=${statusFilter}`);
      }

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const [paymentsData, projectsData] = await Promise.all([
        apiFetch<WeeklyPayment[]>(url, { token }),
        apiFetch<any[]>("/api/projects", { token })
      ]);

      let filtered = paymentsData;
      if (projectFilter) {
        filtered = paymentsData.filter(p => p.projectId._id === projectFilter);
      }

      setPayments(filtered);
      setProjects(projectsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case "paid":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "approved":
        return "bg-blue-50 border-blue-200";
      case "paid":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Weekly Labour Payments</h1>
        <div className="flex gap-2">
          {["all", "pending", "approved", "paid"].map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "secondary"}
              onClick={() => setStatusFilter(status as any)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Pending</p>
          <p className="text-2xl font-bold">
            ₹{payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.totalAmount, 0)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Approved</p>
          <p className="text-2xl font-bold">
            ₹{payments.filter(p => p.status === "approved").reduce((sum, p) => sum + p.totalAmount, 0)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="text-2xl font-bold">
            ₹{payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.totalAmount, 0)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectName || project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-600">
            No payments found
          </div>
        ) : (
          payments.map(payment => (
            <div
              key={payment._id}
              className={`rounded-lg border p-6 ${getStatusStyles(payment.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.status)}
                    <h3 className="text-lg font-semibold">{payment.projectId.projectName}</h3>
                    <span className="text-sm text-gray-600">({payment.siteId})</span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    Week of {new Date(payment.weekStartDate).toLocaleDateString()} to{" "}
                    {new Date(payment.weekEndDate).toLocaleDateString()}
                  </p>

                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {payment.breakdown.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium capitalize">{item.type}</p>
                        <p className="text-gray-600">{item.totalDays} days</p>
                        <p className="font-semibold">₹{item.totalAmount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="flex items-center gap-1 text-2xl font-bold">
                      <DollarSign className="h-6 w-6" />
                      {payment.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
