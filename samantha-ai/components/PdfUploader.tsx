"use client";
import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import { Upload, RotateCcw, BookOpen } from "lucide-react";
import DocumentLibraryModal from "./DocumentModal/DocumentModal";

interface PdfUploadColumnProps {
  setPdfBuffer: Dispatch<SetStateAction<ArrayBuffer | null>>;
  setPdfUrl: Dispatch<SetStateAction<string | null>>;
  onUploadComplete: (fileUrl: string, s3key: string, file_name: string) => void;
  onDocumentSelected: (docData: Record<string, string>) => void;
  isExtracting: boolean;
  onReset?: () => void;
}

interface LibraryDocument {
  id: number;
  s3_key: string;
  file_name: string;
}

export default function PdfUploader({
  setPdfBuffer,
  setPdfUrl,
  onUploadComplete,
  onDocumentSelected,
  isExtracting,
  onReset,
}: PdfUploadColumnProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") setPdfFile(file);
  };

  const handleUpload = async () => {
    if (!pdfFile) return;
    setLoading(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      setPdfBuffer(arrayBuffer);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-filename": pdfFile.name },
        body: arrayBuffer,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onUploadComplete(data.fileUrl, data.s3key, pdfFile.name);
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromLibrary = async (doc: LibraryDocument) => {
    try {
      const fileUrl = `/api/files/${encodeURIComponent(doc.s3_key)}`;
      setPdfPreviewUrl(fileUrl);
      setPdfUrl(fileUrl);
      setPdfFile(null);

      const res = await fetch(`/api/documents/${doc.id}`);
      if (!res.ok) throw new Error("Failed to fetch document data");

      const documentData = (await res.json()) as Record<string, string>;
      onDocumentSelected({ ...documentData, pdf_s3_key: doc.s3_key, pdf_file_name: doc.file_name });
      setShowLibrary(false);
    } catch (err) {
      console.error(err);
      alert("Failed to load document info");
    }
  };

  useEffect(() => {
    if (!pdfFile) return;
    const url = URL.createObjectURL(pdfFile);
    setPdfPreviewUrl(url);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfFile, setPdfUrl]);

  const isProcessing = loading || isExtracting;

  return (
    <div className="md:w-1/2 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900 mr-auto">Upload PDF</h2>

        <button
          onClick={() => {
            setPdfFile(null);
            setPdfPreviewUrl(null);
            setPdfUrl(null);
            if (onReset) onReset();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        <button
          onClick={handleUpload}
          disabled={!pdfFile || isProcessing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-400 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
        >
          <Upload size={14} />
          {loading ? "Uploading…" : isExtracting ? "Extracting…" : "Upload & Extract"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => { if (e.target.files?.[0]) setPdfFile(e.target.files[0]); }}
        className="hidden"
      />

      {/* Drop zone / preview */}
      <div className="relative flex-1">
        {!pdfPreviewUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full h-[30rem] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 group ${
              isDragging
                ? "border-blue-500 bg-blue-100 scale-[1.01]"
                : "border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/70 hover:border-blue-300 hover:shadow-inner"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload size={26} className="text-blue-500" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700">
                {isDragging ? "Drop to upload" : "Click or drag & drop a PDF"}
              </p>
              <p className="text-sm text-gray-400 mt-1">or browse your document library</p>
            </div>
            {pdfFile && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-white border border-blue-200 text-blue-700 text-xs font-medium rounded-lg shadow-sm">
                {pdfFile.name}
              </span>
            )}
          </button>
        ) : (
          <div className="relative h-[30rem] border border-gray-200 rounded-2xl overflow-hidden shadow-inner">
            <embed src={pdfPreviewUrl} type="application/pdf" width="100%" height="100%" />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 shadow-sm transition"
              >
                Replace
              </button>
              <button
                onClick={() => setShowLibrary(true)}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 shadow-sm transition"
              >
                Library
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Library link when no file selected */}
      {!pdfPreviewUrl && (
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
        >
          <BookOpen size={15} />
          Choose from Document Library
        </button>
      )}

      {showLibrary && (
        <DocumentLibraryModal onClose={() => setShowLibrary(false)} onSelect={handleSelectFromLibrary} />
      )}
    </div>
  );
}
