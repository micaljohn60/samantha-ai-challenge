"use client";
import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import DocumentLibraryModal from "./DocumentModal/DocumentModal";

interface PdfUploadColumnProps {
  setPdfBuffer: Dispatch<SetStateAction<ArrayBuffer | null>>;
  setPdfUrl: Dispatch<SetStateAction<string | null>>;

  onUploadComplete: (fileUrl: string, s3key: string, file_name: string) => void;
  onDocumentSelected: (docData: any) => void;
  isExtracting: boolean;
  onReset?: () => void;
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSelectFromLibrary = async (doc: any) => {
    try {
      const fileUrl = `/api/files/${encodeURIComponent(doc.s3_key)}`;

      // Show PDF
      setPdfPreviewUrl(fileUrl);
      setPdfUrl(fileUrl);
      setPdfFile(null);

      // Fetch full document info
      const res = await fetch(`/api/documents/${doc.id}`);
      if (!res.ok) throw new Error("Failed to fetch document data");

      const documentData = await res.json();

      onDocumentSelected({
        ...documentData,
        pdf_s3_key: doc.s3_key,
        pdf_file_name: doc.file_name,
      });

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

  return (
    <div className="md:w-1/2 bg-white p-6 rounded-2xl shadow-lg space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">Upload PDF</h2>
        <button
          onClick={() => {
            setPdfFile(null);
            setPdfPreviewUrl(null);
            setPdfUrl(null);
            if (onReset) onReset(); // <-- reset parent form
          }}
          className="ml-2 px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Reset
        </button>
        <button
          onClick={handleUpload}
          disabled={!pdfFile || loading || isExtracting}
          className="ml-auto bg-gradient-to-r from-blue-600 to-cyan-400 text-white px-5 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Uploading..."
            : isExtracting
              ? "Extracting..."
              : "Upload & Extract"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
        }}
        className="hidden"
      />

      <div className="relative">
        {!pdfPreviewUrl ? (
          <div className="h-[30rem] border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl flex flex-col items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <Upload size={18} />
              <span>Select PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLibrary(true)}
              className="text-sm text-blue-700 underline hover:text-blue-900"
            >
              Choose from Document Library
            </button>

            {pdfFile && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded border border-dashed border-blue-300">
                {pdfFile.name}
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-[30rem] border rounded-2xl overflow-hidden shadow-inner">
            <embed
              src={pdfPreviewUrl}
              type="application/pdf"
              width="100%"
              height="100%"
            />

            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                Replace PDF
              </button>
              <button
                onClick={() => setShowLibrary(true)}
                className="px-3 py-1 bg-white border text-sm rounded hover:bg-gray-100"
              >
                Library
              </button>
            </div>
          </div>
        )}
      </div>

      {showLibrary && (
        <DocumentLibraryModal
          onClose={() => setShowLibrary(false)}
          onSelect={handleSelectFromLibrary}
        />
      )}
    </div>
  );
}
