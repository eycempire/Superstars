// ============================================================
// SUPERSTARS — config.js v2.0 | EYC Empire
// Midnight Pro Theme
// GET-based API to bypass CORS (Google Apps Script limitation)
// ============================================================

const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbzsFKNE8X9cGPKFZjxj4xSdxasm0wyfYAObTNFlZM968WRPTyTayAqCSg0FYih7LFItYw/exec",

  DRIVE: {
    DICTATION_UPLOADS:    "https://drive.google.com/drive/folders/100SuODMhM1nEf3Dmm1dUec9VmeSj8ENm",
    ELMAGAZINE_UPLOADS:   "https://drive.google.com/drive/folders/18t8_bkWGM1nEf3Dmm1dUec9VmeSj8ENm",
    SINGSANGSUNG_UPLOADS: "https://drive.google.com/drive/folders/1dF6bPlQFww1DmfV-StKpYd4RJlXekRb1",
    DATA_ROOT:            "https://drive.google.com/drive/folders/1JO6ZRzlARNEt9tNQqKHyrTd-CBybSwwW"
  },

  SEASON: {
    ID:         "S01",
    NAME:       "Season 1",
    START_DATE: "2025-06-01",
    END_DATE:   "2025-06-30"
  },

  TOKENS_PER_TICKET:  3000,
  TRIAL_DAYS:         14,
  SUB_COST_TICKETS:   3,
  SSR_COST_TICKETS:   1,

  TOKENS: {
    Grammar:      40,  GrammarX:      60,
    Alike:        40,  AlikeX:        60,
    Label:        40,  LabelX:        60,
    GoldenEar:    50,  GoldenEarX:    70,
    Figurative:   50,  FigurativeX:   70,
    Seeds:        60,  SeedsX:        80,
    Vivid:        60,  VividX:        80,
    Dictation:    70,  DictationX:    90,
    ElMagazine:   70,  ElMagazineX:   90,
    SingSangSung: 60,  SingSangSungX: 100
  },

  FREE_ACTIVITIES:    ["Grammar","Alike","Label","GoldenEar","Figurative","SingSangSung"],
  PARTIAL_FREE:       ["Seeds","Vivid","Dictation","ElMagazine"],
  LOCKED_ACTIVITIES:  [
    "GrammarX","AlikeX","LabelX","GoldenEarX","FigurativeX",
    "SeedsX","VividX","DictationX","ElMagazineX","SingSangSungX"
  ],

  ACTIVITY_NAMES: {
    Grammar:"Grammar",         GrammarX:"Grammar X",
    Alike:"Alike",             AlikeX:"Alike X",
    Seeds:"Seeds",             SeedsX:"Seeds X",
    Vivid:"Vivid",             VividX:"Vivid X",
    Figurative:"Figurative",   FigurativeX:"Figurative X",
    SingSangSung:"Sing Sang Sung", SingSangSungX:"Sing Sang Sung X",
    ElMagazine:"El-Magazine",  ElMagazineX:"El-Magazine X",
    Label:"Label",             LabelX:"Label X",
    GoldenEar:"Golden Ear",    GoldenEarX:"Golden Ear X",
    Dictation:"Dictation",     DictationX:"Dictation X"
  },

  ACTIVITY_ICONS: {
    Grammar:"📝",   GrammarX:"📝",
    Alike:"👂",     AlikeX:"👂",
    Seeds:"🌱",     SeedsX:"🌱",
    Vivid:"🖼️",    VividX:"🖼️",
    Figurative:"💬",FigurativeX:"💬",
    SingSangSung:"🎵",SingSangSungX:"🎵",
    ElMagazine:"🎙️",ElMagazineX:"🎙️",
    Label:"🏷️",    LabelX:"🏷️",
    GoldenEar:"👂", GoldenEarX:"👂",
    Dictation:"✍️", DictationX:"✍️"
  },

  // ── Submit action names — fixed ──────────────────────────
  // كل activity عندها action محدد بدل الـ string manipulation
  SUBMIT_ACTIONS: {
    Grammar:      "submit_grammar",
    GrammarX:     "submit_grammarx",
    Alike:        "submit_alike",
    AlikeX:       "submit_alikex",
    Seeds:        "submit_seeds",
    SeedsX:       "submit_seedsx",
    Vivid:        "submit_vivid",
    VividX:       "submit_vividx",
    Figurative:   "submit_figurative",
    FigurativeX:  "submit_figurativex",
    Label:        "submit_label",
    LabelX:       "submit_labelx",
    GoldenEar:    "submit_goldenear",
    GoldenEarX:   "submit_goldenearx",
    Dictation:    "submit_dictation",
    DictationX:   "submit_dictationx",
    ElMagazine:   "submit_elmagazine",
    ElMagazineX:  "submit_elmagazinex",
    SingSangSung: "submit_singsangsung",
    SingSangSungX:"submit_singsangsungx"
  },

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

  ADMIN_KEY:  "EYC_ADMIN_2025",
  MILESTONES: [3000, 6000, 9000, 12000, 15000],

  SOCIAL_EXB: {
    TOKENS_PER_LIKE:  2,
    TOKENS_PER_SHARE: 5
  },

  // ── Async activities — نتيجتها مش فورية ─────────────────
  ASYNC_ACTIVITIES: [
    "Dictation","DictationX",
    "ElMagazine","ElMagazineX",
    "SingSangSung","SingSangSungX"
  ]
};

