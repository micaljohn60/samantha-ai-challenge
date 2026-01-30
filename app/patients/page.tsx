"use client";
import { useEffect, useState } from "react";

interface Document {
  document_id: number;
  document_subject: string;
  date_of_report: string;
  s3_key: string;
  gp_name: string;
}

interface Patient {
  patient_id: number;
  full_name: string;
  documents: Document[];
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [openPopup, setOpenPopup] = useState<number | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const res = await fetch("/api/patients-documents");
      const json = await res.json();
      if (json.success) setPatients(json.data);
    };
    fetchPatients();
  }, []);

  const handleDocumentClick = (s3Key: string) => {
    const pdfUrl = `/api/files/${encodeURIComponent(s3Key)}`;
    window.open(pdfUrl, "_blank");
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-300 p-8">
      <div className="max-w-5xl mx-auto space-y-6 rounded-xl bg-white px-20 py-10">
        <h1 className="text-3xl font-bold text-black">Patients</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {patients.map((p) => (
            <div key={p.patient_id} className="relative">
              {/* PATIENT CARD */}
              <div
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-5 cursor-pointer border border-gray-200"
                onClick={() =>
                  setOpenPopup(openPopup === p.patient_id ? null : p.patient_id)
                }
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-black">
                    {p.full_name}
                  </h2>
                  <span className="text-gray-500 text-sm">
                    {openPopup === p.patient_id ? "▲" : "▼"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  {p.documents?.length || 0} document(s)
                </p>
              </div>

              {/* DOCUMENT POPUP */}
              {openPopup === p.patient_id && (
                <div className="absolute left-0 mt-3 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-30 max-h-72 overflow-y-auto">
                  {p.documents && p.documents.length > 0 ? (
                    p.documents.map((doc) => (
                      <div
                        key={doc.document_id}
                        onClick={() => handleDocumentClick(doc.s3_key)}
                        className="p-4 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-black">
                            {doc.document_subject}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(doc.date_of_report)}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          GP:{" "}
                          <span className="font-medium text-gray-800">
                            {doc.gp_name || "Not recorded"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500 text-sm">
                      No documents available
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
