"use client";
import { useEffect, useState } from "react";

interface Document {
  document_id: number;
  document_subject: string;
  date_of_report: string;
  pdf_url: string;
  s3_key: string;
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

  return (
    <div className="min-h-screen bg-gray-300 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">Patients</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {patients.map((p) => (
            <div
              key={p.patient_id}
              className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 p-5 cursor-pointer border border-gray-200"
              onClick={() =>
                setOpenPopup(openPopup === p.patient_id ? null : p.patient_id)
              }
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg text-black">
                  {p.full_name}
                </h2>
                <span className="text-gray-500 text-sm">
                  {openPopup === p.patient_id ? "▲" : "▼"}
                </span>
              </div>

              {/* Popup */}
              {openPopup === p.patient_id && (
                <div className="absolute left-0 top-full mt-3 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto">
                  {p.documents?.length > 0 ? (
                    p.documents.map((doc) => (
                      <div
                        key={doc.document_id}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center border-b last:border-b-0"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent card toggle
                          handleDocumentClick(doc.s3_key);
                        }}
                      >
                        <span className="font-medium text-black">
                          {doc.document_subject}
                        </span>
                        <span className="text-sm text-gray-600">
                          {doc.date_of_report}
                        </span>
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
