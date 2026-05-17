// ============================================================
// SUPERSTARS — Apps Script Backend
// EYC Empire | Main Router + Core Functions
// ============================================================

const SS = SpreadsheetApp.getActiveSpreadsheet();
const SEASON_ID = "S01";

// ── Token values per activity ──────────────────────────────
const TOKENS = {
  Grammar:       40,  GrammarX:      60,
  Alike:         40,  AlikeX:        60,
  Label:         40,  LabelX:        60,
  GoldenEar:     50,  GoldenEarX:    70,
  Figurative:    50,  FigurativeX:   70,
  Seeds:         60,  SeedsX:        80,
  Vivid:         60,  VividX:        80,
  Dictation:     70,  DictationX:    90,
  ElMagazine:    70,  ElMagazineX:   90,
  SingSangSung:  60,  SingSangSungX: 100
};

const TOKENS_PER_TICKET   = 3000;
const TRIAL_DAYS          = 14;
const SUB_COST_TICKETS    = 3;
const SSR_COST_TICKETS    = 1;
const AI_WARNINGS_LIMIT   = 3;
const BONUS_COOLDOWN_SEC  = 30;
const DICTATION_EXB_THRESHOLD = 90; // %

// ============================================================
// MAIN ROUTER
// ============================================================

function doPost(e) {
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = data.action;

    const routes = {
      // Auth
      "register":            () => registerStudent(data),
      "login":               () => loginStudent(data),
      "recover_credentials": () => recoverCredentials(data),

      // Profile
      "get_profile":         () => getProfile(data),
      "update_photo":        () => updatePhoto(data),

      // Tasks
      "get_tasks":           () => getTasks(data),
      "get_task_data":       () => getTaskData(data),

      // Submissions — immediate scoring
      "submit_grammar":      () => submitGrammar(data),
      "submit_grammarx":     () => submitGrammarX(data),
      "submit_alike":        () => submitAlike(data),
      "submit_alikex":       () => submitAlikeX(data),
      "submit_label":        () => submitLabel(data),
      "submit_labelx":       () => submitLabelX(data),
      "submit_goldenear":    () => submitGoldenEar(data),
      "submit_goldenearx":   () => submitGoldenEarX(data),
      "submit_figurative":   () => submitFigurative(data),
      "submit_figurativex":  () => submitFigurativeX(data),
      "submit_seeds":        () => submitSeeds(data),
      "submit_seedsx":       () => submitSeedsX(data),
      "submit_vivid":        () => submitVivid(data),
      "submit_vividx":       () => submitVividX(data),

      // Submissions — async (admin review / OCR)
      "submit_singx":        () => submitSingSangSungX(data),
      "submit_sing":         () => submitSingSangSung(data),
      "submit_dictation":    () => submitDictation(data),
      "submit_dictationx":   () => submitDictationX(data),
      "submit_elmagazine":   () => submitElMagazine(data),
      "submit_elmagazinex":  () => submitElMagazineX(data),

      // Inbox
      "get_inbox":           () => getInbox(data),
      "mark_read":           () => markInboxRead(data),

      // Appeals
      "submit_appeal":       () => submitAppeal(data),

      // Shop
      "get_tickets":         () => getTickets(data),
      "spend_tickets":       () => spendTickets(data),

      // Leaderboard
      "get_leaderboard":     () => getLeaderboard(data),

      // Admin
      "admin_login":         () => adminLogin(data),
      "admin_get_appeals":   () => adminGetAppeals(data),
      "admin_resolve_appeal":() => adminResolveAppeal(data),
      "admin_approve_photo": () => adminApprovePhoto(data),
      "admin_reject_photo":  () => adminRejectPhoto(data),
      "admin_add_social_exb":() => adminAddSocialEXB(data),
      "admin_review_submission": () => adminReviewSubmission(data),
      "admin_suspend":       () => adminSuspend(data),
      "admin_unsuspend":     () => adminUnsuspend(data),
      "admin_get_students":  () => adminGetStudents(data),
      "admin_get_pending_photos": () => adminGetPendingPhotos(data),
      "admin_get_pending_submissions": () => adminGetPendingSubmissions(data),
    };

    if (!routes[action]) {
      return respond({ success: false, error: "Unknown action: " + action });
    }

    return routes[action]();

  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}

function doGet(e) {
  return respond({ success: true, message: "Superstars API is running." });
}

// ============================================================
// HELPERS
// ============================================================

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  return SS.getSheetByName(name);
}

function sheetData(name) {
  const sheet = getSheet(name);
  const rows  = sheet.getDataRange().getValues();
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function generateID(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generatePasskey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let key = "";
  for (let i = 0; i < 8; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

function now() {
  return new Date().toISOString();
}

function sendInbox(studentId, type, title, body, relatedId = "") {
  const sheet = getSheet("Inbox");
  sheet.appendRow([
    generateID("MSG"), now(), studentId,
    type, title, body, "unread", relatedId
  ]);
}

function logAdmin(adminId, actionType, targetStudentId, details, relatedId = "") {
  const sheet = getSheet("AdminLog");
  sheet.appendRow([
    generateID("LOG"), now(), adminId,
    actionType, targetStudentId, details, relatedId
  ]);
}

function addTokens(studentId, amount, seasonId) {
  const sheet   = getSheet("Students");
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const totalIdx  = headers.indexOf("Total_Tokens");
  const seasonIdx = headers.indexOf("Season_Tokens");
  const ticketIdx = headers.indexOf("Golden_Tickets");
  const idIdx     = headers.indexOf("Student_ID");

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === studentId) {
      const newTotal  = (data[i][totalIdx]  || 0) + amount;
      const newSeason = (data[i][seasonIdx] || 0) + amount;
      sheet.getRange(i + 1, totalIdx  + 1).setValue(newTotal);
      sheet.getRange(i + 1, seasonIdx + 1).setValue(newSeason);
      checkMilestone(studentId, newTotal, data[i][ticketIdx] || 0, sheet, i, ticketIdx);
      return { newTotal, newSeason };
    }
  }
}

function checkMilestone(studentId, totalTokens, currentTickets, sheet, rowIndex, ticketIdx) {
  const milestones = [3000, 6000, 9000, 12000, 15000];
  let newTickets   = currentTickets;
  let earned       = 0;

  milestones.forEach(m => {
    const key = "milestone_" + m + "_" + studentId;
    const cache = CacheService.getScriptCache();
    if (totalTokens >= m && !cache.get(key)) {
      cache.put(key, "1", 21600); // 6 hours cache (re-check on restart)
      newTickets++;
      earned++;
    }
  });

  if (earned > 0) {
    sheet.getRange(rowIndex + 1, ticketIdx + 1).setValue(newTickets);
    sendInbox(
      studentId, "milestone",
      "🎫 Golden Ticket Earned!",
      "Congratulations! You've earned " + earned + " Golden Ticket(s) by reaching a token milestone!",
      ""
    );
  }
}

function getStudentRow(studentId) {
  const sheet = getSheet("Students");
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf("Student_ID")] === studentId) {
      const obj = {};
      headers.forEach((h, idx) => obj[h] = data[i][idx]);
      obj._rowIndex = i + 1;
      return obj;
    }
  }
  return null;
}

