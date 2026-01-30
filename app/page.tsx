"use client";
import { use, useState } from "react";
import PdfUploader from "@/components/PdfUploader";
import InfoFormColumn from "@/components/InfoFrom";
import Navbar from "@/components/Navbar/Navbar";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import Message from "@/components/ui/Message/Message";

export default function Home() {
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [data, setData] = useState<any>({});
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [s3Key, setS3Key] = useState<string | null>(null);
  const [file_name, setFileName] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const [isExtracted, setIsExtracted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isExtracting, setIsExtracting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Called after PDF upload completes
  const handleUploadComplete = async (
    uploadedFileUrl: string,
    uploadedS3Key: string,
    file_name: string,
  ) => {
    setFileUrl(uploadedFileUrl);
    setS3Key(uploadedS3Key);
    setFileName(file_name);
    setIsExtracting(true);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: uploadedFileUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");

      // Convert Gemini raw string to object
      const extracted: any = {};
      data.extractedText.split("\n").forEach((line: string) => {
        const [key, ...rest] = line.split(":");
        if (key && rest.length) extracted[key.trim()] = rest.join(":").trim();
      });

      setFormData(extracted);
      setIsExtracted(true);
      setMessage({ text: "Document Extracted Successfully", type: "success" });
    } catch (err) {
      console.error(err);

      setMessage({
        text:
          "Extraction failed: " + (err as Error).message ||
          "Something went wrong",
        type: "success",
      });
      //alert("Extraction failed: " + (err as Error).message);
    } finally {
      setIsExtracting(false);
    }
  };

  // Called when Save / Submit button is clicked
  const handleSaveDocument = async () => {
    if (!fileUrl && !isEditMode)
      return setMessage({ text: "Please Upload PDF", type: "error" });

    let formattedDate: string | null = null;
    if (formData.date_of_report) {
      const date = new Date(formData.date_of_report);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split("T")[0];
      } else {
        const parts = formData.date_of_report.split("/");
        if (parts.length === 3) {
          formattedDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
      }
    }

    const payload: any = {
      ...formData,
      date_of_report: formattedDate,
    };

    // Only include PDF info if it's a new upload
    if (!isEditMode) {
      payload.s3_key = s3Key;
      payload.s3_url = fileUrl;
      payload.file_name = file_name;
    }

    try {
      const apiUrl = isEditMode
        ? `/api/documents/${formData.id}`
        : "/api/save_data";

      const res = await fetch(apiUrl, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");

      setMessage({
        text: isEditMode
          ? "Document updated successfully!"
          : "Document saved successfully!",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text:
          "Operation Failed " + (err as Error).message ||
          "Something went wrong",
        type: "error",
      });
    }
  };

  return (
    <div className="bg-gray-300">
      {/* <ErrorMessage message={error} onClose={() => setError(null)} /> */}

      {message && (
        <Message
          text={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
      <main className="min-h-screen p-4 text-black bg-gray-300 flex flex-col md:flex-row gap-4">
        {/* Left column: PDF upload */}

        <PdfUploader
          setPdfBuffer={setPdfBuffer}
          setPdfUrl={setPdfUrl}
          isExtracting={isExtracting}
          onUploadComplete={handleUploadComplete}
          onDocumentSelected={(docData) => {
            setIsExtracted(true);
            setIsEditMode(true);
            setFormData(docData);
          }}
          onReset={() => {
            setFormData({
              patient_name: " ",
              prefix: "",
              gp_doctor: "",
              date_of_report: "",
              document_subject: "",
              source_contact: "",
              store_in: "",
              category: " ",
            });

            setIsEditMode(false);
            setPdfBuffer(null);
            setPdfUrl(null);
            setIsExtracted(false);
          }}
        />

        {/* Right column: Editable info form */}
        <InfoFormColumn
          isExtracted={isExtracted}
          isEditMode={isEditMode}
          data={formData}
          setData={setFormData}
          onSave={handleSaveDocument}
        />
      </main>
    </div>
  );
}
