// ============================================================
// SUPERSTARS — Apps Script PATCH v2
// أضف الكود ده في آخر ملف الـ Apps Script الحالي
// ============================================================

// ── PATCH 1: Auto-approve avatar (generated, not uploaded) ──
// بيتبعت من signup.html بعد التسجيل مباشرة
function adminAutoApproveAvatar(data) {
  // مش محتاج master_key — بس student_id
  if (!data.student_id) return respond({ success: false, error: "Missing student_id." });

  const s = getSheet("Students");
  const r = s.getDataRange().getValues();
  const h = r[0];
  const pi = h.indexOf("Photo_Status");
  const ii = h.indexOf("Student_ID");

  for (let i = 1; i < r.length; i++) {
    if (r[i][ii] === data.student_id) {
      s.getRange(i + 1, pi + 1).setValue("approved");
      return respond({ success: true });
    }
  }
  return respond({ success: false, error: "Student not found." });
}

// ── PATCH 2: Fix route table ─────────────────────────────────
// في الـ route function الموجودة، ضيف السطر ده جوه الـ R object:
// admin_auto_approve_avatar: () => adminAutoApproveAvatar(data),
// submit_singsangsung: () => submitAsync(data, "SingSangSung"),  ← fix الاسم الغلط

// ── PATCH 3: GoldenEarX submit ──────────────────────────────
// بدل الـ respond فارغ، ضيف الـ function دي:
function submitGoldenEarX(data) {
  const st = getStudentRow(data.student_id);
  if (!st) return respond({ success: false, error: "Student not found." });

  const td = sheetData("GoldenEarX").find(
    r => String(r.Task_Number) == String(data.task_number) && r.Season_ID === SEASON_ID
  );
  if (!td) return respond({ success: false, error: "Task not found." });

  const answers = data.answers || []; // [{clip:1, sentences:["s1","s2","s3"]}, ...]
  let totalTokens = 0;
  const feedback  = [];
  const tokPerClip = TOKENS.GoldenEarX / 4; // 4 clips

  answers.forEach((clipAns, idx) => {
    const clipNum = clipAns.clip || (idx + 1);
    const kw = String(td["Clip_" + clipNum + "_Keywords"] || "")
      .split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
    const minKw = Number(td["Clip_" + clipNum + "_Min_Keywords"] || 2);

    // Join all 3 sentences
    const studentText = (clipAns.sentences || []).join(" ").toLowerCase();

    // Count keyword matches (tolerance: up to 2 wrong letters via includes)
    let matched = 0;
    kw.forEach(k => { if (k && studentText.includes(k.slice(0, Math.max(k.length - 2, 3)))) matched++; });

    const accepted = matched >= minKw;
    const clipTok  = accepted ? Math.round(tokPerClip) : 0;
    totalTokens += clipTok;

    feedback.push({ clip: clipNum, matched, required: minKw, accepted, tokens: clipTok });
  });

  if (totalTokens > 0) addTokens(data.student_id, totalTokens);

  const rid = saveReport(
    data.student_id, st.Full_Name, "GoldenEarX", data.task_number,
    data.answers, feedback, totalTokens, TOKENS.GoldenEarX,
    "Clips accepted: " + feedback.filter(f => f.accepted).length + "/4", false
  );

  sendInbox(data.student_id, "score",
    "✅ Golden Ear X Task " + data.task_number + " Done",
    "Earned " + totalTokens + "/" + TOKENS.GoldenEarX + " tokens.", rid
  );

  return respond({
    success: true,
    tokens_earned: totalTokens,
    feedback,
    correct: feedback.filter(f => f.accepted).length,
    total: 4,
    report_id: rid
  });
}

// ── PATCH 4: FigurativeX submit ──────────────────────────────
// بدل ما بيستخدم submitFigurative نفسها، محتاج version خاصة بيها
function submitFigurativeX(data) {
  const st = getStudentRow(data.student_id);
  if (!st) return respond({ success: false, error: "Student not found." });

  const td = sheetData("FigurativeX").find(
    r => String(r.Task_Number) == String(data.task_number) && r.Season_ID === SEASON_ID
  );
  if (!td) return respond({ success: false, error: "Task not found." });

  let correct = 0;
  const feedback = [];
  const tpq = TOKENS.FigurativeX / 10;

  for (let i = 1; i <= 10; i++) {
    const ca = String(td["Q" + i + "_Answer"] || "").trim().toLowerCase();
    const sa = String((data.answers || [])[i - 1] || "").trim().toLowerCase();
    const ok = sa === ca;
    if (ok) correct++;
    feedback.push({ question: i, correct: ok, correct_answer: td["Q" + i + "_Answer"] });
  }

  const tok = Math.round(correct * tpq);
  if (tok > 0) addTokens(data.student_id, tok);

  const rid = saveReport(
    data.student_id, st.Full_Name, "FigurativeX", data.task_number,
    data.answers, feedback, tok, TOKENS.FigurativeX, correct + "/10", false
  );

  sendInbox(data.student_id, "score",
    "✅ Figurative X Task " + data.task_number + " Done",
    "Scored " + tok + "/" + TOKENS.FigurativeX + " tokens. (" + correct + "/10)", rid
  );

  return respond({ success: true, tokens_earned: tok, correct, total: 10, feedback, report_id: rid });
}

