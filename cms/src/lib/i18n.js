// ADDED: i18n configuration for EN/ID toggle
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Navbar
      home: "Home",
      doctors: "Doctors",
      myBookings: "My Bookings",
      chats: "Chats",
      adminDashboard: "Admin Dashboard",
      logout: "Logout",
      registerDoctor: "Register Doctor",
      editProfile: "Edit Profile",

      // Home
      findDoctor: "Find a Doctor",
      locationDetected: "Location detected",
      fetchingLocation: "Fetching location...",
      noDoctorsAvailable: "No doctors available at the moment.",
      aiRecommendation: "AI Doctor Recommendation",
      aiPlaceholder:
        "Example: I have a headache for 3 days, nausea, and trouble sleeping.",
      searchDoctor: "Find Matching Doctor",
      searching: "Searching...",
      summary: "Summary",
      confidence: "Confidence",
      recommendedDoctors: "Recommended Doctors",
      confirmBooking: "Confirm Booking",
      confirmBookingMsg: "Are you sure you want to book with",
      cancel: "Cancel",
      yesBook: "Yes, Book",
      bookingSuccess: "Booking sent successfully!",

      // Doctor Card
      yearsExp: "years experience",
      available: "Available",
      unavailable: "Unavailable",
      bookNow: "Book Now",
      yourProfile: "Your Profile",

      // Chat
      noMessages: "No messages yet. Start the conversation!",
      typeMessage: "Type a message...",
      send: "Send",
      chatClosed: "This chat is closed. You can only view chat history.",
      isTyping: "is typing...",
      noChats: "No chats yet",
      tapToOpen: "Tap card to open chat",
      historyOnly: "History only - chat is closed",

      // Booking
      bookingRequests: "Booking Requests",
      pendingBookings: "Pending Bookings",
      recentDecisions: "Recent Decisions",
      approve: "Approve",
      reject: "Reject",
      pending: "Pending",
      patient: "Patient",
      doctor: "Doctor",
      requestedAt: "Requested At",
      action: "Action",
      specialization: "Specialization",
      status: "Status",
      markAsDone: "Mark as Done",

      // Dashboard
      doctorDashboard: "Doctor Dashboard",
      welcomeBack: "Welcome back",
      patientsToday: "Patients Today",
      completed: "Completed",
      pendingLabs: "Pending Labs",
      rating: "Rating",
      chatSummary: "Chat Summary",
      todaysSchedule: "Today's Schedule",
      quickActions: "Quick Actions",
      refreshDashboard: "Refresh Dashboard",
      openPatientQueue: "Open Patient Queue",
      setAvailable: "Set Available",
      setUnavailable: "Set Unavailable",

      // Profile
      saveChanges: "Save Changes",

      // Admin
      manageDoctors: "Manage Doctors",
      manageUsers: "Manage Users",
      addDoctor: "+ Add Doctor",
      delete: "Delete",

      // Welcome
      welcome: "Welcome",
      welcomeBackGreeting: "Welcome Back",
    },
  },
  id: {
    translation: {
      // Navbar
      home: "Beranda",
      doctors: "Dokter",
      myBookings: "Booking Saya",
      chats: "Obrolan",
      adminDashboard: "Dashboard Admin",
      logout: "Keluar",
      registerDoctor: "Daftar Dokter",
      editProfile: "Edit Profil",

      // Home
      findDoctor: "Temukan Dokter",
      locationDetected: "Lokasi terdeteksi",
      fetchingLocation: "Mengambil lokasi...",
      noDoctorsAvailable: "Tidak ada dokter yang tersedia saat ini.",
      aiRecommendation: "AI Rekomendasi Dokter",
      aiPlaceholder:
        "Contoh: Saya sakit kepala 3 hari, mual, dan susah tidur.",
      searchDoctor: "Cari Dokter Cocok",
      searching: "Mencari...",
      summary: "Ringkasan",
      confidence: "Confidence",
      recommendedDoctors: "Dokter yang Direkomendasikan",
      confirmBooking: "Konfirmasi Booking",
      confirmBookingMsg: "Apakah kamu yakin ingin booking dengan",
      cancel: "Batal",
      yesBook: "Ya, Booking",
      bookingSuccess: "Booking berhasil dikirim!",

      // Doctor Card
      yearsExp: "tahun pengalaman",
      available: "Tersedia",
      unavailable: "Tidak Tersedia",
      bookNow: "Booking",
      yourProfile: "Profil Anda",

      // Chat
      noMessages: "Belum ada pesan. Mulai percakapan!",
      typeMessage: "Ketik pesan...",
      send: "Kirim",
      chatClosed: "Chat ini sudah ditutup. Anda hanya bisa melihat riwayat.",
      isTyping: "sedang mengetik...",
      noChats: "Belum ada obrolan",
      tapToOpen: "Ketuk untuk membuka obrolan",
      historyOnly: "Riwayat saja - obrolan ditutup",

      // Booking
      bookingRequests: "Permintaan Booking",
      pendingBookings: "Booking Menunggu",
      recentDecisions: "Keputusan Terbaru",
      approve: "Terima",
      reject: "Tolak",
      pending: "Menunggu",
      patient: "Pasien",
      doctor: "Dokter",
      requestedAt: "Diminta Pada",
      action: "Aksi",
      specialization: "Spesialisasi",
      status: "Status",
      markAsDone: "Tandai Selesai",

      // Dashboard
      doctorDashboard: "Dashboard Dokter",
      welcomeBack: "Selamat datang kembali",
      patientsToday: "Pasien Hari Ini",
      completed: "Selesai",
      pendingLabs: "Lab Menunggu",
      rating: "Rating",
      chatSummary: "Ringkasan Chat",
      todaysSchedule: "Jadwal Hari Ini",
      quickActions: "Aksi Cepat",
      refreshDashboard: "Refresh Dashboard",
      openPatientQueue: "Buka Antrian Pasien",
      setAvailable: "Set Tersedia",
      setUnavailable: "Set Tidak Tersedia",

      // Profile
      saveChanges: "Simpan Perubahan",

      // Admin
      manageDoctors: "Kelola Dokter",
      manageUsers: "Kelola Pengguna",
      addDoctor: "+ Tambah Dokter",
      delete: "Hapus",

      // Welcome
      welcome: "Selamat Datang",
      welcomeBackGreeting: "Selamat Datang Kembali",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