function isTrialActive(student) {
  if (student.Trial_Active !== true && student.Trial_Active !== "TRUE") return false;
  const end = new Date(student.Trial_End);
  return new Date() <= end;
}

function canAccessActivity(student, activityName) {
  // Admin always can
  if (student.Student_ID && student.Student_ID.startsWith("ADMIN")) return true;
  // Trial active = full access
  if (isTrialActive(student)) return true;
  // Subscribed = full access
  if (student.Subscription_Status === "subscribed") return true;
  // Free activities always accessible
  const freeActivities = ["Grammar","Alike","Label","GoldenEar","Figurative","SingSangSung"];
  if (freeActivities.includes(activityName)) return true;
  return false;
}

function saveReport(studentId, studentName, activityName, taskNumber, studentAnswers, correctAnswers, scoreEarned, maxScore, errorExplanation, aiFlag) {
  const sheet = getSheet("Reports");
  const reportId = generateID("RPT");
  sheet.appendRow([
    reportId, now(), studentId, studentName,
    activityName, taskNumber, SEASON_ID,
    JSON.stringify(studentAnswers),
    JSON.stringify(correctAnswers),
    scoreEarned, maxScore,
    errorExplanation, aiFlag ? "TRUE" : "FALSE"
  ]);
  return reportId;
}

// AI Detection helpers
function detectAI(text, blacklist) {
  if (!blacklist) return false;
  const phrases = blacklist.split(",").map(p => p.trim().toLowerCase());
  const lower   = text.toLowerCase();
  let hits = 0;
  phrases.forEach(p => { if (p && lower.includes(p)) hits++; });
  return hits >= 3; // 3+ blacklist phrases = AI flagged
}

function checkTypingSpeed(charCount, durationMs) {
  // Average human: ~200 chars/min = ~3.3 chars/sec
  // Suspicious: > 15 chars/sec
  const charsPerSec = charCount / (durationMs / 1000);
  return charsPerSec > 15;
}

function handleAIDetection(studentId, activityName, taskNumber) {
  const sheet    = getSheet("Students");
  const student  = getStudentRow(studentId);
  if (!student) return;

  const warnings = (student.AI_Warnings || 0) + 1;
  sheet.getRange(student._rowIndex, Object.keys(student).indexOf("AI_Warnings") + 1)
       .setValue(warnings);

  // Find actual column index
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const warnIdx = headers.indexOf("AI_Warnings");
  const statIdx = headers.indexOf("Account_Status");
  sheet.getRange(student._rowIndex, warnIdx + 1).setValue(warnings);

  if (warnings >= AI_WARNINGS_LIMIT) {
    sheet.getRange(student._rowIndex, statIdx + 1).setValue("suspended");
    sendInbox(studentId, "warning",
      "🚫 Account Suspended",
      "Your account has been suspended due to repeated AI-generated content submissions.",
      activityName + "_" + taskNumber
    );
  } else {
    sendInbox(studentId, "warning",
      "⚠️ Warning " + warnings + "/" + AI_WARNINGS_LIMIT,
      "AI-generated content was detected in " + activityName + " Task " + taskNumber + ". Score: 0 tokens. " +
      (AI_WARNINGS_LIMIT - warnings) + " warning(s) remaining before suspension.",
      activityName + "_" + taskNumber
    );
  }
  return warnings;
}

// Spelling tolerance: allow up to N wrong letters
function fuzzyMatch(input, target, maxErrors) {
  input  = input.trim().toLowerCase();
  target = target.trim().toLowerCase();
  if (input === target) return true;
  if (Math.abs(input.length - target.length) > maxErrors) return false;
  let errors = 0;
  const len = Math.max(input.length, target.length);
  for (let i = 0; i < len; i++) {
    if (input[i] !== target[i]) errors++;
    if (errors > maxErrors) return false;
  }
  return true;
}

// Content quality score (lexical diversity + connectives)
function contentQualityScore(text) {
  const words      = text.toLowerCase().match(/\b\w+\b/g) || [];
  const unique     = new Set(words);
  const diversity  = words.length > 0 ? unique.size / words.length : 0;

  const connectives = ["however","therefore","suddenly","meanwhile","although",
    "because","furthermore","consequently","nevertheless","moreover",
    "additionally","afterward","initially","finally","eventually"];
  let connCount = 0;
  connectives.forEach(c => { if (text.toLowerCase().includes(c)) connCount++; });

  const sentences  = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const avgLen     = sentences.length > 0
    ? sentences.reduce((s, x) => s + x.split(" ").length, 0) / sentences.length : 0;
  const variety    = Math.min(avgLen / 15, 1);

  return Math.min(((diversity * 0.5) + (Math.min(connCount / 3, 1) * 0.3) + (variety * 0.2)), 1);
}

// ============================================================
// AUTH
// ============================================================

function registerStudent(data) {
  const { full_name, age, email, photo_url } = data;
  if (!full_name || !age || !email) {
    return respond({ success: false, error: "Missing required fields." });
  }

  // Check duplicate email
  const students = sheetData("Students");
  if (students.find(s => s.Email === email)) {
    return respond({ success: false, error: "Email already registered." });
  }

  const studentId = generateID("STU");
  const code      = generateCode();
  const passkey   = generatePasskey();
  const trialStart = now();
  const trialEnd   = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  getSheet("Students").appendRow([
    studentId, full_name, age, email,
    photo_url || "", "pending",
    code, passkey,
    0, 0, 0,
    "free", "none",
    trialStart, trialEnd, true,
    0, "active",
    now(), now(), SEASON_ID
  ]);

  sendInbox(studentId, "system",
    "🎉 Welcome to Superstars!",
    "Welcome " + full_name + "! Your Free Trial is active for 14 days. Enjoy all activities!",
    ""
  );

  return respond({
    success: true,
    student_id: studentId,
    code,
    passkey,
    trial_end: trialEnd,
    message: "Registration successful. Save your code and passkey!"
  });
}