// ============================================================
// API — GET to avoid CORS preflight
// ============================================================
async function api(action, payload = {}) {
  try {
    const body = JSON.stringify({ action, ...payload });
    const url  = CONFIG.API_URL + "?data=" + encodeURIComponent(body);
    const res  = await fetch(url, { method: "GET", redirect: "follow" });
    const text = await res.text();
    const s = text.indexOf("{"), e = text.lastIndexOf("}");
    if (s === -1) throw new Error("Bad response: " + text.slice(0, 100));
    return JSON.parse(text.slice(s, e + 1));
  } catch (err) {
    console.error("API Error:", err);
    return { success: false, error: "Network error. Please try again." };
  }
}

// ============================================================
// AUTH
// ============================================================
const Auth = {
  save(s)    { localStorage.setItem("ss_student", JSON.stringify(s)); },
  get()      {
    try { return JSON.parse(localStorage.getItem("ss_student")); }
    catch { return null; }
  },
  clear()    { localStorage.removeItem("ss_student"); },
  require()  {
    const s = this.get();
    if (!s) { window.location.href = CONFIG.PAGES.LOGIN; return null; }
    return s;
  },
  isAdmin()  { return localStorage.getItem("ss_admin_key") === CONFIG.ADMIN_KEY; },
  saveAdmin(){ localStorage.setItem("ss_admin_key", CONFIG.ADMIN_KEY); },

  // تحديث بيانات الـ student في الـ localStorage
  update(updates) {
    const s = this.get();
    if (!s) return;
    this.save({ ...s, ...updates });
    return { ...s, ...updates };
  }
};

// ============================================================
// STREAK — نظام الـ daily streak
// ============================================================
const Streak = {
  KEY: "ss_streak",

  get() {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEY));
      if (!data) return { count: 0, lastDate: null };
      return data;
    } catch { return { count: 0, lastDate: null }; }
  },

  // بيتعمل كال لما الـ student يكمل task
  increment() {
    const today = new Date().toDateString();
    const data  = this.get();

    if (data.lastDate === today) {
      // نفس اليوم — مش بيزيد
      return data.count;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = data.lastDate === yesterday.toDateString();

    const newCount = isConsecutive ? data.count + 1 : 1;
    localStorage.setItem(this.KEY, JSON.stringify({ count: newCount, lastDate: today }));
    return newCount;
  },

  // بيتحقق لو انكسر الـ streak
  check() {
    const data = this.get();
    if (!data.lastDate) return 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // لو آخر يوم مش امبارح ولا النهارده — الـ streak انكسر
    if (data.lastDate !== yesterday.toDateString() &&
        data.lastDate !== new Date().toDateString()) {
      localStorage.setItem(this.KEY, JSON.stringify({ count: 0, lastDate: null }));
      return 0;
    }
    return data.count;
  }
};

// ============================================================
// UI
// ============================================================
const UI = {
  toast(message, type = "info", duration = 3500) {
    // شيل الـ toast القديم لو موجود
    document.getElementById("ss-toast-wrap")?.remove();

    const colors = { info: "info", success: "success", error: "error", warning: "warning" };
    const wrap = document.createElement("div");
    wrap.id = "ss-toast-wrap";
    wrap.className = "ss-toast-wrap";
    wrap.innerHTML = `<div class="ss-toast ${colors[type] || 'info'}">${message}</div>`;
    document.body.appendChild(wrap);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => wrap.classList.add("show"));
    });

    setTimeout(() => {
      wrap.classList.remove("show");
      setTimeout(() => wrap.remove(), 350);
    }, duration);
  },

  loader(show, message = "Loading...") {
    let el = document.getElementById("ss-loader");
    if (show) {
      if (!el) {
        el = document.createElement("div");
        el.id = "ss-loader";
        el.style.cssText = `
          position:fixed;inset:0;
          background:rgba(13,17,23,0.75);
          backdrop-filter:blur(6px);
          display:flex;align-items:center;justify-content:center;
          z-index:9998;flex-direction:column;gap:16px;
        `;
        el.innerHTML = `
          <div class="spinner"></div>
          <p style="color:var(--text-secondary);font-size:14px;font-weight:500;">${message}</p>
        `;
        document.body.appendChild(el);
      }
    } else {
      el?.remove();
    }
  },

  formatTokens(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  },

  timeUntil(d) {
    const diff = new Date(d) - new Date();
    if (diff <= 0) return "Now";
    const D = Math.floor(diff / 86400000);
    const H = Math.floor((diff % 86400000) / 3600000);
    const M = Math.floor((diff % 3600000) / 60000);
    return D > 0 ? `${D}d ${H}h` : H > 0 ? `${H}h ${M}m` : `${M}m`;
  }
};

// ============================================================
// ACTIVITY HELPER
// ============================================================
const ActivityHelper = {
  canAccess(name, student) {
    if (Auth.isAdmin()) return true;
    if (student.trial_active) return true;
    if (student.subscription_status === "subscribed") return true;
    return CONFIG.FREE_ACTIVITIES.includes(name);
  },

  isFirstTaskFree(name, num) {
    return CONFIG.PARTIAL_FREE.includes(name) && Number(num) === 1;
  },

  getMaxTokens(name) {
    return CONFIG.TOKENS[name] || 0;
  },

  getSubmitAction(name) {
    return CONFIG.SUBMIT_ACTIONS[name] || `submit_${name.toLowerCase()}`;
  },

  isAsync(name) {
    return CONFIG.ASYNC_ACTIVITIES.includes(name);
  }
};
