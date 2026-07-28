"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsBar from "@/components/StatsBar";
import {
  Upload,
  Layers,
  Users,
  ArrowRight,
  FileText,
  ExternalLink,
  Sparkles,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ActivityDay {
  date: string;
  label: string;
  count: number;
}

interface RecentDoc {
  id: number;
  document_subject: string;
  file_name: string;
  patient_name: string;
  category_name: string;
  date_of_report: string;
  s3_key: string;
}

interface CategoryStat {
  name: string;
  count: number;
  value: number;
  color: string;
}

interface InsightItem {
  label?: string;
  name?: string;
  count: number;
}

const avatarColors = [
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-emerald-500 to-teal-400",
  "from-orange-500 to-amber-400",
  "from-rose-500 to-pink-400",
  "from-indigo-500 to-blue-400",
];

function avatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const quickActions = [
  {
    icon: Upload,
    label: "New Upload",
    description: "Upload & extract a single PDF",
    href: "/upload",
    gradient: "from-blue-600 to-cyan-400",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Layers,
    label: "Batch Upload",
    description: "Process multiple PDFs at once",
    href: "/upload",
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: Users,
    label: "Patient Records",
    description: "Browse patients & documents",
    href: "/patients",
    gradient: "from-emerald-500 to-teal-400",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const categoryColors = ["#2563eb", "#22d3ee", "#8b5cf6", "#10b981", "#f59e0b"];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-blue-600 font-bold mt-0.5">
        {payload[0].value} {payload[0].value === 1 ? "document" : "documents"}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<CategoryStat[]>([]);
  const [monthlyData, setMonthlyData] = useState<InsightItem[]>([]);
  const [doctorData, setDoctorData] = useState<InsightItem[]>([]);

  useEffect(() => {
    fetch("/api/stats/activity")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setActivity(json.days);
      })
      .finally(() => setActivityLoading(false));

    fetch("/api/documents?limit=8&page=1")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setRecentDocs(json.documents);
      })
      .finally(() => setDocsLoading(false));

    fetch("/api/stats/categories")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const total = json.categories.reduce(
          (sum: number, category: { count: number }) => sum + category.count,
          0,
        );
        setCategoryData(
          json.categories.map((category: { name: string; count: number }, index: number) => ({
            ...category,
            value: total ? Math.round((category.count / total) * 100) : 0,
            color: categoryColors[index % categoryColors.length],
          })),
        );
      });

    fetch("/api/stats/insights")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setMonthlyData(json.monthly);
          setDoctorData(json.doctors);
        }
      });
  }, []);

  const maxCount = Math.max(...activity.map((d) => d.count), 1);
  const totalThisWeek = activity.reduce((s, d) => s + d.count, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 p-7 mb-6 shadow-xl shadow-blue-900/10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute right-48 -bottom-32 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-white/10">
              <Activity size={12} /> Clinic operations live
            </span>
            <h1 className="text-3xl font-bold text-white mt-4">Good morning</h1>
            <p className="text-sm text-blue-100/70 mt-1.5">
              Your document workflow is up to date and ready for review.
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex self-start md:self-auto items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 shadow-lg shadow-black/10 hover:bg-blue-50 hover:-translate-y-0.5 transition-all"
          >
            <Sparkles size={16} className="text-blue-600" /> Process a document
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <StatsBar />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Activity Chart ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                Upload Activity
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Documents uploaded : last 7 days
              </p>
            </div>
            {!activityLoading && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
                {totalThisWeek} this week
              </span>
            )}
          </div>

          {activityLoading ? (
            <div className="h-48 flex items-end gap-2 px-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gray-100 rounded-t-lg animate-pulse"
                  style={{ height: `60%` }}
                />
              ))}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={192}>
              <BarChart
                data={activity}
                barSize={28}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, maxCount + 1]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f8fafc", radius: 6 }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  fill="url(#barGrad)"
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Quick Actions ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            {quickActions.map(
              ({
                icon: Icon,
                label,
                description,
                href,
                bg,
                iconColor,
              }) => (
                <Link
                  key={label}
                  href={href}
                  className="group relative overflow-hidden flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
                  >
                    <Icon size={18} className={iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">
                      {label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {description}
                    </p>
                  </div>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
              ),
            )}
          </div>
        </div>
      </div>

      {/* ── Six-month trend and doctor workload ────────────────────── */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Document Volume</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly processing trend</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-violet-50 text-violet-600 rounded-full">
              Last 6 months
            </span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#ddd6fe" }} />
              <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#volumeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-slate-700">Documents by GP</h2>
            <p className="text-xs text-gray-400 mt-0.5">Record volume by assigned doctor</p>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={doctorData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Documents by Category ───────────────────────────────────── */}
      <div className="mt-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-slate-700">
            Documents by Category
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Distribution across all document types
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <PieChart width={200} height={200}>
              <Pie
                data={categoryData}
                cx={100}
                cy={100}
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                formatter={(_value, _name, item) =>
                  [`${item.payload.count} documents`, item.payload.name] as [string, string]
                }
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #f1f5f9",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </div>
          <div className="flex-1 w-full space-y-3">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span
                  className="shrink-0 w-2.5 h-2.5 rounded-full"
                  style={{ background: cat.color }}
                />
                <span className="flex-1 text-sm text-slate-600">
                  {cat.name}
                </span>
                <div className="w-32 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.value}%`, background: cat.color }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500 w-8 text-right">
                  {cat.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Uploads ───────────────────────────────────────────── */}
      <div className="mt-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              Recent Uploads
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Last 8 documents added
            </p>
          </div>
          <Link
            href="/patients"
            className="text-xs font-medium text-blue-500 hover:text-blue-700 flex items-center gap-1 transition"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {docsLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-14 bg-gray-50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <FileText size={36} className="mb-2 opacity-40" />
            <p className="text-sm">No documents yet — upload your first one</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 py-3 group">
                {doc.patient_name && (
                  <div
                    className={`shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${avatarColor(doc.patient_name)} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {getInitials(doc.patient_name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {doc.document_subject || doc.file_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {doc.patient_name && (
                      <span className="text-xs text-gray-400">
                        {doc.patient_name}
                      </span>
                    )}
                    {doc.category_name && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded-md font-medium">
                        {doc.category_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  {doc.date_of_report && (
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {formatDate(doc.date_of_report)}
                    </span>
                  )}
                  <a
                    href={`/api/files/${encodeURIComponent(doc.s3_key)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition"
                    title="Open PDF"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