function loginStudent(data) {
  const { code, passkey } = data;
  if (!code || !passkey) return respond({ success: false, error: "Missing credentials." });

  const students = sheetData("Students");
  const student  = students.find(s => s.Code == code && s.Passkey === passkey);
  if (!student) return respond({ success: false, error: "Invalid code or passkey." });
  if (student.Account_Status === "suspended") {
    return respond({ success: false, error: "Account suspended. Please contact support." });
  }

  // Update last login
  const sheet   = getSheet("Students");
  const data2   = sheet.getDataRange().getValues();
  const headers = data2[0];
  const loginIdx = headers.indexOf("Last_Login");
  for (let i = 1; i < data2.length; i++) {
    if (data2[i][headers.indexOf("Student_ID")] === student.Student_ID) {
      sheet.getRange(i + 1, loginIdx + 1).setValue(now());
      break;
    }
  }

  return respond({
    success: true,
    student: {
      student_id:          student.Student_ID,
      full_name:           student.Full_Name,
      age:                 student.Age,
      email:               student.Email,
      photo_url:           student.Photo_Status === "approved" ? student.Photo_URL : "",
      total_tokens:        student.Total_Tokens,
      season_tokens:       student.Season_Tokens,
      golden_tickets:      student.Golden_Tickets,
      subscription_status: student.Subscription_Status,
      ssr_status:          student.SSR_Status,
      trial_active:        isTrialActive(student),
      trial_end:           student.Trial_End,
      ai_warnings:         student.AI_Warnings,
      account_status:      student.Account_Status
    }
  });
}

function recoverCredentials(data) {
  const { email } = data;
  if (!email) return respond({ success: false, error: "Email required." });

  const students = sheetData("Students");
  const student  = students.find(s => s.Email === email);
  if (!student) return respond({ success: false, error: "Email not found." });

  // In production: send email via GmailApp
  // GmailApp.sendEmail(email, "Superstars — Your Login Credentials",
  //   "Your Code: " + student.Code + "\nYour Passkey: " + student.Passkey);

  return respond({
    success: true,
    message: "Credentials sent to " + email
    // Remove code/passkey from response in production — use email only
  });
}

// ============================================================
// PROFILE
// ============================================================

function getProfile(data) {
  const student = getStudentRow(data.student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  return respond({
    success: true,
    profile: {
      student_id:          student.Student_ID,
      full_name:           student.Full_Name,
      age:                 student.Age,
      email:               student.Email,
      photo_url:           student.Photo_Status === "approved" ? student.Photo_URL : "",
      photo_status:        student.Photo_Status,
      total_tokens:        student.Total_Tokens,
      season_tokens:       student.Season_Tokens,
      golden_tickets:      student.Golden_Tickets,
      subscription_status: student.Subscription_Status,
      ssr_status:          student.SSR_Status,
      trial_active:        isTrialActive(student),
      trial_end:           student.Trial_End,
      ai_warnings:         student.AI_Warnings
    }
  });
}

function updatePhoto(data) {
  const { student_id, photo_url } = data;
  const sheet   = getSheet("Students");
  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx   = headers.indexOf("Student_ID");
  const photoIdx = headers.indexOf("Photo_URL");
  const statusIdx = headers.indexOf("Photo_Status");

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idIdx] === student_id) {
      sheet.getRange(i + 1, photoIdx + 1).setValue(photo_url);
      sheet.getRange(i + 1, statusIdx + 1).setValue("pending");
      return respond({ success: true, message: "Photo submitted for approval." });
    }
  }
  return respond({ success: false, error: "Student not found." });
}

// ============================================================
// TASKS
// ============================================================

function getTasks(data) {
  const { student_id } = data;
  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const tasks    = sheetData("Tasks");
  const reports  = sheetData("Reports");
  const nowDate  = new Date();

  const result = tasks
    .filter(t => t.Season_ID === SEASON_ID)
    .map(t => {
      const unlockDate = new Date(t.Unlock_DateTime);
      const isUnlocked = nowDate >= unlockDate;
      const studentReports = reports.filter(r =>
        r.Student_ID === student_id &&
        r.Activity_Name === t.Activity_Name &&
        r.Task_Number == t.Task_Number &&
        r.Season_ID === SEASON_ID
      );
      const done      = studentReports.length > 0;
      const topScore  = done ? Math.max(...studentReports.map(r => Number(r.Score_Earned) || 0)) : 0;
      const canRetry  = topScore === 0;
      const hasAccess = canAccessActivity(student, t.Activity_Name);

      return {
        task_id:       t.Task_ID,
        activity_name: t.Activity_Name,
        task_number:   t.Task_Number,
        unlock_date:   t.Unlock_DateTime,
        is_unlocked:   isUnlocked,
        has_access:    hasAccess,
        done,
        top_score:     topScore,
        can_retry:     canRetry,
        max_tokens:    TOKENS[t.Activity_Name] || 0
      };
    });

  return respond({ success: true, tasks: result });
}

function getTaskData(data) {
  const { activity_name, task_number, student_id } = data;
  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });
  if (!canAccessActivity(student, activity_name)) {
    return respond({ success: false, error: "subscription_required" });
  }

  const rows = sheetData(activity_name.replace(" ", ""));
  const task = rows.find(r => r.Task_Number == task_number && r.Season_ID === SEASON_ID);
  if (!task) return respond({ success: false, error: "Task not found." });

  // Return task data (strip answer keys for security on client side)
  // Frontend gets questions/assets only — answers stay server-side
  return respond({ success: true, task });
}

// ============================================================
// SUBMISSIONS — GRAMMAR
// ============================================================

function submitGrammar(data) {
  const { student_id, task_number, answers } = data;
  // answers = [ans1, ans2, ... ans10]

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const taskData = sheetData("Grammar").find(r =>
    r.Task_Number == task_number && r.Season_ID === SEASON_ID
  );
  if (!taskData) return respond({ success: false, error: "Task not found." });

  const correctAnswers = [];
  for (let i = 1; i <= 10; i++) correctAnswers.push(taskData["Q" + i]);

  let correct = 0;
  const feedback = [];
  answers.forEach((ans, idx) => {
    const isCorrect = ans.trim().toLowerCase() === String(correctAnswers[idx]).trim().toLowerCase();
    if (isCorrect) correct++;
    feedback.push({ question: idx + 1, correct: isCorrect, correct_answer: correctAnswers[idx] });
  });

  const tokensEarned = Math.round((correct / 10) * TOKENS.Grammar);
  addTokens(student_id, tokensEarned, SEASON_ID);

  const reportId = saveReport(
    student_id, student.Full_Name, "Grammar", task_number,
    answers, correctAnswers, tokensEarned, TOKENS.Grammar,
    JSON.stringify(feedback), false
  );

  sendInbox(student_id, "score",
    "✅ Grammar Task " + task_number + " Completed",
    "You scored " + tokensEarned + " / " + TOKENS.Grammar + " tokens. (" + correct + "/10 correct)",
    reportId
  );

  if (isTrialActive(student)) {
    sendInbox(student_id, "system",
      "ℹ️ Free Trial Note",
      "Your tokens have been added. Note: You are in Free Trial mode (ends " + student.Trial_End.split("T")[0] + ").",
      ""
    );
  }

  return respond({
    success: true,
    tokens_earned: tokensEarned,
    correct,
    total: 10,
    feedback,
    report_id: reportId
  });
}

