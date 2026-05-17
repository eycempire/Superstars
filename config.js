// ============================================================
// SUPERSTARS — config.js
// EYC Empire | Single source of truth for all pages
// Drop this file in root and import in every HTML page
// ============================================================

const CONFIG = {

  // ── Apps Script Web App URL ─────────────────────────────
  // Replace with your deployed Apps Script URL after deployment
  API_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",

  // ── Google Drive Folders ────────────────────────────────
  DRIVE: {
    DICTATION_UPLOADS:   "https://drive.google.com/drive/folders/100SuODMhM1nEf3Dmm1dUec9VmeSj8ENm",
    ELMAGAZINE_UPLOADS:  "https://drive.google.com/drive/folders/18t8_bkWGM1nEf3Dmm1dUec9VmeSj8ENm",
    SINGSANGSUNG_UPLOADS:"https://drive.google.com/drive/folders/SING_SANG_SUNG_FOLDER_ID",
    DATA_ROOT:           "https://drive.google.com/drive/folders/DATA_ROOT_FOLDER_ID"
  },

  // ── Season ──────────────────────────────────────────────
  SEASON: {
    ID:         "S01",
    NAME:       "Season 1",
    START_DATE: "2025-06-01",
    END_DATE:   "2025-06-30"
  },

  // ── Economy ─────────────────────────────────────────────
  TOKENS_PER_TICKET:     3000,
  TRIAL_DAYS:            14,
  SUB_COST_TICKETS:      3,
  SSR_COST_TICKETS:      1,

  // ── Token values per activity ───────────────────────────
  TOKENS: {
    Grammar:        40,   GrammarX:       60,
    Alike:          40,   AlikeX:         60,
    Label:          40,   LabelX:         60,
    GoldenEar:      50,   GoldenEarX:     70,
    Figurative:     50,   FigurativeX:    70,
    Seeds:          60,   SeedsX:         80,
    Vivid:          60,   VividX:         80,
    Dictation:      70,   DictationX:     90,
    ElMagazine:     70,   ElMagazineX:    90,
    SingSangSung:   60,   SingSangSungX: 100
  },

  // ── Free activities (always accessible) ─────────────────
  FREE_ACTIVITIES: [
    "Grammar", "Alike", "Label",
    "GoldenEar", "Figurative", "SingSangSung"
  ],

  // ── Activities with only Task 1 free ────────────────────
  PARTIAL_FREE: ["Seeds", "Vivid", "Dictation", "ElMagazine"],

  // ── Fully locked activities ──────────────────────────────
  LOCKED_ACTIVITIES: [
    "GrammarX", "AlikeX", "LabelX", "GoldenEarX",
    "FigurativeX", "SeedsX", "VividX", "DictationX",
    "ElMagazineX", "SingSangSungX"
  ],

  // ── Activity display names ───────────────────────────────
  ACTIVITY_NAMES: {
    Grammar:       "Grammar",
    GrammarX:      "Grammar X",
    Alike:         "Alike",
    AlikeX:        "Alike X",
    Seeds:         "Seeds",
    SeedsX:        "Seeds X",
    Vivid:         "Vivid",
    VividX:        "Vivid X",
    Figurative:    "Figurative",
    FigurativeX:   "Figurative X",
    SingSangSung:  "Sing Sang Sung",
    SingSangSungX: "Sing Sang Sung X",
    ElMagazine:    "El-Magazine",
    ElMagazineX:   "El-Magazine X",
    Label:         "Label",
    LabelX:        "Label X",
    GoldenEar:     "Golden Ear",
    GoldenEarX:    "Golden Ear X",
    Dictation:     "Dictation",
    DictationX:    "Dictation X"
  },

  // ── Activity icons (emoji fallback) ─────────────────────
  ACTIVITY_ICONS: {
    Grammar:       "📝", GrammarX:       "📝",
    Alike:         "👂", AlikeX:         "👂",
    Seeds:         "🌱", SeedsX:         "🌱",
    Vivid:         "🖼️",  VividX:         "🖼️",
    Figurative:    "💬", FigurativeX:    "💬",
    SingSangSung:  "🎵", SingSangSungX:  "🎵",
    ElMagazine:    "🎙️", ElMagazineX:    "🎙️",
    Label:         "🏷️", LabelX:         "🏷️",
    GoldenEar:     "👂", GoldenEarX:     "👂",
    Dictation:     "✍️", DictationX:     "✍️"
  },

  // ── Pages ────────────────────────────────────────────────
  PAGES: {
    LANDING:     "index.html",
    SIGNUP:      "signup.html",
    LOGIN:       "login.html",
    DASHBOARD:   "dashboard.html",
    ACTIVITY:    "activity.html",
    LEADERBOARD: "leaderboard.html",
    SHOP:        "shop.html",
    ADMIN:       "admin.html"
  },

  // ── Admin ────────────────────────────────────────────────
  ADMIN_KEY: "EYC_ADMIN_2025", // Change before launch

  // ── Milestones ───────────────────────────────────────────
  MILESTONES: [3000, 6000, 9000, 12000, 15000],

  // ── Social Media EXB rates (tokens) ─────────────────────
  SOCIAL_EXB: {
    TOKENS_PER_LIKE:  2,
    TOKENS_PER_SHARE: 5
  }
};

