// ADDED: Custom popup toast component - centered modal-style notification
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function PopupToastUI({ message, type = "success", duration = 3000, onClose }) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, duration - 400);

    const closeTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "from-emerald-500 to-teal-500"
      : type === "error"
        ? "from-red-500 to-rose-500"
        : type === "warning"
          ? "from-amber-500 to-orange-500"
          : "from-gray-500 to-gray-600";

  const icon =
    type === "success" ? (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ) : type === "error" ? (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ) : (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
      </svg>
    );

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${visible && !fading ? "opacity-100" : "opacity-0"}`}
      />
      {/* Toast card */}
      <div
        className={`relative pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl bg-gradient-to-r ${bgColor} text-white max-w-sm mx-4 transition-all duration-300 ${
          visible && !fading
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm font-medium leading-snug">{message}</p>
        <button
          onClick={() => {
            setFading(true);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ADDED: Imperative API — call popupToast({ text, type, duration }) from anywhere
export default function popupToast({ text, type = "success", duration = 3000 }) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  const cleanup = () => {
    root.unmount();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  root.render(
    <PopupToastUI message={text} type={type} duration={duration} onClose={cleanup} />
  );
}