// ============================================================
// SUBMISSIONS — GRAMMAR X
// ============================================================

function submitGrammarX(data) {
  const { student_id, task_number, answers } = data;
  // answers = [ans1..ans5]

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const taskData = sheetData("GrammarX").find(r =>
    r.Task_Number == task_number && r.Season_ID === SEASON_ID
  );
  if (!taskData) return respond({ success: false, error: "Task not found." });

  const validAnswers = [];
  for (let i = 1; i <= 10; i++) {
    if (taskData["Valid_Answer_" + i]) validAnswers.push(taskData["Valid_Answer_" + i].trim().toLowerCase());
  }

  let allCorrect = true;
  const feedback = [];
  answers.forEach((ans, idx) => {
    const clean   = ans.trim().toLowerCase();
    const matched = validAnswers.includes(clean);
    if (!matched) allCorrect = false;
    feedback.push({ input: idx + 1, value: ans, accepted: matched });
  });

  const tokensEarned = allCorrect ? TOKENS.GrammarX : 0;
  if (tokensEarned > 0) addTokens(student_id, tokensEarned, SEASON_ID);

  const reportId = saveReport(
    student_id, student.Full_Name, "GrammarX", task_number,
    answers, validAnswers, tokensEarned, TOKENS.GrammarX,
    allCorrect ? "All correct!" : "One or more answers were incorrect or not found in the text.",
    false
  );

  sendInbox(student_id, "score",
    allCorrect ? "✅ Grammar X Task " + task_number + " — Full Score!" : "❌ Grammar X Task " + task_number + " — 0 Tokens",
    "You earned " + tokensEarned + " / " + TOKENS.GrammarX + " tokens.",
    reportId
  );

  return respond({ success: true, tokens_earned: tokensEarned, all_correct: allCorrect, feedback, report_id: reportId });
}

// ============================================================
// SUBMISSIONS — ALIKE
// ============================================================

function submitAlike(data) {
  const { student_id, task_number, answers } = data;
  // answers = [{word_index: 1, value: "night"}, ...]  20 items

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const taskData = sheetData("Alike").find(r =>
    r.Task_Number == task_number && r.Season_ID === SEASON_ID
  );
  if (!taskData) return respond({ success: false, error: "Task not found." });

  let correct = 0;
  const feedback = [];
  for (let i = 1; i <= 10; i++) {
    const correctAns = String(taskData["EN_Answer_" + i] || "").trim().toLowerCase();
    const studentAns = (answers[i - 1] || "").trim().toLowerCase();
    const isCorrect  = studentAns === correctAns;
    if (isCorrect) correct++;
    feedback.push({ pair: i, student: studentAns, correct: correctAns, is_correct: isCorrect });
  }

  const tokensEarned = Math.round((correct / 10) * TOKENS.Alike);
  addTokens(student_id, tokensEarned, SEASON_ID);

  const reportId = saveReport(
    student_id, student.Full_Name, "Alike", task_number,
    answers, feedback, tokensEarned, TOKENS.Alike, "", false
  );

  sendInbox(student_id, "score",
    "✅ Alike Task " + task_number + " Completed",
    "You scored " + tokensEarned + " / " + TOKENS.Alike + " tokens. (" + correct + "/10 correct)",
    reportId
  );

  return respond({ success: true, tokens_earned: tokensEarned, correct, total: 10, feedback, report_id: reportId });
}

// ============================================================
// SUBMISSIONS — SEEDS
// ============================================================

function submitSeeds(data) {
  const { student_id, task_number, story, typing_duration_ms } = data;

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const taskData = sheetData("Seeds").find(r =>
    r.Task_Number == task_number && r.Season_ID === SEASON_ID
  );
  if (!taskData) return respond({ success: false, error: "Task not found." });

  const requiredWords = [
    taskData.Word_1, taskData.Word_2, taskData.Word_3,
    taskData.Word_4, taskData.Word_5, taskData.Word_6
  ].filter(Boolean);

  const keywordBank = (taskData.Keyword_Bank || "").split(",").map(k => k.trim().toLowerCase());
  const blacklist   = taskData.AI_Blacklist || "";
  const wordCount   = (story.match(/\b\w+\b/g) || []).length;

  // Word count gate
  if (wordCount < Number(taskData.Min_Words) || wordCount > Number(taskData.Max_Words)) {
    return respond({ success: false, error: "Word count out of range (" + wordCount + " words)." });
  }

  // AI detection
  const aiFlag     = detectAI(story, blacklist) || checkTypingSpeed(story.length, typing_duration_ms || 999999);
  if (aiFlag) {
    handleAIDetection(student_id, "Seeds", task_number);
    return respond({ success: true, tokens_earned: 0, ai_detected: true });
  }

  // Content check
  const quality = contentQualityScore(story);
  if (quality < 0.15) {
    return respond({ success: false, error: "Content quality too low. Please write a proper story." });
  }

  // Part A: Required keywords
  const storyLower = story.toLowerCase();
  let foundWords = 0;
  const wordFeedback = [];
  requiredWords.forEach(w => {
    const found = storyLower.includes(w.toLowerCase());
    if (found) foundWords++;
    wordFeedback.push({ word: w, found });
  });

  const partATokens = Math.round((foundWords / requiredWords.length) * (TOKENS.Seeds * 0.6));

  // Part B: Content quality
  const partBTokens = Math.round(quality * (TOKENS.Seeds * 0.4));

  const tokensEarned = partATokens + partBTokens;
  addTokens(student_id, tokensEarned, SEASON_ID);

  const reportId = saveReport(
    student_id, student.Full_Name, "Seeds", task_number,
    { story, word_count: wordCount }, { required_words: requiredWords, keyword_bank: keywordBank },
    tokensEarned, TOKENS.Seeds,
    "Keywords found: " + foundWords + "/" + requiredWords.length + ". Content quality: " + Math.round(quality * 100) + "%",
    false
  );

  sendInbox(student_id, "score",
    "✅ Seeds Task " + task_number + " Completed",
    "You earned " + tokensEarned + " / " + TOKENS.Seeds + " tokens. Keywords: " + foundWords + "/" + requiredWords.length,
    reportId
  );

  return respond({
    success: true,
    tokens_earned: tokensEarned,
    part_a: partATokens,
    part_b: partBTokens,
    keywords_found: foundWords,
    keywords_total: requiredWords.length,
    word_feedback: wordFeedback,
    quality_score: Math.round(quality * 100),
    report_id: reportId
  });
}