// ============================================================
// API HELPER — used by all pages
// ============================================================

async function api(action, payload = {}) {
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload })
    });
    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    return { success: false, error: "Network error. Please try again." };
  }
}

// ============================================================
// AUTH HELPERS — LocalStorage
// ============================================================

const Auth = {
  save(student) {
    localStorage.setItem("ss_student", JSON.stringify(student));
  },
  get() {
    try { return JSON.parse(localStorage.getItem("ss_student")); }
    catch { return null; }
  },
  clear() {
    localStorage.removeItem("ss_student");
  },
  require() {
    const student = this.get();
    if (!student) { window.location.href = CONFIG.PAGES.LOGIN; return null; }
    return student;
  },
  isAdmin() {
    return localStorage.getItem("ss_admin_key") === CONFIG.ADMIN_KEY;
  },
  saveAdmin() {
    localStorage.setItem("ss_admin_key", CONFIG.ADMIN_KEY);
  }
};

// ============================================================
// UI HELPERS
// ============================================================

const UI = {
  toast(message, type = "info", duration = 3500) {
    const existing = document.getElementById("ss-toast");
    if (existing) existing.remove();

    const colors = {
      info:    "#3B82F6",
      success: "#10B981",
      error:   "#EF4444",
      warning: "#F59E0B"
    };

    const toast = document.createElement("div");
    toast.id = "ss-toast";
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(80px);
      background: ${colors[type] || colors.info}; color: #fff;
      padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 500;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25); z-index: 9999;
      transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
      max-width: 90vw; text-align: center;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = "translateX(-50%) translateY(0)";
    });
    setTimeout(() => {
      toast.style.transform = "translateX(-50%) translateY(80px)";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  loader(show, message = "Loading...") {
    let el = document.getElementById("ss-loader");
    if (show) {
      if (!el) {
        el = document.createElement("div");
        el.id = "ss-loader";
        el.style.cssText = `
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; z-index: 9998; flex-direction: column; gap: 16px;
        `;
        el.innerHTML = `
          <div style="width:48px;height:48px;border:3px solid rgba(255,255,255,0.2);
            border-top-color:#FFD700;border-radius:50%;animation:ss-spin 0.8s linear infinite;"></div>
          <p style="color:#fff;font-size:14px;font-weight:500;">${message}</p>
          <style>@keyframes ss-spin{to{transform:rotate(360deg)}}</style>
        `;
        document.body.appendChild(el);
      }
    } else {
      if (el) el.remove();
    }
  },

  formatTokens(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  },

  timeUntil(dateStr) {
    const diff = new Date(dateStr) - new Date();
    if (diff <= 0) return "Now";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
};

// ============================================================
// ACTIVITY HELPER
// ============================================================

const ActivityHelper = {
  canAccess(activityName, student) {
    if (Auth.isAdmin()) return true;
    if (student.trial_active) return true;
    if (student.subscription_status === "subscribed") return true;
    if (CONFIG.FREE_ACTIVITIES.includes(activityName)) return true;
    return false;
  },

  isFirstTaskFree(activityName, taskNumber) {
    return CONFIG.PARTIAL_FREE.includes(activityName) && Number(taskNumber) === 1;
  },

  getMaxTokens(activityName) {
    return CONFIG.TOKENS[activityName] || 0;
  }
};
