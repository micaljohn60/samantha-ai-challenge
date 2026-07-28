"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { FileText, Sparkles, ShieldCheck, Files, FileUp, Download } from "lucide-react";
import PdfUploader from "@/components/PdfUploader";
import BatchUploader from "@/components/BatchUploader";
import InfoFormColumn from "@/components/InfoFrom";
import Message from "@/components/ui/Message/Message";
import type { BatchItem, BatchStatus } from "@/types/batch";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });

function formatDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const date = new Date(raw);
  if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
  const parts = raw.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return null;
}

function parseExtractedText(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  text.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) result[key.trim()] = rest.join(":").trim();
  });
  return result;
}

export default function UploadPage() {
  const [batchMode, setBatchMode] = useState(false);

  // single mode
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [s3Key, setS3Key] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // batch mode
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
  const [batchActiveId, setBatchActiveId] = useState<string | null>(null);

  // shared
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isExtracted, setIsExtracted] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // ---------- Single mode ----------

  const handleUploadComplete = async (
    uploadedFileUrl: string,
    uploadedS3Key: string,
    uploadedFileName: string,
  ) => {
    setFileUrl(uploadedFileUrl);
    setS3Key(uploadedS3Key);
    setFileName(uploadedFileName);
    setIsExtracting(true);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: uploadedFileUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");

      setFormData(parseExtractedText(data.extractedText));
      setIsExtracted(true);
      setMessage({ text: "Document Extracted Successfully", type: "success" });
    } catch (err) {
      console.error(err);
      setMessage({
        text: "Extraction failed: " + (err as Error).message,
        type: "error",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!fileUrl && !isEditMode) {
      return setMessage({ text: "Please upload a PDF", type: "error" });
    }

    const payload: Record<string, string | null> = {
      ...formData,
      date_of_report: formatDate(formData.date_of_report),
    };

    if (!isEditMode) {
      payload.s3_key = s3Key;
      payload.s3_url = fileUrl;
      payload.file_name = fileName;
    }

    try {
      const apiUrl = isEditMode ? `/api/documents/${formData.id}` : "/api/save_data";
      const res = await fetch(apiUrl, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");

      setMessage({
        text: isEditMode ? "Document updated successfully!" : "Document saved successfully!",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: "Operation Failed: " + (err as Error).message,
        type: "error",
      });
    }
  };

  // ---------- Batch mode ----------

  const updateBatchItem = useCallback((id: string, patch: Partial<BatchItem>) => {
    setBatchQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const processItem = useCallback(
    async (item: BatchItem) => {
      updateBatchItem(item.id, { status: "uploading" as BatchStatus });

      let uploadedFileUrl: string;
      let uploadedS3Key: string;

      try {
        const arrayBuffer = await item.file.arrayBuffer();
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "x-filename": item.file.name },
          body: arrayBuffer,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

        uploadedFileUrl = uploadData.fileUrl;
        uploadedS3Key = uploadData.s3key;
        updateBatchItem(item.id, {
          fileUrl: uploadedFileUrl,
          s3Key: uploadedS3Key,
          status: "extracting" as BatchStatus,
        });
      } catch (err) {
        const msg = (err as Error).message;
        updateBatchItem(item.id, { status: "error" as BatchStatus, error: msg });
        setMessage({ text: `"${item.file.name}" failed to upload: ${msg}`, type: "error" });
        return;
      }

      try {
        const extractRes = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: uploadedFileUrl }),
        });
        const extractData = await extractRes.json();
        if (!extractRes.ok) throw new Error(extractData.error || "Extraction failed");

        const extracted = parseExtractedText(extractData.extractedText);
        updateBatchItem(item.id, { formData: extracted, status: "ready" as BatchStatus });
      } catch (err) {
        const msg = (err as Error).message;
        updateBatchItem(item.id, { status: "error" as BatchStatus, error: msg });
        setMessage({ text: `"${item.file.name}" failed to extract: ${msg}`, type: "error" });
      }
    },
    [updateBatchItem],
  );

  const handleFilesAdded = useCallback(
    (files: File[]) => {
      const newItems: BatchItem[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        status: "pending" as BatchStatus,
      }));

      setBatchQueue((prev) => {
        setTimeout(() => newItems.forEach((item) => processItem(item)), 0);
        return [...prev, ...newItems];
      });
    },
    [processItem],
  );

  const handleRemoveBatchItem = useCallback((id: string) => {
    setBatchQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    if (!batchMode || isExtracted) return;
    const readyItem = batchQueue.find((it) => it.status === "ready");
    if (!readyItem) return;
    setBatchActiveId(readyItem.id);
    setFormData(readyItem.formData ?? {});
    setIsExtracted(true);
  }, [batchQueue, isExtracted, batchMode]);

  const handleBatchSave = async () => {
    const activeItem = batchQueue.find((it) => it.id === batchActiveId);
    if (!activeItem) return;

    updateBatchItem(activeItem.id, { status: "saving" as BatchStatus });

    const payload = {
      ...formData,
      date_of_report: formatDate(formData.date_of_report),
      s3_key: activeItem.s3Key,
      s3_url: activeItem.fileUrl,
      file_name: activeItem.file.name,
    };

    try {
      const res = await fetch("/api/save_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      updateBatchItem(activeItem.id, { status: "done" as BatchStatus });
      setMessage({ text: `"${activeItem.file.name}" saved!`, type: "success" });

      setFormData({});
      setIsExtracted(false);
      setBatchActiveId(null);
    } catch (err) {
      updateBatchItem(activeItem.id, { status: "ready" as BatchStatus });
      setMessage({ text: "Save failed: " + (err as Error).message, type: "error" });
    }
  };

  const switchToSingle = () => {
    setBatchMode(false);
    setBatchQueue([]);
    setBatchActiveId(null);
    setFormData({});
    setIsExtracted(false);
  };

  const switchToBatch = () => {
    setBatchMode(true);
    setFileUrl(null);
    setS3Key(null);
    setFileName(null);
    setFormData({});
    setIsExtracted(false);
    setIsEditMode(false);
  };

  const activeItem = batchQueue.find((it) => it.id === batchActiveId);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6">
      {message && (
        <Message
          text={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="relative overflow-hidden max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 p-7 mb-5 shadow-xl shadow-blue-900/10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-white/10">
              <Sparkles size={12} /> AI-assisted filing
            </span>
            <h1 className="text-3xl font-bold text-white mt-4">Document Intake</h1>
            <p className="text-sm text-blue-100/70 mt-1.5 max-w-xl">
              Upload clinical PDFs, extract key details, and review everything before it reaches the patient record.
            </p>
          </div>
          <div className="inline-flex self-start lg:self-auto bg-white/10 ring-1 ring-white/15 rounded-xl p-1 backdrop-blur-sm">
            <button
              onClick={switchToSingle}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !batchMode ? "bg-white text-blue-900 shadow-sm" : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <FileUp size={15} /> Single
            </button>
            <button
              onClick={switchToBatch}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                batchMode ? "bg-white text-blue-900 shadow-sm" : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <Files size={15} /> Batch
            </button>
          </div>
        </div>
      </div>

      {/* Sample files banner */}
      <div className="max-w-7xl mx-auto mb-5">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck size={19} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700">Try the extraction workflow</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Use a sample document to preview the complete upload and review experience.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {[1, 2, 3].map((n) => (
              <a
                key={n}
                href={`/samples/sample-document-${n}.pdf`}
                download={`sample-document-${n}.pdf`}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-medium rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 transition"
              >
                <Download size={12} />
                Sample {n}
              </a>
            ))}
          </div>
        </div>
      </div>

      {batchMode ? (
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          <BatchUploader
            items={batchQueue}
            activeId={batchActiveId}
            onFilesAdded={handleFilesAdded}
            onRemove={handleRemoveBatchItem}
          />

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 bg-white rounded-2xl shadow-lg overflow-hidden h-[36rem]">
              {activeItem?.s3Key ? (
                <PdfViewer
                  url={`/api/files/${encodeURIComponent(activeItem.s3Key)}`}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-300">
                  <FileText size={48} />
                  <p className="text-sm">PDF will appear here during review</p>
                </div>
              )}
            </div>

            <InfoFormColumn
              isExtracted={isExtracted}
              isEditMode={false}
              data={formData}
              setData={setFormData}
              onSave={handleBatchSave}
            />
          </div>
        </div>
      ) : (
        <main className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
          <PdfUploader
            setPdfBuffer={() => {}}
            setPdfUrl={setFileUrl}
            isExtracting={isExtracting}
            onUploadComplete={handleUploadComplete}
            onDocumentSelected={(docData) => {
              setFormData(docData);
              setIsExtracted(true);
              setIsEditMode(true);
            }}
            onReset={() => {
              setFormData({});
              setIsEditMode(false);
              setFileUrl(null);
              setFileName(null);
              setS3Key(null);
              setIsExtracted(false);
            }}
          />

          <InfoFormColumn
            isExtracted={isExtracted}
            isEditMode={isEditMode}
            data={formData}
            setData={setFormData}
            onSave={handleSaveDocument}
          />
        </main>
      )}
    </div>
  );
}