// ============================================================
// SUBMISSIONS — VIVID
// ============================================================

function submitVivid(data) {
  const { student_id, task_number, description, typing_duration_ms } = data;

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const taskData = sheetData("Vivid").find(r =>
    r.Task_Number == task_number && r.Season_ID === SEASON_ID
  );
  if (!taskData) return respond({ success: false, error: "Task not found." });

  const wordCount = (description.match(/\b\w+\b/g) || []).length;
  if (wordCount < Number(taskData.Min_Words) || wordCount > Number(taskData.Max_Words)) {
    return respond({ success: false, error: "Word count out of range (" + wordCount + " words)." });
  }

  const aiFlag = detectAI(description, taskData.AI_Blacklist) ||
                 checkTypingSpeed(description.length, typing_duration_ms || 999999);
  if (aiFlag) {
    handleAIDetection(student_id, "Vivid", task_number);
    return respond({ success: true, tokens_earned: 0, ai_detected: true });
  }

  const keywords    = (taskData.Keyword_Bank || "").split(",").map(k => k.trim().toLowerCase());
  const totalKw     = Number(taskData.Total_Keywords) || keywords.length;
  const descLower   = description.toLowerCase();

  let matched = 0;
  keywords.forEach(kw => {
    if (kw && descLower.includes(kw)) matched++;
  });

  const matchPct     = totalKw > 0 ? matched / totalKw : 0;
  const tokensEarned = Math.round(matchPct * TOKENS.Vivid);
  addTokens(student_id, tokensEarned, SEASON_ID);

  const reportId = saveReport(
    student_id, student.Full_Name, "Vivid", task_number,
    { description, word_count: wordCount }, keywords,
    tokensEarned, TOKENS.Vivid,
    "Keywords matched: " + matched + "/" + totalKw + " (" + Math.round(matchPct * 100) + "%)",
    false
  );

  sendInbox(student_id, "score",
    "✅ Vivid Task " + task_number + " Completed",
    "You earned " + tokensEarned + " / " + TOKENS.Vivid + " tokens. Match: " + Math.round(matchPct * 100) + "%",
    reportId
  );

  return respond({
    success: true,
    tokens_earned: tokensEarned,
    keywords_matched: matched,
    keywords_total: totalKw,
    match_pct: Math.round(matchPct * 100),
    report_id: reportId
  });
}

// ============================================================
// SUBMISSIONS — LABEL
// ============================================================

function submitLabel(data) {
  const { student_id, task_number, answers } = data;
  // answers = ["elevator", "cat", ...] 10 items

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const taskData = sheetData("Label").find(r =>
    r.Task_Number == task_number && r.Season_ID === SEASON_ID
  );
  if (!taskData) return respond({ success: false, error: "Task not found." });

  let correct = 0;
  const feedback = [];

  for (let i = 1; i <= 10; i++) {
    const validAnswers = String(taskData["Image_" + i + "_Answers"] || "")
      .split(",").map(a => a.trim().toLowerCase());

    // Student may write multiple words separated by comma
    const studentInputs = String(answers[i - 1] || "")
      .split(",").map(a => a.trim().toLowerCase());

    const isCorrect = studentInputs.some(inp => validAnswers.includes(inp));
    if (isCorrect) correct++;
    feedback.push({ image: i, student: answers[i - 1], valid: validAnswers, correct: isCorrect });
  }

  const tokensEarned = Math.round((correct / 10) * TOKENS.Label);
  addTokens(student_id, tokensEarned, SEASON_ID);

  const reportId = saveReport(
    student_id, student.Full_Name, "Label", task_number,
    answers, feedback, tokensEarned, TOKENS.Label,
    correct + "/10 correct", false
  );

  sendInbox(student_id, "score",
    "✅ Label Task " + task_number + " Completed",
    "You scored " + tokensEarned + " / " + TOKENS.Label + " tokens. (" + correct + "/10 correct)",
    reportId
  );

  return respond({ success: true, tokens_earned: tokensEarned, correct, total: 10, feedback, report_id: reportId });
}

// ============================================================
// SUBMISSIONS — LABEL X
// ============================================================

function submitLabelX(data) {
  const { student_id, task_number, answers } = data;
  // answers = [{selected_word: "runned", correction: "ran"}, ...] 10 items

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const taskData = sheetData("LabelX").find(r =>
    r.Task_Number == task_number && r.Season_ID === SEASON_ID
  );
  if (!taskData) return respond({ success: false, error: "Task not found." });

  const tokensPerQ  = TOKENS.LabelX / 10;
  let totalTokens   = 0;
  const feedback    = [];

  for (let i = 1; i <= 10; i++) {
    const correctWord  = String(taskData["Wrong_Word_" + i] || "").trim().toLowerCase();
    const correction   = String(taskData["Correction_" + i] || "").trim().toLowerCase();
    const ans          = answers[i - 1] || {};
    const selectedWord = String(ans.selected_word || "").trim().toLowerCase();
    const studentFix   = String(ans.correction || "").trim().toLowerCase();
    const timedOut     = ans.timed_out === true;

    let partA = 0;
    let partB = 0;

    if (!timedOut) {
      if (selectedWord === correctWord) partA = tokensPerQ * 0.5;
      if (studentFix === correction)    partB = tokensPerQ * 0.5;
    }

    totalTokens += partA + partB;
    feedback.push({
      question: i,
      timed_out: timedOut,
      part_a_correct: selectedWord === correctWord,
      part_b_correct: studentFix === correction,
      tokens: partA + partB,
      correct_word: correctWord,
      correct_fix:  correction
    });
  }

  totalTokens = Math.round(totalTokens);
  addTokens(student_id, totalTokens, SEASON_ID);

  const reportId = saveReport(
    student_id, student.Full_Name, "LabelX", task_number,
    answers, feedback, totalTokens, TOKENS.LabelX, "", false
  );

  sendInbox(student_id, "score",
    "✅ Label X Task " + task_number + " Completed",
    "You earned " + totalTokens + " / " + TOKENS.LabelX + " tokens.",
    reportId
  );

  return respond({ success: true, tokens_earned: totalTokens, feedback, report_id: reportId });
}

