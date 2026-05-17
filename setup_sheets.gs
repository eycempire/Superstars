// ============================================================
// SUPERSTARS — Google Sheets Setup Script
// EYC Empire | Run ONCE to build full DB structure
// ============================================================

function setupSuperstarsDB() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // ── Delete default Sheet1 after setup ──
  const defaultSheet = ss.getSheetByName("Sheet1");

  // ============================================================
  // SHEET DEFINITIONS
  // ============================================================

  const sheets = [

    // ── STUDENTS ──────────────────────────────────────────────
    {
      name: "Students",
      color: "#4A90D9",
      headers: [
        "Student_ID", "Full_Name", "Age", "Email", "Photo_URL",
        "Photo_Status",       // pending | approved | rejected
        "Code", "Passkey",
        "Total_Tokens", "Season_Tokens", "Golden_Tickets",
        "Subscription_Status", // free | subscribed
        "SSR_Status",          // none | active
        "Trial_Start", "Trial_End", "Trial_Active",
        "AI_Warnings", "Account_Status", // active | suspended
        "Registration_Date", "Last_Login", "Season_ID"
      ]
    },

    // ── SEASONS ───────────────────────────────────────────────
    {
      name: "Seasons",
      color: "#7B68EE",
      headers: [
        "Season_ID", "Season_Name", "Start_Date", "End_Date",
        "Status", // upcoming | active | ended
        "Total_Tasks_Per_Activity"
      ]
    },

    // ── TASKS SCHEDULE ────────────────────────────────────────
    {
      name: "Tasks",
      color: "#9B59B6",
      headers: [
        "Task_ID", "Season_ID", "Activity_Name", "Task_Number",
        "Unlock_DateTime", "Status", // locked | unlocked
        "Asset_Folder_Path"
      ]
    },

    // ── GRAMMAR ───────────────────────────────────────────────
    {
      name: "Grammar",
      color: "#27AE60",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Q1", "Q2", "Q3", "Q4", "Q5",
        "Q6", "Q7", "Q8", "Q9", "Q10"
      ]
    },

    // ── GRAMMAR X ─────────────────────────────────────────────
    {
      name: "GrammarX",
      color: "#1E8449",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Text_Content", "Requirement",
        "Valid_Answer_1", "Valid_Answer_2", "Valid_Answer_3",
        "Valid_Answer_4", "Valid_Answer_5", "Valid_Answer_6",
        "Valid_Answer_7", "Valid_Answer_8", "Valid_Answer_9", "Valid_Answer_10"
      ]
    },

    // ── ALIKE ─────────────────────────────────────────────────
    {
      name: "Alike",
      color: "#F39C12",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "AR_Word_1", "EN_Answer_1",
        "AR_Word_2", "EN_Answer_2",
        "AR_Word_3", "EN_Answer_3",
        "AR_Word_4", "EN_Answer_4",
        "AR_Word_5", "EN_Answer_5",
        "AR_Word_6", "EN_Answer_6",
        "AR_Word_7", "EN_Answer_7",
        "AR_Word_8", "EN_Answer_8",
        "AR_Word_9", "EN_Answer_9",
        "AR_Word_10", "EN_Answer_10"
      ]
    },

    // ── ALIKE X ───────────────────────────────────────────────
    {
      name: "AlikeX",
      color: "#E67E22",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Audio_1_Answer", "Audio_2_Answer", "Audio_3_Answer",
        "Audio_4_Answer", "Audio_5_Answer", "Audio_6_Answer",
        "Audio_7_Answer", "Audio_8_Answer", "Audio_9_Answer", "Audio_10_Answer"
      ]
    },

    // ── SEEDS ─────────────────────────────────────────────────
    {
      name: "Seeds",
      color: "#16A085",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Word_1", "Word_2", "Word_3", "Word_4", "Word_5", "Word_6",
        "Outlier_Word",
        "Keyword_Bank",      // comma-separated content keywords
        "AI_Blacklist",      // comma-separated AI phrases
        "Min_Words", "Max_Words",
        "Tokens_Part_A", "Tokens_Part_B"
      ]
    },

    // ── SEEDS X ───────────────────────────────────────────────
    {
      name: "SeedsX",
      color: "#0E6655",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Sentence_1", "Sentence_2", "Sentence_3",
        "Sentence_4", "Sentence_5", "Sentence_6",
        "Outlier_Sentence",
        "Keyword_Bank",
        "AI_Blacklist",
        "Min_Words", "Max_Words",
        "Tokens_Part_A", "Tokens_Part_B"
      ]
    },

    // ── VIVID ─────────────────────────────────────────────────
    {
      name: "Vivid",
      color: "#8E44AD",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Image_Path",
        "Keyword_Bank",      // comma-separated
        "AI_Blacklist",
        "Min_Words", "Max_Words",
        "Total_Keywords"     // for percentage calculation
      ]
    },

    // ── VIVID X ───────────────────────────────────────────────
    {
      name: "VividX",
      color: "#6C3483",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Image_Path", "Requirement", // past | future
        "Keyword_Bank",
        "AI_Blacklist",
        "Min_Words", "Max_Words",
        "Total_Keywords"
      ]
    },

    // ── LABEL ─────────────────────────────────────────────────
    {
      name: "Label",
      color: "#C0392B",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Image_1_Answers", "Image_2_Answers", "Image_3_Answers",
        "Image_4_Answers", "Image_5_Answers", "Image_6_Answers",
        "Image_7_Answers", "Image_8_Answers", "Image_9_Answers", "Image_10_Answers"
        // Each cell: comma-separated synonyms e.g. "elevator,lift"
      ]
    },

    // ── LABEL X ───────────────────────────────────────────────
    {
      name: "LabelX",
      color: "#922B21",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Sentence_1", "Wrong_Word_1", "Correction_1",
        "Sentence_2", "Wrong_Word_2", "Correction_2",
        "Sentence_3", "Wrong_Word_3", "Correction_3",
        "Sentence_4", "Wrong_Word_4", "Correction_4",
        "Sentence_5", "Wrong_Word_5", "Correction_5",
        "Sentence_6", "Wrong_Word_6", "Correction_6",
        "Sentence_7", "Wrong_Word_7", "Correction_7",
        "Sentence_8", "Wrong_Word_8", "Correction_8",
        "Sentence_9", "Wrong_Word_9", "Correction_9",
        "Sentence_10", "Wrong_Word_10", "Correction_10"
      ]
    },

    // ── GOLDEN EAR ────────────────────────────────────────────
    {
      name: "GoldenEar",
      color: "#D4AC0D",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Audio_Path",
        "Q1", "Q2", "Q3", "Q4", "Q5",
        "Q6", "Q7", "Q8", "Q9", "Q10"
      ]
    },

    // ── GOLDEN EAR X ──────────────────────────────────────────
    {
      name: "GoldenEarX",
      color: "#B7950B",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Audio_1_Path", "Audio_1_Keywords", "Audio_1_Min_Keywords",
        "Audio_2_Path", "Audio_2_Keywords", "Audio_2_Min_Keywords",
        "Audio_3_Path", "Audio_3_Keywords", "Audio_3_Min_Keywords",
        "Audio_4_Path", "Audio_4_Keywords", "Audio_4_Min_Keywords"
        // Keywords: comma-separated
      ]
    },

    // ── FIGURATIVE ────────────────────────────────────────────
    {
      name: "Figurative",
      color: "#1A5276",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Dialogue_1", "Expression_1", "Keywords_1",
        "Dialogue_2", "Expression_2", "Keywords_2",
        "Dialogue_3", "Expression_3", "Keywords_3",
        "Dialogue_4", "Expression_4", "Keywords_4",
        "Dialogue_5", "Expression_5", "Keywords_5",
        "Dialogue_6", "Expression_6", "Keywords_6",
        "Dialogue_7", "Expression_7", "Keywords_7",
        "Dialogue_8", "Expression_8", "Keywords_8",
        "Dialogue_9", "Expression_9", "Keywords_9",
        "Dialogue_10", "Expression_10", "Keywords_10"
      ]
    },

    // ── FIGURATIVE X ──────────────────────────────────────────
    {
      name: "FigurativeX",
      color: "#154360",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Audio_1_Answer", "Audio_2_Answer", "Audio_3_Answer",
        "Audio_4_Answer", "Audio_5_Answer", "Audio_6_Answer",
        "Audio_7_Answer", "Audio_8_Answer", "Audio_9_Answer", "Audio_10_Answer"
      ]
    },

    // ── SING SANG SUNG ────────────────────────────────────────
    {
      name: "SingSangSung",
      color: "#6D4C41",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Arabic_Lyrics",
        "Keyword_Bank",
        "AI_Blacklist",
        "Acceptance_Threshold_Pct", // min % match to accept submission
        "Min_Words"
      ]
    },

    // ── SING SANG SUNG X ──────────────────────────────────────
    {
      name: "SingSangSungX",
      color: "#4E342E",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Audio_Path", "Lyrics",
        "Student_ID", "Submission_URL",
        "Consent_Given", // TRUE | FALSE
        "Consent_Timestamp",
        "Admin_Status",  // pending | approved | rejected
        "FB_Post_URL",
        "Likes_Count", "Shares_Count",
        "EXB_Tokens", "EXB_Added"  // TRUE | FALSE
      ]
    },

    // ── DICTATION ─────────────────────────────────────────────
    {
      name: "Dictation",
      color: "#2E86C1",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Audio_Path", "Original_Text",
        "Acceptance_Threshold_Pct"
      ]
    },

    // ── DICTATION X ───────────────────────────────────────────
    {
      name: "DictationX",
      color: "#1A5276",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Audio_1_Path", "Text_1",
        "Audio_2_Path", "Text_2",
        "Audio_3_Path", "Text_3",
        "Audio_4_Path", "Text_4",
        "Acceptance_Threshold_Pct",
        "EXB_Threshold_Pct"  // default 90
      ]
    },

    // ── EL MAGAZINE ───────────────────────────────────────────
    {
      name: "ElMagazine",
      color: "#117A65",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Text_Content", "Max_Tokens",
        "Student_ID", "Submission_URL",
        "Admin_Status",   // pending | approved | rejected
        "Admin_Score", "EXB_Score",
        "Admin_Note", "Processed_Date"
      ]
    },

    // ── EL MAGAZINE X ─────────────────────────────────────────
    {
      name: "ElMagazineX",
      color: "#0E6655",
      headers: [
        "Task_ID", "Season_ID", "Task_Number",
        "Text_Content", "Max_Tokens",
        "Student_ID", "Submission_URL",
        "Admin_Status",
        "Admin_Score",
        "FB_Post_URL",
        "Likes_Count", "Shares_Count",
        "EXB_Tokens", "EXB_Added"
      ]
    },

    // ── REPORTS ───────────────────────────────────────────────
    {
      name: "Reports",
      color: "#616A6B",
      headers: [
        "Report_ID", "Timestamp", "Student_ID", "Student_Name",
        "Activity_Name", "Task_Number", "Season_ID",
        "Student_Answers",   // JSON string
        "Correct_Answers",   // JSON string
        "Score_Earned", "Max_Score",
        "Error_Explanation", "AI_Flag"  // TRUE | FALSE
      ]
    },

    // ── APPEALS ───────────────────────────────────────────────
    {
      name: "Appeals",
      color: "#E74C3C",
      headers: [
        "Appeal_ID", "Timestamp", "Student_ID", "Student_Name",
        "Activity_Name", "Task_Number", "Season_ID",
        "Report_ID", "Student_Message",
        "Status",           // pending | accepted | rejected
        "Admin_Response", "Admin_ID",
        "Bonus_Tokens_Added", "Resolved_Date"
      ]
    },

    // ── INBOX ─────────────────────────────────────────────────
    {
      name: "Inbox",
      color: "#5D6D7E",
      headers: [
        "Message_ID", "Timestamp", "Student_ID",
        "Type",   // score | warning | appeal | milestone | system
        "Title", "Body",
        "Read_Status",  // unread | read
        "Related_ID"    // task/appeal/season ID
      ]
    },

    // ── BONUS ─────────────────────────────────────────────────
    {
      name: "Bonus",
      color: "#F1C40F",
      headers: [
        "Bonus_ID", "Timestamp", "Student_ID", "Admin_ID",
        "Tokens_Amount", "Reason",
        "Appeal_ID",      // if related to appeal
        "Status",         // pending | applied
        "Applied_At",
        "Cooldown_Until"  // 30 seconds after last bonus
      ]
    },

    // ── SOCIAL MEDIA ──────────────────────────────────────────
    {
      name: "SocialMedia",
      color: "#3498DB",
      headers: [
        "Entry_ID", "Season_ID", "Student_ID", "Activity_Name",
        "Task_Number", "FB_Post_URL",
        "Likes_Count", "Shares_Count",
        "Tokens_Per_Like", "Tokens_Per_Share",
        "Total_EXB_Tokens",
        "Added_To_Student",  // TRUE | FALSE
        "Entry_Date", "Admin_ID"
      ]
    },

    // ── ADMIN LOG ─────────────────────────────────────────────
    {
      name: "AdminLog",
      color: "#2C3E50",
      headers: [
        "Log_ID", "Timestamp", "Admin_ID",
        "Action_Type",  // approve_photo | reject_photo | resolve_appeal | add_bonus | update_score | suspend | unsuspend | add_social_exb
        "Target_Student_ID", "Details", "Related_ID"
      ]
    }

  ];

  // ============================================================
  // BUILD SHEETS
  // ============================================================

  sheets.forEach(sheetDef => {
    let sheet = ss.getSheetByName(sheetDef.name);
    if (!sheet) {
      sheet = ss.insertSheet(sheetDef.name);
    }

    // Set headers
    const headerRange = sheet.getRange(1, 1, 1, sheetDef.headers.length);
    headerRange.setValues([sheetDef.headers]);

    // Style headers
    headerRange.setBackground(sheetDef.color);
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment("center");

    // Freeze header row
    sheet.setFrozenRows(1);

    // Auto-resize columns
    sheet.autoResizeColumns(1, sheetDef.headers.length);

    // Set row height for header
    sheet.setRowHeight(1, 35);

    // Alternate row colors for readability
    const maxRows = 1000;
    if (maxRows > 1) {
      const dataRange = sheet.getRange(2, 1, maxRows, sheetDef.headers.length);
      dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
    }

    Logger.log("✅ Created sheet: " + sheetDef.name);
  });

  // ============================================================
  // DELETE DEFAULT SHEET
  // ============================================================

  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
    Logger.log("🗑️ Deleted default Sheet1");
  }

  // ============================================================
  // ADD SEASON 1 DEFAULT ROW
  // ============================================================

  const seasonsSheet = ss.getSheetByName("Seasons");
  seasonsSheet.getRange(2, 1, 1, 6).setValues([[
    "S01", "Season 1", 
    new Date().toISOString().split("T")[0],
    "",
    "active",
    "10"
  ]]);

  // ============================================================
  // DONE
  // ============================================================

  SpreadsheetApp.getUi().alert(
    "✅ Superstars DB Setup Complete!\n\n" +
    "Created " + sheets.length + " sheets successfully.\n\n" +
    "Next step: Set up Apps Script Web App (doPost function)."
  );

  Logger.log("🚀 Setup complete! " + sheets.length + " sheets created.");
}
