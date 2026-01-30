interface ErrorMessageProps {
  message: string | null;
  onClose?: () => void;
}

export default function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm flex justify-between items-start gap-3">
      <span>{message}</span>

      {onClose && (
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 font-bold"
        >
          ✕
        </button>
      )}
    </div>
  );
}
