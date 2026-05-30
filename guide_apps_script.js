// ============================================================
// SUPERSTARS — Guide Apps Script
// ملف منفصل تماماً عن الـ backend الرئيسي
// Deploy as separate Web App
// ============================================================

const GUIDE_SS    = SpreadsheetApp.getActiveSpreadsheet();
const GUIDE_SHEET = "GuideKB"; // اسم الشيت في الـ spreadsheet

// ── Entry Point ───────────────────────────────────────────
function doGet(e) {
  try {
    const raw  = e.parameter.data || "{}";
    const data = JSON.parse(decodeURIComponent(raw));

    // CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    if (data.action === "search_guide") {
      output.setContent(JSON.stringify(searchGuide(data)));
    } else if (data.action === "get_all") {
      output.setContent(JSON.stringify(getAllEntries()));
    } else {
      output.setContent(JSON.stringify({ success: true, message: "Guide API running ✅" }));
    }

    return output;
  } catch(err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Search ────────────────────────────────────────────────
function searchGuide(data) {
  const question = String(data.question || "").toLowerCase().trim();
  const name     = String(data.student_name || "");

  if (!question) return { found: false, fallback: "اسألني أي حاجة!" };

  const entries = getGuideData();
  if (!entries.length) return { found: false, fallback: "قاعدة البيانات فاضية حالياً." };

  // Score each entry
  let bestMatch = null;
  let bestScore = 0;

  entries.forEach(entry => {
    if (!entry.Keywords || !entry.Answer) return;

    const keywords = String(entry.Keywords).split(",").map(k => k.trim().toLowerCase());
    let score = 0;

    keywords.forEach(kw => {
      if (!kw) return;
      if (question.includes(kw))          score += 3;  // exact match
      else if (kw.includes(question))     score += 2;  // partial
      else {
        // Fuzzy — check if >60% of chars match
        const overlap = kw.split("").filter(c => question.includes(c)).length;
        if (overlap / kw.length > 0.6)    score += 1;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  });

  if (bestMatch && bestScore >= 3) {
    // Personalize answer with student name
    let answer = String(bestMatch.Answer);
    if (name) answer = answer.replace(/\{name\}/g, name);

    const suggestions = bestMatch.Suggestions
      ? String(bestMatch.Suggestions).split(",").map(s => s.trim()).filter(Boolean)
      : [];

    return {
      found:       true,
      answer,
      suggestions,
      category:    bestMatch.Category || "",
      confidence:  bestScore
    };
  }

  if (bestMatch && bestScore >= 1) {
    let answer = `مش متأكد 100% بس ممكن تقصد:\n${bestMatch.Answer}`;
    if (name) answer = answer.replace(/\{name\}/g, name);
    return {
      found:       true,
      answer,
      suggestions: ["اسألني بطريقة تانية", "استخدم Gemini للمساعدة الكاملة"],
      confidence:  bestScore
    };
  }

  return {
    found:   false,
    fallback: name
      ? `${name}، مش فاهم السؤال ده كويس 🤔 جرب تسأل عن: التوكينز، الأنشطة، الاشتراك، أو استخدم Gemini.`
      : "مش فاهم السؤال ده كويس 🤔 جرب تسأل عن: التوكينز، الأنشطة، الاشتراك، أو استخدم Gemini."
  };
}

// ── Get Data ──────────────────────────────────────────────
function getGuideData() {
  const sheet = GUIDE_SS.getSheetByName(GUIDE_SHEET);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  }).filter(r => r.Keywords && r.Answer);
}

function getAllEntries() {
  return { success: true, entries: getGuideData() };
}

// ============================================================
// SETUP — Run once to create the GuideKB sheet with sample data
// ============================================================
function setupGuideSheet() {
  let sheet = GUIDE_SS.getSheetByName(GUIDE_SHEET);
  if (!sheet) {
    sheet = GUIDE_SS.insertSheet(GUIDE_SHEET);
  }

  // Headers
  const headers = ["ID", "Category", "Keywords", "Answer", "Suggestions", "Last_Updated"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");

  // Sample data
  const data = [
    ["G001", "tokens",
     "توكن,توكينز,كسب,اكسب,كيف اكسب,بكسب",
     "التوكينز بتكسبها بإكمال التاسكات في أي نشاط. كل إجابة صح = توكينز.\nالأنشطة الصعبة زي Dictation X وSeeds X بتديك توكينز أكتر (90-100 توكن). وصّل لـ 3,000 توكن واكسب تذكرة ذهبية!",
     "التذاكر الذهبية إيه؟,الأنشطة الصعبة إيه؟",
     new Date()],

    ["G002", "tickets",
     "تذكرة,تذاكر,ذهبية,golden ticket,جولدن",
     "التذاكر الذهبية بتكسبها لما توصل لـ milestones:\n🎫 3,000 توكن = تذكرة\n🎫 6,000 توكن = تذكرة تانية\nوهكذا. تقدر تصرف 3 تذاكر عشان تفتح كل الأنشطة الـ premium للموسم كله.",
     "الاشتراك بكام؟,ازاي اشتري تذاكر؟",
     new Date()],

    ["G003", "subscription",
     "اشتراك,اشترك,فلوس,سعر,بكام,subscription",
     "اشتراك الموسم بيكلف 3 تذاكر ذهبية.\nلو مش عندك تذاكر، اشتريها بفودافون كاش من صفحة الشوب:\n💰 1 تذكرة = 15 جنيه\n💰 3 تذاكر = 40 جنيه (الأوفر)\n💰 5 تذاكر = 60 جنيه",
     "ازاي أشتري من الشوب؟,إيه المجاني؟",
     new Date()],

    ["G004", "free",
     "مجاني,مجانا,بدون فلوس,free,بلاش",
     "الأنشطة المجانية بالكامل:\n📝 Grammar\n👂 Alike\n🏷️ Label\n👂 Golden Ear\n💬 Figurative\n🎵 Sing Sang Sung\n\nوكمان التاسك الأول في Seeds وVivid وDictation وEl-Magazine مجاني.\n14 يوم تجربة مجانية بعد التسجيل بيفتح كل حاجة!",
     "الاشتراك إيه؟,التجربة المجانية كام يوم؟",
     new Date()],

    ["G005", "activities",
     "نشاط,انشطة,الأنشطة,ايه في,إيه الأنشطة,activities",
     "فيه 20 نشاط!\n📝 Grammar — جراما\n👂 Alike — أصوات متشابهة\n🌱 Seeds — كتابة إبداعية\n🖼️ Vivid — وصف الصور\n💬 Figurative — تعبيرات مجازية\n🎵 Sing Sang Sung — ترجمة أغاني\n✍️ Dictation — إملاء\n🎙️ El-Magazine — قراءة بصوت عالي\n👂 Golden Ear — فهم استماع\n🏷️ Label — تعليم الصور\n\nكلهم موجودين بنسخة X بتوكينز أعلى!",
     "إيه الأنشطة المجانية؟,الـ X version إيه؟",
     new Date()],

    ["G006", "xversion",
     "x version,نسخة x,اكس,متقدم,premium",
     "نسخ الـ X هي الأنشطة المتقدمة اللي بتديك توكينز أعلى:\n✨ Grammar X = 60 توكن\n✨ Seeds X = 80 توكن\n✨ Dictation X = 90 توكن\n✨ El-Magazine X = 90 توكن\n✨ Sing Sang Sung X = 100 توكن\n\nمحتاج اشتراك أو تذاكر ذهبية عشان تفتحهم.",
     "إزاي أشترك؟,إيه التذاكر الذهبية؟",
     new Date()],

    ["G007", "leaderboard",
     "ترتيب,ليدربورد,تصدر,مرتبة,رانك,leaderboard",
     "الليدربورد فيه ترتيبين:\n🏟️ ترتيب الموسم — بيتريسيت كل موسم\n🌍 ترتيب الكل وقت — مش بيتريسيت\n\nعشان ترفع في الترتيب: اعمل أكبر عدد ممكن من التاسكات في الوقت بتاعه.",
     "إزاي أكسب توكينز أكتر؟",
     new Date()],

    ["G008", "dictation",
     "ديكتيشن,dictation,كتابة يدوية,صورة,إملاء",
     "في Dictation:\n1️⃣ استمع للـ audio (تقدر تعمل pause بس مش rewind)\n2️⃣ اكتب اللي سمعته بخطك على ورق\n3️⃣ صور الورقة وارفعها\n\nلازم:\n✅ الصورة تكون واضحة\n✅ الخط يكون مقروء\n✅ بلاش تشطيب\n\nالدرجة بتيجي في الـ Inbox بعد مراجعة الأدمن.",
     "الـ DictationX إيه؟,الدرجة امتى بتيجي؟",
     new Date()],

    ["G009", "score",
     "نتيجة,درجة,score,امتى,النتيجة فين",
     "معظم الأنشطة النتيجة فورية.\n\nالأنشطة اللي النتيجة بتيجي في الـ Inbox:\n📬 Dictation\n📬 El-Magazine\n📬 Sing Sang Sung\n\nالسبب إن الأدمن بيراجعها يدوياً.",
     "إزاي أشوف الـ Inbox؟",
     new Date()],

    ["G010", "ai",
     "ai,ذكاء اصطناعي,chatgpt,جبت الإجابة من النت,copy",
     "ممنوع استخدام AI في أنشطة الكتابة!\n\n❌ Seeds\n❌ Vivid\n❌ Dictation\n❌ Sing Sang Sung\n\nالنظام بيكتشفه تلقائياً:\n⚠️ أول مرة = صفر توكن + تحذير\n⚠️ تلاتة تحذيرات = إيقاف الحساب",
     "إيه الأنشطة اللي فيها كتابة؟",
     new Date()],

    ["G011", "appeal",
     "طعن,appeal,غلط,مش صح,مش عدل",
     "لو حاسس الدرجة غلط:\n1️⃣ دوس على زرار Appeal بعد النتيجة\n2️⃣ اكتب سبب الطعن\n3️⃣ الأدمن هيراجعه خلال 24 ساعة\n\nلو الطعن اتقبل = توكينز إضافية هتتضاف.",
     "النتيجة امتى بتيجي؟",
     new Date()],

    ["G012", "vodafone",
     "فودافون,vodafone,دفع,كاش,شراء,ادفع",
     "الدفع عن طريق Vodafone Cash:\n1️⃣ افتح صفحة الشوب\n2️⃣ اختار الباقة\n3️⃣ ابعت المبلغ على رقم 01063755286\n4️⃣ صوّر الإيصال وابعته على الواتساب مع الكود بتاعك\n5️⃣ التذاكر بتتضاف في 30 دقيقة",
     "الشوب فين؟,التذاكر الذهبية إيه؟",
     new Date()],

    ["G013", "ssr",
     "ssr,تقرير,تصحيح,تفاصيل الإجابات,superstars reporter",
     "SSR Reporter خدمة ممتازة!\nبعد كل تاسك هتشوف:\n📋 كل إجابة أعطيتها\n✅ الإجابة الصح\n💡 ليه كانت غلط\n\nبتكلف تذكرة واحدة وصالحة للموسم كله.",
     "إزاي أشتري تذكرة؟",
     new Date()],

    ["G014", "season",
     "موسم,season,امتى,ينتهي,يبدأ",
     "الموسم الحالي هو الموسم الأول.\nكل موسم بيستمر 30 يوم.\nفي نهاية كل موسم:\n🏆 الترتيب الموسمي بيتريسيت\n🌍 الترتيب العام بيفضل\n🎫 التوكينز بتتنقل للموسم الجديد",
     "إزاي أرفع في الترتيب؟",
     new Date()],

    ["G015", "streak",
     "streak,يومي,سلسلة,نار,🔥,كل يوم",
     "الـ Streak بيتحسب لما تعمل تاسك كل يوم.\nالـ Streak بيظهر في الداشبورد.\nحاول تعمل تاسك كل يوم عشان تحافظ على الـ Streak!",
     "إزاي أكسب توكينز؟",
     new Date()],
  ];

  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
    sheet.autoResizeColumns(1, headers.length);
  }

  Logger.log("Guide sheet setup complete! " + data.length + " entries added.");
  return "Done! " + data.length + " entries added to GuideKB sheet.";
}
