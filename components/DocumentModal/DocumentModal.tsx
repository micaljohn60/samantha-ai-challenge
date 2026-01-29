"use client";
import { useEffect, useState } from "react";

interface Doc {
  id: number;
  file_name: string;
  s3_key: string;
  created_at: string;
}

export default function DocumentLibraryModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (doc: Doc) => void;
}) {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDocuments(data.documents);
      });
  }, []);

  const filteredDocs = documents.filter((d) =>
    d.file_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[95%] max-w-2xl rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Document Library</h2>

        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border p-2 rounded-lg mb-4"
        />

        <div className="max-h-80 overflow-y-auto space-y-2">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelect(doc)}
              className="p-3 border rounded-lg hover:bg-green-50 cursor-pointer flex justify-between"
            >
              <span>{doc.file_name}</span>
              <span className="text-xs text-gray-400">
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
