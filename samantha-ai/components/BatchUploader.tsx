"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import type { BatchItem, BatchStatus } from "@/types/batch";

interface Props {
  items: BatchItem[];
  activeId: string | null;
  onFilesAdded: (files: File[]) => void;
  onRemove?: (id: string) => void;
}

export default function BatchUploader({
  items,
  activeId,
  onFilesAdded,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf",
    );
    if (files.length) onFilesAdded(files);
  };

  return (
    <div
      className={`rounded-3xl shadow-sm px-5 py-4 transition-colors ${isDragging ? "bg-blue-50 border-2 border-blue-400" : "bg-white border border-gray-100"}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) {
            onFilesAdded(Array.from(e.target.files));
            e.target.value = "";
          }
        }}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700 shrink-0">
          Queue
          {items.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              {items.filter((it) => it.status === "done").length}/{items.length} done
            </span>
          )}
        </span>

        {items.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-blue-300 text-blue-500 rounded-xl text-sm hover:bg-blue-50 transition"
          >
            <Upload size={15} />
            Select PDFs to begin
          </button>
        ) : (
          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1">
            {items.map((item) => (
              <div
                key={item.id}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${
                  item.id === activeId
                    ? "border-blue-400 bg-blue-50"
                    : item.status === "done"
                      ? "border-green-200 bg-green-50"
                      : item.status === "error"
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                }`}
              >
                <FileText
                  size={14}
                  className={
                    item.status === "done"
                      ? "text-green-500"
                      : item.status === "error"
                        ? "text-red-500"
                        : item.id === activeId
                          ? "text-blue-500"
                          : "text-gray-400"
                  }
                />
                <span className="max-w-[140px] truncate text-gray-700">
                  {item.file.name}
                </span>
                <StatusBadge status={item.status} />
                {item.status === "error" && onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="ml-1 text-red-400 hover:text-red-600 transition"
                    title="Remove"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 ml-auto flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white px-4 py-2 rounded-xl text-sm hover:opacity-90"
        >
          <Upload size={14} />
          {items.length > 0 ? "Add More" : "Select PDFs"}
        </button>
      </div>
    </div>
  );
}

const statusConfig: Record<
  BatchStatus,
  { label: string; className: string; spin?: boolean }
> = {
  pending: { label: "Pending", className: "bg-gray-100 text-gray-500" },
  uploading: { label: "Uploading", className: "bg-yellow-100 text-yellow-700", spin: true },
  extracting: { label: "Extracting", className: "bg-blue-100 text-blue-700", spin: true },
  ready: { label: "Ready", className: "bg-purple-100 text-purple-700" },
  saving: { label: "Saving", className: "bg-orange-100 text-orange-700", spin: true },
  done: { label: "Done", className: "bg-green-100 text-green-700" },
  error: { label: "Error", className: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }: { status: BatchStatus }) {
  const { label, className, spin } = statusConfig[status];
  return (
    <span
      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${className}`}
    >
      {spin && (
        <span className="inline-block w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
      )}
      {label}
    </span>
  );
}
