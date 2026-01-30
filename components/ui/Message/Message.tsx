"use client";
import { useEffect } from "react";

interface MessageProps {
  type?: "success" | "error" | "info";
  text: string;
  duration?: number; // in ms
  onClose?: () => void;
}

export default function Message({
  type = "info",
  text,
  duration = 3000,
  onClose,
}: MessageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-blue-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";

  return (
    <div
      className={`fixed top-5 right-5 z-50 px-4 py-3 text-white rounded-lg shadow-lg ${bgColor} animate-fade-in`}
    >
      {text}
    </div>
  );
}
