// ADDED: Welcome overlay component with typing animation
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function WelcomeOverlay({ userName, onComplete }) {
  const { t } = useTranslation();
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const indexRef = useRef(0);

  // ADDED: Check if user has logged in before for Welcome vs Welcome Back
  const hasLoggedBefore = localStorage.getItem("hasLoggedInBefore");
  const greeting = hasLoggedBefore
    ? `${t("welcomeBackGreeting")}, ${userName}!`
    : `${t("welcome")}, ${userName}!`;

  useEffect(() => {
    // Mark that user has logged in before
    localStorage.setItem("hasLoggedInBefore", "true");
  }, []);

  useEffect(() => {
    const fullText = greeting;
    indexRef.current = 0;
    setDisplayText("");

    const typeInterval = setInterval(() => {
      if (indexRef.current < fullText.length) {
        setDisplayText(fullText.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setIsComplete(true), 600);
      }
    }, 65);

    return () => clearInterval(typeInterval);
  }, [greeting]);

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => setIsFading(true), 400);
      setTimeout(() => onComplete(), 1200);
    }
  }, [isComplete, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950 transition-opacity duration-700 ${isFading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      {/* ADDED: Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative text-center px-8">
        {/* ADDED: MediNear Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <svg width="32" height="32" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 4V18M4 11H18"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* ADDED: Typing text */}
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight min-h-[3.5rem]">
          {displayText}
          <span
            className={`inline-block w-[3px] h-[1.1em] bg-indigo-400 ml-1 align-text-bottom ${isComplete ? "opacity-0" : "animate-pulse"}`}
          />
        </h1>

        {/* ADDED: Subtitle that fades in after typing */}
        <p
          className={`mt-4 text-gray-500 text-lg transition-all duration-500 ${isComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        >
          MediNear — Your health, our priority
        </p>
      </div>
    </div>
  );
}