// ── PATCH 5: AlikeX submit ───────────────────────────────────
// بيستخدم Audio answers مش text pairs
function submitAlikeX(data) {
  const st = getStudentRow(data.student_id);
  if (!st) return respond({ success: false, error: "Student not found." });

  const td = sheetData("AlikeX").find(
    r => String(r.Task_Number) == String(data.task_number) && r.Season_ID === SEASON_ID
  );
  if (!td) return respond({ success: false, error: "Task not found." });

  let correct = 0;
  const feedback = [];

  for (let i = 1; i <= 10; i++) {
    const ca = String(td["Audio_" + i + "_Answer"] || "").trim().toLowerCase();
    const sa = String((data.answers || [])[i - 1] || "").trim().toLowerCase();
    const ok = sa === ca;
    if (ok) correct++;
    feedback.push({ question: i, correct: ok, correct_answer: td["Audio_" + i + "_Answer"] });
  }

  const tok = Math.round((correct / 10) * TOKENS.AlikeX);
  if (tok > 0) addTokens(data.student_id, tok);

  const rid = saveReport(
    data.student_id, st.Full_Name, "AlikeX", data.task_number,
    data.answers, feedback, tok, TOKENS.AlikeX, correct + "/10", false
  );

  sendInbox(data.student_id, "score",
    "✅ Alike X Task " + data.task_number + " Done",
    "Scored " + tok + "/" + TOKENS.AlikeX + " tokens. (" + correct + "/10)", rid
  );

  return respond({ success: true, tokens_earned: tok, correct, total: 10, feedback, report_id: rid });
}

// ── PATCH 6: SingSangSung submit (async + keyword check) ─────
function submitSingSangSung(data) {
  const st = getStudentRow(data.student_id);
  if (!st) return respond({ success: false, error: "Student not found." });

  const text = String(data.answers || "");
  const wc   = (text.match(/\b\w+\b/g) || []).length;

  if (wc < 100) return respond({ success: false, error: "Translation too short (" + wc + " words). Minimum is 100." });

  // AI detection
  const td = sheetData("SingSangSung").find(
    r => String(r.Task_Number) == String(data.task_number) && r.Season_ID === SEASON_ID
  );

  if (td && detectAI(text, td.AI_Blacklist)) {
    handleAI(data.student_id, "SingSangSung", data.task_number);
    return respond({ success: true, tokens_earned: 0, ai_detected: true });
  }

  // Log submission for admin review
  getSheet("SingSangSung").appendRow([
    generateID("SSS"), SEASON_ID, data.task_number, "",
    data.student_id, text, wc, now(), "pending", "", 0
  ]);

  sendInbox(data.student_id, "system",
    "📬 Sing Sang Sung Task " + data.task_number + " Submitted",
    "Your translation is being reviewed. Score coming to your Inbox.", ""
  );

  return respond({ success: true, message: "Translation submitted for review." });
}

// ============================================================
// UPDATED ROUTE TABLE — استبدل الـ R object في route() بالآتي
// ============================================================
/*
const R = {
  register:                    () => registerStudent(data),
  login:                       () => loginStudent(data),
  recover_credentials:         () => recoverCredentials(data),
  get_profile:                 () => getProfile(data),
  update_photo:                () => updatePhoto(data),
  admin_auto_approve_avatar:   () => adminAutoApproveAvatar(data),  // ← جديد
  get_tasks:                   () => getTasks(data),
  get_task_data:               () => getTaskData(data),
  submit_grammar:              () => submitGrammar(data),
  submit_grammarx:             () => submitGrammarX(data),
  submit_alike:                () => submitAlike(data),
  submit_alikex:               () => submitAlikeX(data),           // ← محدث
  submit_label:                () => submitLabel(data),
  submit_labelx:               () => submitLabelX(data),
  submit_goldenear:            () => submitGoldenEar(data),
  submit_goldenearx:           () => submitGoldenEarX(data),        // ← محدث
  submit_figurative:           () => submitFigurative(data),
  submit_figurativex:          () => submitFigurativeX(data),       // ← محدث
  submit_seeds:                () => submitSeeds(data),
  submit_seedsx:               () => submitSeeds(data),
  submit_vivid:                () => submitVivid(data),
  submit_vividx:               () => submitVivid(data),
  submit_singsangsung:         () => submitSingSangSung(data),      // ← محدث (كان submit_sing)
  submit_singsangsungx:        () => submitSingSangSungX(data),
  submit_dictation:            () => submitAsync(data, "Dictation"),
  submit_dictationx:           () => submitAsync(data, "DictationX"),
  submit_elmagazine:           () => submitAsync(data, "ElMagazine"),
  submit_elmagazinex:          () => submitAsync(data, "ElMagazineX"),
  get_inbox:                   () => getInbox(data),
  mark_read:                   () => markInboxRead(data),
  submit_appeal:               () => submitAppeal(data),
  get_tickets:                 () => getTickets(data),
  spend_tickets:               () => spendTickets(data),
  get_leaderboard:             () => getLeaderboard(data),
  admin_login:                 () => adminLogin(data),
  admin_get_appeals:           () => adminGetAppeals(data),
  admin_resolve_appeal:        () => adminResolveAppeal(data),
  admin_approve_photo:         () => adminApprovePhoto(data),
  admin_reject_photo:          () => adminRejectPhoto(data),
  admin_add_social_exb:        () => adminAddSocialEXB(data),
  admin_review_submission:     () => adminReviewSubmission(data),
  admin_suspend:               () => adminSuspend(data),
  admin_unsuspend:             () => adminUnsuspend(data),
  admin_get_students:          () => adminGetStudents(data),
  admin_get_pending_photos:    () => adminGetPendingPhotos(data),
  admin_get_pending_submissions:() => adminGetPendingSubmissions(data)
};
*/
