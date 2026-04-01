import { useTranslation } from "react-i18next"; // ADDED: i18n

export default function DoctorCard({ doctor, onBooking, currentUserId }) {
  const isCurrentUser = currentUserId && currentUserId === doctor.UserId;
  const { t } = useTranslation(); // ADDED: i18n

  return (
    // MODIFIED: Enhanced card design with hover animations and gradient accents
    <div className="group card bg-base-100 shadow-md border border-base-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* ADDED: Gradient accent bar at top */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="card-body p-5">
        {/* Header: Avatar + Info */}
        <div className="flex items-center gap-4">
          {/* MODIFIED: Enhanced avatar with gradient ring and online indicator */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-indigo-500 to-purple-500">
              <img
                src={
                  doctor.User?.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.User?.name)}&background=6366f1&color=fff&size=64`
                }
                alt={doctor.User?.name}
                className="w-full h-full rounded-full object-cover bg-base-100"
              />
            </div>
            {/* ADDED: Online/offline indicator dot */}
            {doctor.isAvailable && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-base-100 rounded-full animate-pulse" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base truncate">{doctor.User?.name}</h2>
            {/* MODIFIED: Specialization with pill style */}
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {doctor.specialization}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              {/* MODIFIED: Better rating display */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xs ${star <= Math.round(doctor.rating || 0) ? "text-amber-400" : "text-base-content/20"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs font-semibold text-base-content/70">
                {doctor.rating?.toFixed(1) || "0.0"}
              </span>
              <span className="text-base-content/30 text-xs">•</span>
              <span className="text-xs text-base-content/50">
                {doctor.experience} {t("yearsExp")}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {doctor.bio && (
          <p className="text-sm text-base-content/60 mt-3 line-clamp-2 leading-relaxed">
            {doctor.bio}
          </p>
        )}

        {/* MODIFIED: Enhanced footer with better layout */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-base-200">
          <div className="flex items-center gap-2">
            <span className="text-xs text-base-content/50 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {doctor.location}
            </span>
          </div>
          {/* MODIFIED: Enhanced button with gradient */}
          <button
            className={`btn btn-sm border-0 text-white shadow-md ${
              !doctor.isAvailable || isCurrentUser
                ? "btn-disabled opacity-50"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-indigo-500/25 hover:shadow-indigo-500/40"
            } transition-all duration-200`}
            onClick={() => onBooking(doctor)}
            disabled={!doctor.isAvailable || isCurrentUser}
            title={isCurrentUser ? "Anda tidak bisa booking untuk diri sendiri" : ""}
          >
            {isCurrentUser ? t("yourProfile") : t("bookNow")}
          </button>
        </div>
      </div>
    </div>
  );
}