// ============================================================
// SUBMISSIONS — GOLDEN EAR
// ============================================================

function submitGoldenEar(data) {
  const { student_id, task_number, answers } = data;

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const taskData = sheetData("GoldenEar").find(r =>
    r.Task_Number == task_number && r.Season_ID === SEASON_ID
  );
  if (!taskData) return respond({ success: false, error: "Task not found." });

  let correct = 0;
  const feedback = [];
  for (let i = 1; i <= 10; i++) {
    const correctAns = String(taskData["Q" + i] || "").trim().toLowerCase();
    const studentAns = String(answers[i - 1] || "").trim().toLowerCase();
    const isCorrect  = studentAns === correctAns;
    if (isCorrect) correct++;
    feedback.push({ question: i, correct: isCorrect, correct_answer: taskData["Q" + i] });
  }

  const tokensEarned = Math.round((correct / 10) * TOKENS.GoldenEar);
  addTokens(student_id, tokensEarned, SEASON_ID);

  const reportId = saveReport(
    student_id, student.Full_Name, "GoldenEar", task_number,
    answers, feedback, tokensEarned, TOKENS.GoldenEar,
    correct + "/10 correct", false
  );

  sendInbox(student_id, "score",
    "✅ Golden Ear Task " + task_number + " Completed",
    "You scored " + tokensEarned + " / " + TOKENS.GoldenEar + " tokens. (" + correct + "/10 correct)",
    reportId
  );

  return respond({ success: true, tokens_earned: tokensEarned, correct, total: 10, feedback, report_id: reportId });
}

// ============================================================
// SUBMISSIONS — FIGURATIVE
// ============================================================

function submitFigurative(data) {
  const { student_id, task_number, answers } = data;
  // answers = [{dialogue_index: 1, sentence: "It was very easy"}...] 10 items

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const taskData = sheetData("Figurative").find(r =>
    r.Task_Number == task_number && r.Season_ID === SEASON_ID
  );
  if (!taskData) return respond({ success: false, error: "Task not found." });

  let correct = 0;
  const feedback = [];
  const tokensPerQ = TOKENS.Figurative / 10;

  for (let i = 1; i <= 10; i++) {
    const keywords   = String(taskData["Keywords_" + i] || "").split(",").map(k => k.trim().toLowerCase());
    const expression = taskData["Expression_" + i] || "";
    const sentence   = String((answers[i - 1] || {}).sentence || "").toLowerCase();
    const matched    = keywords.some(kw => kw && sentence.includes(kw));
    if (matched) correct++;
    feedback.push({
      dialogue: i,
      expression,
      accepted: matched,
      tokens: matched ? tokensPerQ : 0
    });
  }

  const tokensEarned = Math.round(correct * tokensPerQ);
  addTokens(student_id, tokensEarned, SEASON_ID);

  const reportId = saveReport(
    student_id, student.Full_Name, "Figurative", task_number,
    answers, feedback, tokensEarned, TOKENS.Figurative,
    correct + "/10 accepted", false
  );

  sendInbox(student_id, "score",
    "✅ Figurative Task " + task_number + " Completed",
    "You scored " + tokensEarned + " / " + TOKENS.Figurative + " tokens. (" + correct + "/10 accepted)",
    reportId
  );

  return respond({ success: true, tokens_earned: tokensEarned, correct, total: 10, feedback, report_id: reportId });
}

// ============================================================
// SUBMISSIONS — ASYNC (Dictation, El-Magazine, Sing Sang Sung)
// ============================================================

function submitDictation(data) {
  const { student_id, task_number, photo_drive_url } = data;
  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  // Store submission in ElMagazine sheet (reuse pattern) — admin/OCR will process
  getSheet("Dictation").appendRow([
    generateID("DICT"), SEASON_ID, task_number,
    "", "",  // Audio_Path, Original_Text filled from task
    "70",    // Acceptance_Threshold_Pct
    student_id, photo_drive_url, "pending"
  ]);

  sendInbox(student_id, "system",
    "📸 Dictation Task " + task_number + " Submitted",
    "Your submission is being processed. You will receive your score in your inbox shortly.",
    ""
  );

  return respond({ success: true, message: "Submission received. Score will be sent to your inbox." });
}

function submitElMagazine(data) {
  const { student_id, task_number, audio_drive_url } = data;
  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  getSheet("ElMagazine").appendRow([
    generateID("ELM"), SEASON_ID, task_number,
    "", TOKENS.ElMagazine,
    student_id, audio_drive_url,
    "pending", 0, 0, "", now()
  ]);

  sendInbox(student_id, "system",
    "🎙️ El-Magazine Task " + task_number + " Submitted",
    "Your recording has been submitted and is pending admin review. Your score will be sent to your inbox.",
    ""
  );

  return respond({ success: true, message: "Recording submitted for review." });
}

function submitSingSangSungX(data) {
  const { student_id, task_number, audio_drive_url, consent_given } = data;
  if (!consent_given) return respond({ success: false, error: "Consent is required for this activity." });

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  getSheet("SingSangSungX").appendRow([
    generateID("SSX"), SEASON_ID, task_number,
    "", "",  // Audio_Path, Lyrics from task
    student_id, audio_drive_url,
    "TRUE", now(),
    "pending", "", 0, 0, 0, "FALSE"
  ]);

  sendInbox(student_id, "system",
    "🎵 Sing Sang Sung X Task " + task_number + " Submitted",
    "Your recording has been submitted. If approved, it will be featured on our social media. Your EXB tokens will be added at the end of the season.",
    ""
  );

  return respond({ success: true, message: "Recording submitted for review." });
}

// ============================================================
// INBOX
// ============================================================

function getInbox(data) {
  const { student_id } = data;
  const messages = sheetData("Inbox")
    .filter(m => m.Student_ID === student_id)
    .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
  return respond({ success: true, messages });
}

function markInboxRead(data) {
  const { student_id, message_id } = data;
  const sheet   = getSheet("Inbox");
  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx   = headers.indexOf("Message_ID");
  const readIdx = headers.indexOf("Read_Status");

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idIdx] === message_id && rows[i][headers.indexOf("Student_ID")] === student_id) {
      sheet.getRange(i + 1, readIdx + 1).setValue("read");
      return respond({ success: true });
    }
  }
  return respond({ success: false, error: "Message not found." });
}

