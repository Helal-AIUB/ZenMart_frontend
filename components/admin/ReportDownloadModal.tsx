"use client";

import { useState } from "react";
import {
  X,
  FileText,
  Package,
  ShoppingCart,
  Users,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";

interface ReportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportDownloadModal({
  isOpen,
  onClose,
}: ReportDownloadModalProps) {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("30");

  const [downloadingFormat, setDownloadingFormat] = useState<
    "csv" | "pdf" | null
  >(null);

  if (!isOpen) return null;

  const reportTypes = [
    {
      id: "sales",
      label: "Sales & Revenue",
      icon: FileText,
      desc: "Revenue, taxes, and discounts",
    },
    {
      id: "inventory",
      label: "Inventory & Stock",
      icon: Package,
      desc: "Current stock and low alerts",
    },
    {
      id: "orders",
      label: "Order Fulfillment",
      icon: ShoppingCart,
      desc: "Order statuses and details",
    },
    {
      id: "customers",
      label: "Customer Insights",
      icon: Users,
      desc: "Customer list and total spent",
    },
  ];

  const handleDownload = async (format: "csv" | "pdf") => {
    setDownloadingFormat(format);

    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // API call
      const response = await fetch(
        `${apiUrl}/reports/export/?type=${reportType}&range=${dateRange}&file_type=${format}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to download");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PetoraBD_${reportType}_report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        `${reportTypes.find((r) => r.id === reportType)?.label} downloaded as ${format.toUpperCase()}!`,
        {
          style: {
            borderRadius: "12px",
            background: "#10b981",
            color: "#fff",
            fontWeight: "bold",
          },
          iconTheme: { primary: "#fff", secondary: "#10b981" },
        },
      );
      onClose();
    } catch (error) {
      toast.error("Download failed. Please check admin permissions.");
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Export Report</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Download business analytics
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
          {/* Step 1: Select Report Type */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
              1. Select Report Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                const isActive = reportType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                      isActive
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl ${isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-bold ${isActive ? "text-emerald-700" : "text-slate-700"}`}
                      >
                        {type.label}
                      </h4>
                      <p
                        className={`text-[10px] font-medium leading-snug mt-0.5 ${isActive ? "text-emerald-600/80" : "text-slate-400"}`}
                      >
                        {type.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Date Range */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
              2. Select Date Range
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "7", label: "Last 7 Days" },
                { id: "30", label: "Last 30 Days" },
                { id: "90", label: "Last 3 Months" },
                { id: "all", label: "All Time" },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    dateRange === range.id
                      ? "bg-slate-800 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with TWO Export Options */}
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center gap-3 mt-auto">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors mr-auto"
          >
            Cancel
          </button>

          <button
            onClick={() => handleDownload("csv")}
            disabled={downloadingFormat !== null}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {downloadingFormat === "csv" ? (
              <Loader2 size={16} className="animate-spin text-emerald-600" />
            ) : (
              <FileSpreadsheet size={16} className="text-emerald-600" />
            )}
            Export CSV
          </button>

          <button
            onClick={() => handleDownload("pdf")}
            disabled={downloadingFormat !== null}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {downloadingFormat === "pdf" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
