# Product Requirements Document (PRD): Aplikasi Kelulusan "Hype-Release"

## 1. Ringkasan Produk
Aplikasi *web-based* satu halaman (Single Page Application) yang memungkinkan siswa mengecek status kelulusan mereka secara mandiri dengan pengalaman visual yang interaktif (animasi kartu 3D dan confetti).

## 2. Tujuan & Objektif
*   Menyediakan platform pengumuman yang aman dan privat (individual lookup).
*   Membangun euforia kelulusan melalui elemen visual yang menarik.
*   Memastikan aksesibilitas 100% pada perangkat seluler (smartphone).

## 3. Profil Pengguna
*   **Siswa:** Mengakses aplikasi via HP untuk melihat hasil.
*   **Admin (Guru/Operator):** Mengunggah data siswa dan memantau akses.

## 4. Fitur Utama

### A. Fitur Frontend (User Interface)
| Fitur | Deskripsi |
| :--- | :--- |
| **Landing Page** | Tampilan bersih dengan identitas sekolah dan kolom input NISN/Nomor Peserta. |
| **3D Flip Card Transition** | Animasi kartu yang berputar 180 derajat saat tombol "Cek" diklik untuk memberikan efek kejutan. |
| **Confetti Blast** | Efek partikel confetti yang muncul secara otomatis hanya jika status dinyatakan "LULUS". |
| **Responsive Image Display** | Menampilkan foto profil siswa yang terkompresi secara dinamis di sisi belakang kartu. |
| **Direct Messaging (Optional)** | Tombol "Bagikan ke WhatsApp" untuk membagikan kabar bahagia (tanpa detail nilai sensitif). |

### B. Fitur Backend & Data
| Fitur | Deskripsi |
| :--- | :--- |
| **Individual Lookup API** | Pencarian database berdasarkan kunci unik (NISN). |
| **Rate Limiting** | Membatasi jumlah percobaan input per IP address untuk mencegah *brute-force* atau serangan bot. |
| **Logging** | Mencatat waktu (timestamp) kapan seorang siswa berhasil melihat pengumuman. |

## 5. Spesifikasi Teknis (Rekomendasi)
*   **Frontend:** HTML5, Tailwind CSS, GSAP (untuk animasi), Canvas-confetti.
*   **Backend:** n8n (sebagai orchestrator API).
*   **Database:** Supabase (PostgreSQL) untuk penyimpanan data siswa dan log.
*   **Hosting:** Vercel atau Netlify (untuk kecepatan loading global/CDN).

## 6. Alur Pengguna (User Journey)
1.  Siswa membuka URL aplikasi.
2.  Siswa memasukkan NISN pada sisi depan kartu.
3.  Siswa menekan tombol **"Buka Nasibku"** (atau teks serupa yang membangun *hype*).
4.  Sistem melakukan validasi (Loading state: kartu bergetar ringan).
5.  **Jika Berhasil:** Kartu berputar (3D Flip), foto muncul, teks "LULUS" muncul dengan efek confetti.
6.  **Jika Gagal/Data Tidak Ada:** Muncul notifikasi "Data tidak ditemukan, periksa kembali nomor Anda."

## 7. Kriteria Non-Fungsional (Critical Constraints)
*   **Kecepatan:** Waktu loading pertama kali harus < 2 detik di jaringan 4G.
*   **Optimasi Gambar:** Foto siswa harus dikonversi ke format `.webp` untuk menghemat kuota siswa.
*   **Keamanan:** Data kelulusan tidak boleh ada di *client-side source code* sebelum divalidasi oleh server.
