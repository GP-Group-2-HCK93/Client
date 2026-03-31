export default function DoctorCard({ doctor, onBooking, currentUserId }) {
  const isCurrentUser = currentUserId && currentUserId === doctor.UserId;
  
  return (
    <div className="card bg-base-100 shadow-md border border-base-200 hover:shadow-lg transition-shadow duration-300">
      <div className="card-body p-5">
        {/* Header: Avatar + Info */}
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-2">
              <img
                src={
                  doctor.User?.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.User?.name)}&background=0ea5e9&color=fff`
                }
                alt={doctor.User?.name}
              />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-base">{doctor.User?.name}</h2>
            <p className="text-sm text-base-content/60">{doctor.specialization}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-sm font-medium">{doctor.rating?.toFixed(1) || "0.0"}</span>
              <span className="text-xs text-base-content/50 ml-1">• {doctor.experience} tahun pengalaman</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {doctor.bio && (
          <p className="text-sm text-base-content/70 mt-3 line-clamp-2">{doctor.bio}</p>
        )}

        {/* Footer: Location + Status + Button */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-base-content/50">📍 {doctor.location}</span>
            <span className={`badge badge-sm ${doctor.isAvailable ? "badge-success" : "badge-error"}`}>
              {doctor.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onBooking(doctor)}
            disabled={!doctor.isAvailable || isCurrentUser}
            title={isCurrentUser ? "Anda tidak bisa booking untuk diri sendiri" : ""}
          >
            {isCurrentUser ? "Your Profile" : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}