// ============================================================
// APPEALS
// ============================================================

function submitAppeal(data) {
  const { student_id, activity_name, task_number, report_id, message } = data;
  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });

  const appealId = generateID("APL");
  getSheet("Appeals").appendRow([
    appealId, now(), student_id, student.Full_Name,
    activity_name, task_number, SEASON_ID,
    report_id, message,
    "pending", "", "", 0, ""
  ]);

  sendInbox(student_id, "system",
    "📋 Appeal Submitted — #" + appealId,
    "Your appeal for " + activity_name + " Task " + task_number + " has been received. Reference: #" + appealId,
    appealId
  );

  return respond({ success: true, appeal_id: appealId });
}

// ============================================================
// SHOP
// ============================================================

function getTickets(data) {
  const student = getStudentRow(data.student_id);
  if (!student) return respond({ success: false, error: "Student not found." });
  return respond({ success: true, golden_tickets: student.Golden_Tickets });
}

function spendTickets(data) {
  const { student_id, item_type } = data;
  // item_type: "subscription" | "ssr" | "activity"
  const costs = { subscription: 3, ssr: 1, activity: 1 };
  const cost  = costs[item_type];
  if (!cost) return respond({ success: false, error: "Invalid item type." });

  const student = getStudentRow(student_id);
  if (!student) return respond({ success: false, error: "Student not found." });
  if (student.Golden_Tickets < cost) {
    return respond({ success: false, error: "Not enough Golden Tickets.", redirect: "shop" });
  }

  const sheet   = getSheet("Students");
  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];
  const ticketIdx = headers.indexOf("Golden_Tickets");
  const subIdx    = headers.indexOf("Subscription_Status");
  const ssrIdx    = headers.indexOf("SSR_Status");

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][headers.indexOf("Student_ID")] === student_id) {
      sheet.getRange(i + 1, ticketIdx + 1).setValue(student.Golden_Tickets - cost);
      if (item_type === "subscription") sheet.getRange(i + 1, subIdx + 1).setValue("subscribed");
      if (item_type === "ssr")          sheet.getRange(i + 1, ssrIdx + 1).setValue("active");
      break;
    }
  }

  sendInbox(student_id, "system",
    "🎫 " + item_type.charAt(0).toUpperCase() + item_type.slice(1) + " Activated",
    "You spent " + cost + " Golden Ticket(s) to activate " + item_type + ". Enjoy!",
    ""
  );

  return respond({ success: true, tickets_spent: cost, item_activated: item_type });
}

// ============================================================
// LEADERBOARD
// ============================================================

function getLeaderboard(data) {
  const { type } = data; // "general" | "season"
  const students = sheetData("Students")
    .filter(s => s.Account_Status === "active" && !String(s.Student_ID).startsWith("ADMIN"))
    .map(s => ({
      student_id:   s.Student_ID,
      full_name:    s.Full_Name,
      photo_url:    s.Photo_Status === "approved" ? s.Photo_URL : "",
      tokens:       type === "season" ? (Number(s.Season_Tokens) || 0) : (Number(s.Total_Tokens) || 0),
      golden_tickets: s.Golden_Tickets
    }))
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 100);

  return respond({ success: true, leaderboard: students, type });
}

// ============================================================
// ADMIN
// ============================================================

const ADMIN_MASTER_KEY = "EYC_ADMIN_2025"; // Change before launch

function adminLogin(data) {
  if (data.master_key !== ADMIN_MASTER_KEY) {
    return respond({ success: false, error: "Invalid master key." });
  }
  return respond({ success: true, admin_id: "ADMIN_01", message: "Welcome, Admin." });
}

function adminVerify(data) {
  return data.master_key === ADMIN_MASTER_KEY || data.admin_id === "ADMIN_01";
}

function adminGetAppeals(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const appeals = sheetData("Appeals").filter(a => a.Status === "pending");
  return respond({ success: true, appeals });
}

function adminResolveAppeal(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const { appeal_id, decision, bonus_tokens, admin_id } = data;
  // decision: "accepted" | "rejected"

  const sheet   = getSheet("Appeals");
  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][headers.indexOf("Appeal_ID")] === appeal_id) {
      const studentId  = rows[i][headers.indexOf("Student_ID")];
      const activityName = rows[i][headers.indexOf("Activity_Name")];
      const taskNumber   = rows[i][headers.indexOf("Task_Number")];

      sheet.getRange(i + 1, headers.indexOf("Status") + 1).setValue(decision);
      sheet.getRange(i + 1, headers.indexOf("Admin_ID") + 1).setValue(admin_id || "ADMIN_01");
      sheet.getRange(i + 1, headers.indexOf("Resolved_Date") + 1).setValue(now());

      if (decision === "accepted" && bonus_tokens > 0) {
        sheet.getRange(i + 1, headers.indexOf("Bonus_Tokens_Added") + 1).setValue(bonus_tokens);
        adminAddBonus({
          student_id: studentId,
          tokens_amount: bonus_tokens,
          reason: "Technical error — Appeal #" + appeal_id,
          appeal_id,
          admin_id: admin_id || "ADMIN_01",
          master_key: ADMIN_MASTER_KEY
        });
      } else {
        sendInbox(studentId, "appeal",
          "📋 Appeal #" + appeal_id + " — Reviewed",
          "Your appeal for " + activityName + " Task " + taskNumber + " has been reviewed. The correction was accurate.",
          appeal_id
        );
      }

      logAdmin(admin_id || "ADMIN_01", "resolve_appeal", studentId, decision + " — " + appeal_id, appeal_id);
      return respond({ success: true });
    }
  }
  return respond({ success: false, error: "Appeal not found." });
}

function adminAddBonus(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const { student_id, tokens_amount, reason, appeal_id, admin_id } = data;

  // Check cooldown
  const cache    = CacheService.getScriptCache();
  const coolKey  = "bonus_cooldown_" + student_id;
  if (cache.get(coolKey)) {
    return respond({ success: false, error: "Cooldown active. Please wait 30 seconds." });
  }

  addTokens(student_id, Number(tokens_amount), SEASON_ID);
  cache.put(coolKey, "1", BONUS_COOLDOWN_SEC);

  getSheet("Bonus").appendRow([
    generateID("BON"), now(), student_id, admin_id || "ADMIN_01",
    tokens_amount, reason, appeal_id || "",
    "applied", now(),
    new Date(Date.now() + BONUS_COOLDOWN_SEC * 1000).toISOString()
  ]);

  sendInbox(student_id, "appeal",
    "✅ Tokens Added — Appeal #" + (appeal_id || "N/A"),
    tokens_amount + " tokens have been added to your account. Reason: Technical error. Appeal ref: #" + (appeal_id || "N/A"),
    appeal_id || ""
  );

  logAdmin(admin_id || "ADMIN_01", "add_bonus", student_id, tokens_amount + " tokens — " + reason, appeal_id || "");
  return respond({ success: true, tokens_added: tokens_amount });
}

