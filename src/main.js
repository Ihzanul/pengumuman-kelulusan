import { createClient } from '@supabase/supabase-js';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

// 1. Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// 2. DOM Elements
const form = document.getElementById('check-form');
const nisnInput = document.getElementById('nisn-input');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');
const cardInner = document.getElementById('card-inner');
const backBtn = document.getElementById('back-btn');
const whatsappBtn = document.getElementById('whatsapp-btn');

// Result Elements
const studentName = document.getElementById('student-name');
const studentNisn = document.getElementById('student-nisn');
const studentPhoto = document.getElementById('student-photo');
const statusBadge = document.getElementById('status-badge');
const resultBg = document.getElementById('result-bg');

// Countdown Elements
const countdownContainer = document.getElementById('countdown-container');
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');

// State
let isFlipped = false;

// 2.5 Countdown Timer Logic
// Set the target date here:
const targetDate = new Date('2026-05-04T19:30:00').getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance > 0) {
    // Timer is active
    countdownContainer.classList.remove('hidden');
    nisnInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Pengumuman Belum Dibuka</span>`;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');

    cdDays.innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    cdHours.innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    cdMins.innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    cdSecs.innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
  } else {
    // Timer finished
    countdownContainer.classList.add('hidden');
    nisnInput.disabled = false;
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Buka Nasibku</span>`;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

if (new Date().getTime() < targetDate) {
  setInterval(updateCountdown, 1000);
  updateCountdown();
}

// 3. Form Submit Handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nisn = nisnInput.value.trim();
  if (!nisn) return;

  // Reset error & set loading state
  showError('');
  setLoading(true);

  try {
    let resultData;

    // Jika Supabase belum dikonfigurasi (Mode Dummy untuk Testing UI)
    if (!supabase) {
      console.warn("Supabase credentials not found. Using dummy data for testing.");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // Simulate success for NISN '1234567890' and fail for others
      if (nisn === '1234567890') {
        resultData = {
          success: true,
          data: {
            name: "Budi Santoso",
            status: "LULUS",
            photo_url: "/dummy-student.png"
          }
        };
      } else {
        resultData = {
          success: false,
          message: "Data tidak ditemukan. (Hint: Gunakan NISN 1234567890 untuk test sukses)"
        };
      }
    } else {
      // Panggil RPC Function Supabase (Sesuai dengan Implementation Plan)
      const { data, error } = await supabase.rpc('cek_kelulusan', { input_nisn: nisn });
      
      if (error) throw error;
      resultData = data;
    }

    if (resultData && resultData.success) {
      showResult(resultData.data, nisn);
    } else {
      showError(resultData?.message || "Data tidak ditemukan.");
    }

  } catch (err) {
    console.error("Error fetching data:", err);
    showError("Terjadi kesalahan server. Silakan coba lagi.");
  } finally {
    setLoading(false);
  }
});

// 4. Show Result & Animations
function showResult(data, nisn) {
  // Populate Data
  studentName.textContent = data.name;
  studentNisn.textContent = `NISN: ${nisn}`;
  if (data.photo_url) {
    studentPhoto.src = data.photo_url;
  } else {
    studentPhoto.src = '/dummy-student.png';
  }

  // Set Status UI
  const isLulus = data.status.toUpperCase() === 'LULUS';
  
  if (isLulus) {
    statusBadge.textContent = 'LULUS';
    statusBadge.className = 'px-6 py-2 rounded-full text-xl font-bold tracking-widest mb-8 shadow-sm bg-green-100 text-green-700 border border-green-200';
    resultBg.className = 'absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500 bg-gradient-to-b from-green-400 to-transparent';
  } else {
    statusBadge.textContent = 'TIDAK LULUS';
    statusBadge.className = 'px-6 py-2 rounded-full text-xl font-bold tracking-widest mb-8 shadow-sm bg-red-100 text-red-700 border border-red-200';
    resultBg.className = 'absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500 bg-gradient-to-b from-red-400 to-transparent';
  }

  // Setup WhatsApp Message
  const waText = encodeURIComponent(`Halo, saya ${data.name} (NISN: ${nisn}). Status saya dinyatakan: ${data.status.toUpperCase()}. Terima kasih!`);
  whatsappBtn.onclick = () => window.open(`https://wa.me/?text=${waText}`, '_blank');

  // GSAP 3D Flip Animation
  gsap.to(cardInner, {
    rotationY: 180,
    duration: 1,
    ease: "power3.inOut",
    onComplete: () => {
      isFlipped = true;
      if (isLulus) {
        triggerConfetti();
      }
    }
  });
}

// 5. Back Button (Flip Back)
backBtn.addEventListener('click', () => {
  if (!isFlipped) return;
  
  gsap.to(cardInner, {
    rotationY: 0,
    duration: 0.8,
    ease: "power3.inOut",
    onComplete: () => {
      isFlipped = false;
      nisnInput.value = '';
      nisnInput.focus();
    }
  });
});

// 6. Confetti Effect
function triggerConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#4f46e5', '#0ea5e9', '#22c55e']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#4f46e5', '#0ea5e9', '#22c55e']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

// 7. Helpers
function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="loader"></span> Memproses...`;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Buka Nasibku</span>`;
    submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
  }
}

function showError(msg) {
  if (msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
    // small fade in
    gsap.to(errorMessage, { opacity: 1, duration: 0.3 });
  } else {
    gsap.to(errorMessage, { 
      opacity: 0, 
      duration: 0.2, 
      onComplete: () => errorMessage.classList.add('hidden') 
    });
  }
}
