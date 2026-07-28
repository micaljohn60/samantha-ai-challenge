"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  UsersRound,
  FolderOpen,
  Clock3,
  ArrowUpRight,
} from "lucide-react";

interface PatientDoc {
  document_id: number;
  document_subject: string;
  date_of_report: string;
  s3_key: string;
  gp_name: string;
}

interface Patient {
  patient_id: number;
  full_name: string;
  documents: PatientDoc[];
}

interface Document {
  id: number;
  file_name: string;
  s3_key: string;
  created_at: string;
  document_subject: string;
  date_of_report: string;
  doctor_name: string;
  category_name: string;
  patient_name: string;
}

interface Category {
  id: number;
  name: string;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
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

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PatientsPage() {
  const [tab, setTab] = useState<"patients" | "documents">("patients");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientLoading, setPatientLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientPage, setPatientPage] = useState(1);
  const [patientTotalPages, setPatientTotalPages] = useState(1);
  const [patientTotal, setPatientTotal] = useState(0);
  const [patientSearch, setPatientSearch] = useState("");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [docSearch, setDocSearch] = useState("");
  const [docCategory, setDocCategory] = useState("");
  const [docDateFrom, setDocDateFrom] = useState("");
  const [docDateTo, setDocDateTo] = useState("");
  const [docPage, setDocPage] = useState(1);
  const [docTotalPages, setDocTotalPages] = useState(1);
  const [docTotal, setDocTotal] = useState(0);
  const [docLoading, setDocLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setPatientLoading(true);
    fetch(`/api/patients-documents?page=${patientPage}&limit=12`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setPatients(json.data);
          setPatientTotalPages(json.pagination.totalPages);
          setPatientTotal(json.pagination.totalItems);
        }
      })
      .finally(() => setPatientLoading(false));
  }, [patientPage]);

  useEffect(() => {
    fetch("/api/category")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategories(json.categories); });
  }, []);

  const fetchDocuments = useCallback(() => {
    setDocLoading(true);
    const params = new URLSearchParams();
    if (docSearch) params.set("search", docSearch);
    if (docCategory) params.set("category", docCategory);
    if (docDateFrom) params.set("dateFrom", docDateFrom);
    if (docDateTo) params.set("dateTo", docDateTo);
    params.set("page", String(docPage));
    params.set("limit", "15");

    fetch(`/api/documents?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setDocuments(json.documents);
          setDocTotalPages(json.totalPages ?? 1);
          setDocTotal(json.total ?? 0);
        }
      })
      .finally(() => setDocLoading(false));
  }, [docSearch, docCategory, docDateFrom, docDateTo, docPage]);

  useEffect(() => {
    if (tab === "documents") fetchDocuments();
  }, [tab, fetchDocuments]);

  useEffect(() => { setDocPage(1); }, [docSearch, docCategory, docDateFrom, docDateTo]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPatient(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const hasDocFilters = docSearch || docCategory || docDateFrom || docDateTo;

  const clearDocFilters = () => {
    setDocSearch("");
    setDocCategory("");
    setDocDateFrom("");
    setDocDateTo("");
  };

  const filteredPatients = patients.filter((p) =>
    p.full_name.toLowerCase().includes(patientSearch.toLowerCase()),
  );
  const pageDocumentCount = patients.reduce(
    (total, patient) => total + (patient.documents?.filter((doc) => doc.document_id).length || 0),
    0,
  );

  return (
    <div className="min-h-full bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 p-7 mb-6 shadow-xl shadow-blue-900/10">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute right-36 -bottom-28 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live patient registry
              </span>
              <h1 className="text-3xl font-bold text-white mt-4">Clinical Records</h1>
              <p className="text-blue-100/70 mt-1.5 text-sm">One secure view of every patient and document.</p>
            </div>

          <div className="inline-flex self-start lg:self-auto bg-white/10 ring-1 ring-white/15 rounded-xl p-1 backdrop-blur-sm">
            <button
              onClick={() => setTab("patients")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "patients"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-sm"
                  : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}
            >
              Patients
            </button>
            <button
              onClick={() => setTab("documents")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "documents"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-sm"
                  : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}
            >
              Documents
            </button>
          </div>
        </div>
        </div>

        {/* ── PATIENTS TAB ─────────────────────────────────────────────── */}
        {tab === "patients" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><UsersRound size={19} /></div>
                <div><p className="text-xl font-bold text-slate-800">{patientTotal.toLocaleString()}</p><p className="text-xs text-slate-400">Patient profiles</p></div>
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center"><FolderOpen size={19} /></div>
                <div><p className="text-xl font-bold text-slate-800">{pageDocumentCount}</p><p className="text-xs text-slate-400">Records on this page</p></div>
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Clock3 size={19} /></div>
                <div><p className="text-xl font-bold text-slate-800">Updated</p><p className="text-xs text-slate-400">Current registry</p></div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mb-5 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
              <p className="hidden sm:block pl-2 text-sm text-slate-500">
                Showing {patients.length} profiles
              </p>
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-gray-800 border-gray-100 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {patientLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4 animate-pulse">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <Search size={40} className="mb-3 opacity-50" />
                <p className="font-medium">No patients found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                {filteredPatients.map((p) => (
                  <button
                    key={p.patient_id}
                    onClick={() => setSelectedPatient(p)}
                    className="group relative overflow-hidden text-left bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 p-5"
                  >
                    <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${avatarColor(p.full_name)} opacity-0 group-hover:opacity-100 transition`} />
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColor(p.full_name)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                        {getInitials(p.full_name)}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-semibold text-slate-800 truncate">{p.full_name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Patient #{String(p.patient_id).padStart(4, "0")}</p>
                      </div>
                      <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition" />
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText size={13} className="text-blue-500" />
                        <span className="text-xs font-medium text-slate-500">
                          {p.documents?.length || 0} document{p.documents?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {patientTotalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPatientPage((p) => Math.max(p - 1, 1))}
                  disabled={patientPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <span className="text-sm text-gray-500 font-medium px-2">
                  {patientPage} / {patientTotalPages}
                </span>
                <button
                  onClick={() => setPatientPage((p) => Math.min(p + 1, patientTotalPages))}
                  disabled={patientPage === patientTotalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ── DOCUMENTS TAB ────────────────────────────────────────────── */}
        {tab === "documents" && (
          <>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-5">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient or subject…"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>

                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={docDateFrom}
                  onChange={(e) => setDocDateFrom(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />

                <input
                  type="date"
                  value={docDateTo}
                  onChange={(e) => setDocDateTo(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />

                {hasDocFilters && (
                  <button
                    onClick={clearDocFilters}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition"
                  >
                    <X size={14} /> Clear
                  </button>
                )}
              </div>

              {docTotal > 0 && (
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                  <SlidersHorizontal size={12} />
                  {docTotal.toLocaleString()} document{docTotal !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            {docLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <FileText size={40} className="mb-3 opacity-50" />
                <p className="font-medium">No documents found</p>
                {hasDocFilters && (
                  <button onClick={clearDocFilters} className="mt-2 text-sm text-blue-500 hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 hover:shadow-sm transition group"
                  >
                    {doc.patient_name && (
                      <div className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColor(doc.patient_name)} flex items-center justify-center text-white text-xs font-bold`}>
                        {getInitials(doc.patient_name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm truncate">
                          {doc.document_subject || doc.file_name}
                        </span>
                        {doc.category_name && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                            {doc.category_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {doc.patient_name && <span>{doc.patient_name}</span>}
                        {doc.doctor_name && <span>· GP: {doc.doctor_name}</span>}
                        {doc.date_of_report && <span>· {formatDate(doc.date_of_report)}</span>}
                      </div>
                    </div>
                    <a
                      href={`/api/files/${encodeURIComponent(doc.s3_key)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition"
                      title="Open PDF"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            )}

            {docTotalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDocPage((p) => Math.max(p - 1, 1))}
                  disabled={docPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <span className="text-sm text-gray-500 font-medium px-2">
                  {docPage} / {docTotalPages}
                </span>
                <button
                  onClick={() => setDocPage((p) => Math.min(p + 1, docTotalPages))}
                  disabled={docPage === docTotalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-r ${avatarColor(selectedPatient.full_name)} p-6 flex items-center gap-4`}>
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                {getInitials(selectedPatient.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">{selectedPatient.full_name}</h2>
                <p className="text-white/80 text-sm mt-0.5">
                  {selectedPatient.documents?.length || 0} document{selectedPatient.documents?.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="shrink-0 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Documents</p>
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {selectedPatient.documents?.length > 0 ? (
                  selectedPatient.documents.map((doc) => (
                    <a
                      key={doc.document_id}
                      href={`/api/files/${encodeURIComponent(doc.s3_key)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mt-0.5">
                          <FileText size={14} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            {doc.document_subject || "Untitled"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {doc.gp_name ? `GP: ${doc.gp_name}` : "No GP recorded"}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-400">{formatDate(doc.date_of_report)}</span>
                        <ExternalLink size={12} className="text-gray-300 group-hover:text-blue-400 transition" />
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <FileText size={32} className="mb-2 opacity-40" />
                    <p className="text-sm">No documents available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