function adminApprovePhoto(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const { student_id, admin_id } = data;
  const sheet   = getSheet("Students");
  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][headers.indexOf("Student_ID")] === student_id) {
      sheet.getRange(i + 1, headers.indexOf("Photo_Status") + 1).setValue("approved");
      logAdmin(admin_id || "ADMIN_01", "approve_photo", student_id, "Photo approved", "");
      sendInbox(student_id, "system", "✅ Profile Photo Approved", "Your profile photo has been approved and is now visible.", "");
      return respond({ success: true });
    }
  }
  return respond({ success: false, error: "Student not found." });
}

function adminRejectPhoto(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const { student_id, admin_id } = data;
  const sheet   = getSheet("Students");
  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][headers.indexOf("Student_ID")] === student_id) {
      sheet.getRange(i + 1, headers.indexOf("Photo_Status") + 1).setValue("rejected");
      logAdmin(admin_id || "ADMIN_01", "reject_photo", student_id, "Photo rejected", "");
      sendInbox(student_id, "system", "❌ Profile Photo Rejected", "Your profile photo did not meet our community guidelines. Please upload an appropriate photo.", "");
      return respond({ success: true });
    }
  }
  return respond({ success: false, error: "Student not found." });
}

function adminGetPendingPhotos(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const pending = sheetData("Students")
    .filter(s => s.Photo_Status === "pending")
    .map(s => ({ student_id: s.Student_ID, full_name: s.Full_Name, photo_url: s.Photo_URL, email: s.Email }));
  return respond({ success: true, pending_photos: pending });
}

function adminGetPendingSubmissions(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const elMag  = sheetData("ElMagazine").filter(r => r.Admin_Status === "pending");
  const elMagX = sheetData("ElMagazineX").filter(r => r.Admin_Status === "pending");
  const ssx    = sheetData("SingSangSungX").filter(r => r.Admin_Status === "pending");
  return respond({ success: true, elmagazine: elMag, elmagazinex: elMagX, singx: ssx });
}

function adminReviewSubmission(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const { sheet_name, entry_id, decision, score, exb_score, fb_post_url, admin_id } = data;

  const sheet   = getSheet(sheet_name);
  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];

  for (let i = 1; i < rows.length; i++) {
    const rowId = rows[i][0];
    if (rowId === entry_id) {
      const studentId = rows[i][headers.indexOf("Student_ID")];
      sheet.getRange(i + 1, headers.indexOf("Admin_Status") + 1).setValue(decision);

      if (decision === "approved") {
        const finalScore = Number(score) || 0;
        if (finalScore > 0) addTokens(studentId, finalScore, SEASON_ID);
        if (fb_post_url) sheet.getRange(i + 1, headers.indexOf("FB_Post_URL") + 1).setValue(fb_post_url);

        sendInbox(studentId, "score",
          "✅ " + sheet_name + " Submission Approved",
          "Your submission has been approved! You earned " + finalScore + " tokens.",
          entry_id
        );
      } else {
        sendInbox(studentId, "score",
          "❌ " + sheet_name + " Submission Rejected",
          "Your submission was rejected. Reason: unclear audio/photo or quality issues. You may retry.",
          entry_id
        );
      }

      logAdmin(admin_id || "ADMIN_01", "review_submission", studentId, decision + " — " + sheet_name, entry_id);
      return respond({ success: true });
    }
  }
  return respond({ success: false, error: "Entry not found." });
}

function adminAddSocialEXB(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const { student_id, activity_name, task_number, likes, shares, tokens_per_like, tokens_per_share, admin_id } = data;

  const totalEXB = (Number(likes) * Number(tokens_per_like)) + (Number(shares) * Number(tokens_per_share));

  getSheet("SocialMedia").appendRow([
    generateID("SM"), SEASON_ID, student_id, activity_name,
    task_number, data.fb_post_url || "",
    likes, shares, tokens_per_like, tokens_per_share,
    totalEXB, "FALSE", now(), admin_id || "ADMIN_01"
  ]);

  logAdmin(admin_id || "ADMIN_01", "add_social_exb", student_id,
    "EXB: " + totalEXB + " tokens — " + activity_name + " T" + task_number, "");

  return respond({ success: true, exb_tokens: totalEXB, message: "Will be added at end of season." });
}

function adminSuspend(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const sheet   = getSheet("Students");
  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][headers.indexOf("Student_ID")] === data.student_id) {
      sheet.getRange(i + 1, headers.indexOf("Account_Status") + 1).setValue("suspended");
      logAdmin(data.admin_id || "ADMIN_01", "suspend", data.student_id, data.reason || "", "");
      sendInbox(data.student_id, "system", "🚫 Account Suspended", "Your account has been suspended. Please contact support.", "");
      return respond({ success: true });
    }
  }
  return respond({ success: false, error: "Student not found." });
}

function adminUnsuspend(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const sheet   = getSheet("Students");
  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][headers.indexOf("Student_ID")] === data.student_id) {
      sheet.getRange(i + 1, headers.indexOf("Account_Status") + 1).setValue("active");
      logAdmin(data.admin_id || "ADMIN_01", "unsuspend", data.student_id, "", "");
      sendInbox(data.student_id, "system", "✅ Account Reinstated", "Your account has been reinstated. Welcome back!", "");
      return respond({ success: true });
    }
  }
  return respond({ success: false, error: "Student not found." });
}

function adminGetStudents(data) {
  if (!adminVerify(data)) return respond({ success: false, error: "Unauthorized." });
  const students = sheetData("Students").map(s => ({
    student_id:     s.Student_ID,
    full_name:      s.Full_Name,
    email:          s.Email,
    age:            s.Age,
    total_tokens:   s.Total_Tokens,
    season_tokens:  s.Season_Tokens,
    golden_tickets: s.Golden_Tickets,
    subscription:   s.Subscription_Status,
    ssr:            s.SSR_Status,
    ai_warnings:    s.AI_Warnings,
    status:         s.Account_Status,
    trial_active:   s.Trial_Active,
    trial_end:      s.Trial_End,
    photo_status:   s.Photo_Status,
    registered:     s.Registration_Date
  }));
  return respond({ success: true, students });
}
