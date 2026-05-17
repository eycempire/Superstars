# Superstars — Master Blueprint
### EYC Empire | Confidential

---

## 1. Project Overview

**Platform:** Superstars by EYC Empire
**Purpose:** Gamified English language competition platform for Arabic speakers
**Primary Device:** Mobile-first (students use mobile predominantly)
**Languages:** English (UI) + Arabic (Guide/Help system)
**Tech Stack:** GitHub (Frontend) → Vercel (Deploy) → Google Apps Script (Backend) → Google Sheets (Database)
**Config File:** `config.js` — single file containing Apps Script URL, Drive folder links, and all global constants

---

## 2. Token & Economy System

### 2.1 Token Value
| Metric | Value |
|--------|-------|
| 1 Golden Ticket | 3,000 tokens |
| Season subscription cost | 3 Golden Tickets |
| Free Trial duration | 14 days (all activities unlocked) |
| Season duration | 30 days |
| Tasks per activity per season | 10 tasks |

### 2.2 Token Distribution Per Activity

| Activity | Type | Tokens/Task | 10 Tasks Total |
|----------|------|-------------|----------------|
| Grammar | Free (full) | 40 | 400 |
| Alike | Free (full) | 40 | 400 |
| Label | Free (full) | 40 | 400 |
| Golden Ear | Free (full) | 50 | 500 |
| Figurative | Free (full) | 50 | 500 |
| Sing Sang Sung | Free (full) | 60 | 600 |
| Seeds | Free (task 1 only) | 60 | 600 |
| Vivid | Free (task 1 only) | 60 | 600 |
| Dictation | Free (task 1 only) | 70 | 700 |
| El-Magazine | Free (task 1 only) | 70 | 700 |
| Grammar X | Paid (full locked) | 60 | 600 |
| Alike X | Paid (full locked) | 60 | 600 |
| Label X | Paid (full locked) | 60 | 600 |
| Golden Ear X | Paid (full locked) | 70 | 700 |
| Figurative X | Paid (full locked) | 70 | 700 |
| Seeds X | Paid (full locked) | 80 | 800 |
| Vivid X | Paid (full locked) | 80 | 800 |
| Dictation X | Paid (full locked) | 90 | 900 |
| El-Magazine X | Paid (full locked) | 90 | 900 |
| Sing Sang Sung X | Paid (full locked) | 100 | 1,000 |

### 2.3 Expected Season Earnings

**Free Student (committed):**
- Grammar + Alike + Label + Golden Ear + Figurative + Sing Sang Sung (full) = 2,800
- Seeds(1) + Vivid(1) + Dictation(1) + El-Magazine(1) = 240
- **Total ≈ 3,040 tokens ≈ 1 Golden Ticket**

**Subscribed Student (committed):**
- All 20 activities × 10 tasks = ~13,800 base tokens
- + EXB (Dictation X + Social Media) ≈ ~3,000 bonus
- **Total ≈ 16,800 tokens ≈ 4-5 Golden Tickets**
- After spending 3 tickets on next season = 1-2 tickets remaining ✅

### 2.4 Milestone System
| Tokens Reached | Reward |
|----------------|--------|
| 3,000 | 1 Golden Ticket |
| 6,000 | 1 Golden Ticket |
| 9,000 | 1 Golden Ticket |
| 12,000 | 1 Golden Ticket |
| 15,000 | 1 Golden Ticket |

> Milestones are cumulative across all seasons (General Rank tokens).
> Season Rank tokens reset each season.

---

## 3. Ranking System

### 3.1 Two Ranks
| Rank Type | Description | Reset |
|-----------|-------------|-------|
| General Rank | All tokens ever earned | Never |
| Season Rank | Tokens earned in current season only | Each season |

### 3.2 Leaderboard Display
- Top students shown with avatar, name, token count, level badge
- Filter by: General / Season / Country
- Admin does not appear on leaderboard (but activity is recorded normally in Sheets)

---

## 4. Golden Tickets System

### 4.1 Earning Tickets
- Via Milestones (token thresholds)
- Via Season Rank rewards (end of season prizes)
- Via EXB system

### 4.2 Spending Tickets
| Item | Cost |
|------|------|
| Season Subscription (all locked activities) | 3 tickets |
| SSR — Superstars Reporter (full season) | 1 ticket |
| Individual locked activity (if no subscription) | 1 ticket |

### 4.3 Buying Tickets
- If student lacks tickets → Shop page → Vodafone Cash payment
- Price per ticket to be determined at launch

### 4.4 Subscription Rules
- Season subscription unlocks ALL locked activities for the full season
- SSR subscription is per season — expires at season end even if purchased mid-season
- Free Trial (first 14 days): all activities unlocked automatically, no tickets needed
- Tokens earned during Free Trial are added immediately (student is notified after each activity)

---

## 5. EXB — Extra Bonus System

### 5.1 Performance EXB (Dictation X only)
- Condition: Student scores above 90% accuracy
- Reward: Double the task tokens (e.g., score 50 tokens → earn 50 bonus = 100 total)

### 5.2 Social Media EXB (El-Magazine X + Sing Sang Sung X)
- Admin manually posts approved audio/video to Facebook page
- Admin manually enters likes/shares count in Sheets weekly
- System calculates tokens and sends Inbox notification
- Tokens added at end of season
- Token rate per like/share: to be defined at launch

### 5.3 El-Magazine EXB
- Admin determines bonus amount per accepted recording (within activity max)
- Added via Admin Panel bonus column

---

## 6. Activities — Full Specification

### General Rules (All Activities)
- Each activity has 10 tasks per season
- Tasks unlock on a schedule (1-2 days apart), automated
- Free activities unlock slower than paid activities
- Student can only attempt each task once per season IF score > 0
- If score = 0, student may retry
- Each activity has a Guide icon (Arabic + English toggle) embedded in iFrame
- Guide info pulled from activity-specific JS file
- All external assets (images/audio) stored in Google Drive:
  `/Data/[ActivityName]/[TaskNumber]/[AssetNumber]`
  Example: `/Data/Grammar/1/1.jpg`

---

### 6.1 Grammar
**Skill:** Grammar / Tenses
**Type:** Free (full)
**Tokens/Task:** 40

**Task Format:**
- 10 sentences each with 1 missing word
- 4 choices per sentence (1 correct, 3 wrong)
- Questions and choices displayed in random order each attempt

**Scoring:**
- 1 correct answer = 4 tokens
- Partial scoring allowed (e.g., 5 correct = 20 tokens)

**Correction:**
- Apps Script compares answers to correct answers stored in Sheet: `Grammar`
- Immediate result

---

### 6.2 Grammar X
**Skill:** Grammar / Text Analysis
**Type:** Paid (locked)
**Tokens/Task:** 60

**Task Format:**
- Student reads a text passage
- Required to extract specific items (e.g., 5 verbs, 5 adjectives, 1 sentence in past tense)
- 5 input boxes (one per required item)

**Scoring:**
- All-or-nothing per task (must get all 5 correct to earn tokens)
- Partial = 0 tokens

**Correction Rules:**
- Case insensitive (uppercase/lowercase ignored)
- Spelling must be exact (even 1 wrong letter = rejected)
- Correct answers stored in Sheet: `GrammarX` (all valid extractions from the text)

---

### 6.3 Alike
**Skill:** Homophones / Pronunciation
**Type:** Free (full)
**Tokens/Task:** 40

**Task Format:**
- 10 pairs of Arabic words shown
- Each pair are homophones in English (e.g., ليلة / فارس → night / knight)
- Student writes English word under each Arabic word
- 2 input boxes per pair = 20 inputs total

**Scoring:**
- 1 correct = 2 tokens (partial allowed)

**Correction Rules:**
- No spelling errors allowed
- Case insensitive
- Direct comparison with Sheet: `Alike`

---

### 6.4 Alike X
**Skill:** Listening / Homophones
**Type:** Paid (locked)
**Tokens/Task:** 60

**Task Format:**
- 10 audio clips, each containing a sentence
- Student can replay each clip (no pause/rewind)
- 4 choices shown: 3 words with similar pronunciation + 1 correct word used in sentence

**Scoring:**
- 1 correct = 6 tokens (partial allowed)

**Correction:**
- Direct comparison with Sheet: `AlikeX`
- Each question submitted individually
- If student exits mid-task, completed submissions are saved

---

### 6.5 Seeds
**Skill:** Creative Writing / Vocabulary
**Type:** Free (task 1 only), rest paid
**Tokens/Task:** 60

**Task Format:**
- 6 words shown (5 related to a theme + 1 outlier)
- Student writes a story using ALL 6 words
- Min: 120 words / Max: 250 words
- Word count enforced at submission (not in scoring)

**Scoring — Two Parts:**
- Part A (mandatory keywords): Each missing/misspelled keyword deducts from total. Repetition doesn't add points.
- Part B (content quality): Lexical diversity + connective words + sentence variety score
- Spelling/grammar errors tolerated (not penalized)

**AI Detection:**
- Blacklist of common AI phrases per task (stored in Sheet)
- Typing speed analysis (timestamp first/last character)
- If detected: task accepted, 0 tokens, warning issued
- 3 warnings = account suspended

**Correction:**
- Apps Script scoring formula
- Immediate result

---

### 6.6 Seeds X
**Skill:** Advanced Creative Writing
**Type:** Paid (locked)
**Tokens/Task:** 80

**Task Format:**
- 6 sentences shown (5 related to theme + 1 outlier)
- Student writes a story using ALL 6 sentences
- Min: 200 words / Max: 350 words

**Scoring:** Same two-part system as Seeds
**Spelling:** Tolerated (not penalized)
**AI Detection:** Same as Seeds

---

### 6.7 Vivid
**Skill:** Descriptive Writing / Vocabulary
**Type:** Free (task 1 only), rest paid
**Tokens/Task:** 60

**Task Format:**
- Image shown
- Student writes description of image details
- Min: 100 words / Max: 250 words

**Scoring:**
- Compared against keyword bank in Sheet: `Vivid`
- Percentage match determines token percentage earned
- Spelling tolerance: up to 2 wrong letters per word (still counts)

**AI Detection:** Same system as Seeds

---

### 6.8 Vivid X
**Skill:** Narrative Writing
**Type:** Paid (locked)
**Tokens/Task:** 80

**Task Format:**
- Frozen scene image shown
- Student writes what happened before OR after the scene (as specified)
- Min: 250 words / Max: 350 words

**Scoring:** Same as Vivid
**AI Detection:** Same as Seeds

---

### 6.9 Label
**Skill:** Vocabulary / Object Recognition
**Type:** Free (full)
**Tokens/Task:** 40

**Task Format:**
- 10 images of objects shown
- Student writes English name for each object
- 1 input box per image

**Scoring:**
- 1 correct = 4 tokens (partial allowed)

**Correction Rules:**
- No spelling errors (even derivatives must be spelled correctly)
- Case insensitive
- Multiple valid answers accepted (synonyms stored in Sheet: `Label`)
- Student may write multiple words per box (system checks all)
- Guide advises: one word is enough
- Guide available in Arabic (default) and English (toggle)

---

### 6.10 Label X
**Skill:** Grammar Error Detection
**Type:** Paid (locked)
**Tokens/Task:** 60

**Task Format:**
- 10 sentences, each with 1 grammar error
- Displayed one at a time as slides
- Student taps the incorrect word in the sentence, then types the correction
- Each slide auto-submits after 15 seconds if no answer
- Countdown timer shown once before task starts

**Scoring — Two Parts:**
- Part A (identifying wrong word): 50% of question tokens
- Part B (correct fix): remaining 50%
- Student earns Part A even if Part B is wrong
- No spelling errors allowed in correction

**Time Flow:**
- General countdown shown before task starts
- Each slide: 1 second delay → 15-second timer begins
- Auto-submit = wrong answer if no response

**Correction:**
- Stored in Sheet: `LabelX`
- Immediate per slide

---

### 6.11 Golden Ear
**Skill:** Listening Comprehension
**Type:** Free (full)
**Tokens/Task:** 50

**Task Format:**
- 1 audio clip (student can play/pause/rewind freely)
- 10 questions below the audio player
- 4 choices per question

**Scoring:**
- 1 correct = 5 tokens (partial allowed)

**Correction:**
- Direct comparison with Sheet: `GoldenEar`
- Immediate result

---

### 6.12 Golden Ear X
**Skill:** Advanced Listening / Summarization
**Type:** Paid (locked)
**Tokens/Task:** 70

**Task Format:**
- 4 audio clips on same topic
- Each clip plays ONCE only (no pause/rewind/replay)
- Student writes 3-sentence summary per clip
- 3 separate input boxes per clip = 12 inputs total

**Scoring:**
- Keyword bank per clip in Sheet: `GoldenEarX`
- If keyword count in student's 3 sentences is below minimum → 0 for that clip
- Spelling tolerance: up to 2 wrong letters per keyword
- AI detection + content presence check applied

---

### 6.13 Figurative
**Skill:** Figurative Language / Idioms
**Type:** Free (full)
**Tokens/Task:** 50

**Task Format:**
- 10 dialogues shown (4 lines each, 2 characters)
- One highlighted figurative expression in each dialogue
- Student writes an English sentence conveying the same meaning

**Scoring:**
- Target word check: if any word from the dialogue's keyword dictionary appears in student's sentence in correct meaning context → accepted
- At least 1 target keyword required

**Correction:**
- Sheet: `Figurative`
- Immediate result

---

### 6.14 Figurative X
**Skill:** Listening / Figurative Language
**Type:** Paid (locked)
**Tokens/Task:** 70

**Task Format:**
- 10 audio dialogues
- Each plays ONCE only (no pause/rewind/replay)
- 4 multiple choice answers = meaning of the figurative expression used
- Each question submitted individually

**Scoring:**
- Direct comparison
- If student exits mid-task → completed submissions saved, can resume remaining

**Correction:**
- Sheet: `FigurativeX`
- Immediate result

---

### 6.15 Sing Sang Sung
**Skill:** Translation / Music
**Type:** Free (full)
**Tokens/Task:** 60

**Task Format:**
- Arabic song excerpt shown (text only)
- Student translates to English
- Min: 100 words
- No maximum word count

**Scoring:**
- Part A: keyword bank match percentage → determines acceptance threshold
- Part B: match percentage → determines token percentage
- Spelling tolerance: percentage-based
- Grammar tolerance: percentage-based
- AI detection applied

**Result:** Not immediate → Inbox notification (processing may take time)

---

### 6.16 Sing Sang Sung X
**Skill:** Singing / Pronunciation / Rhythm
**Type:** Paid (locked)
**Tokens/Task:** 100

**Task Format:**
- English song excerpt shown with lyrics
- Audio clip of the excerpt played
- Student records themselves singing the same excerpt with same rhythm/style
- Uploads audio file

**Consent:** Mandatory checkbox before submission:
*"This recording will be published on social media as part of the EXB Social Media program."*
Consent recorded in Sheet.

**Scoring:** Admin reviews and approves/rejects
**EXB:** Social Media system (likes/shares → tokens, added end of season)
**Result:** Not immediate → Inbox notification

**Audio Storage:** Google Drive folder linked in `config.js`

---

### 6.17 Dictation
**Skill:** Listening / Writing by hand
**Type:** Free (task 1 only), rest paid
**Tokens/Task:** 70

**Task Format:**
- 1 audio clip
- Student can PAUSE only (no rewind/fast-forward)
- Student writes what they hear by hand on paper
- Takes a clear photo and uploads it (camera or gallery)

**Scoring Process:**
1. Photo stored in Google Drive: `config.js` folder link
2. Google Vision API (called from Apps Script) performs OCR
3. OCR text sent to Apps Script
4. Apps Script compares with original text in Sheet: `Dictation`
5. If accepted percentage met → calculate token percentage → send Inbox notification
6. If rejected → Inbox notification with reason (unclear photo / bad handwriting / strikethrough)
7. Student may retry rejected tasks

**Result:** Not immediate → Inbox notification

---

### 6.18 Dictation X
**Skill:** Advanced Listening / Writing by hand
**Type:** Paid (locked)
**Tokens/Task:** 90

**Task Format:**
- 4 audio clips (same topic)
- Each clip: NO pause, NO rewind, NO fast-forward, plays ONCE
- Student writes all 4 parts by hand, photographs, uploads

**Scoring:** Same as Dictation
**EXB:** If accuracy > 90% → bonus tokens equal to task tokens (double)
**Result:** Not immediate → Inbox notification

---

### 6.19 El-Magazine
**Skill:** Reading Aloud / Pronunciation
**Type:** Free (task 1 only), rest paid
**Tokens/Task:** 70

**Task Format:**
- Text passage shown
- Student reads and records their voice reading the passage
- Uploads audio file

**Scoring:** Admin listens and approves/rejects
**EXB:** Admin sets bonus amount (within activity maximum) at time of approval
**Result:** Not immediate → Inbox notification

**Audio Storage:** Google Drive: `config.js` folder link

---

### 6.20 El-Magazine X
**Skill:** Reading Aloud / Social Media
**Type:** Paid (locked)
**Tokens/Task:** 90

**Task Format:** Same as El-Magazine

**EXB:** Social Media system
- Admin posts accepted recording to Facebook page
- Tokens earned per like/share (rate defined at launch)
- Added end of season → Inbox notification

---

## 7. Universal Correction Principles

| Principle | Activities Applied |
|-----------|-------------------|
| Case insensitive | All activities |
| No spelling errors (strict) | Grammar X, Label, Label X, Alike, Figurative X |
| Spelling tolerance (2 letters) | Vivid, Vivid X, Golden Ear X |
| Spelling tolerance (percentage) | Seeds, Seeds X, Sing Sang Sung |
| Grammar tolerance (percentage) | Sing Sang Sung |
| Partial scoring | Grammar, Alike, Label, Golden Ear, Figurative |
| All-or-nothing | Grammar X (per task) |
| Two-part scoring | Label X, Seeds, Seeds X |
| AI detection | Seeds, Seeds X, Vivid, Vivid X, Golden Ear X, Sing Sang Sung |
| Content presence check | Seeds, Seeds X, Vivid, Vivid X |
| Typing speed analysis | Seeds, Seeds X, Vivid, Vivid X |
| Not immediate result | Dictation, Dictation X, El-Magazine, El-Magazine X, Sing Sang Sung X |
| Consent checkbox | Sing Sang Sung X |

### AI Detection System
1. **Blacklist check:** Common AI phrases per task (stored in Sheet per activity)
2. **Typing speed:** Timestamp first keystroke vs last keystroke — superhuman speed = flagged
3. **Action:** Task accepted + 0 tokens + warning in Inbox
4. **3 warnings = account suspended**

---

## 8. Appeal (Grievance) System

### Student Side
- Appeal button available after each task result
- Student submits appeal → recorded in Sheet: `Appeals`
- Appeal has a reference number

### Admin Side
- Admin Panel shows all pending appeals
- Admin reviews Reports Sheet for full correction details
- Admin responds:
  - **Reject:** "Correction is accurate" + reason
  - **Accept:** "Technical error" + add bonus tokens via Bonus Column

### Bonus Column Rules
- Any manual token addition must go through Bonus Column first
- Bonus Column auto-resets after adding
- Same student cannot receive another bonus for 30 seconds
- Student receives Inbox notification:
  *"[X] tokens have been added to your account in response to appeal #[ref] regarding task #[task]. Reason: Technical error."*

---

## 9. SSR — Superstars Reporter

**Description:** Premium service giving students access to detailed correction reports after each task

**Cost:** 1 Golden Ticket per season
**Duration:** Full season (expires at season end even if purchased mid-season)

**Features:**
- After each task: "View Report" button
- Report shows: student answers, correct answers, explanation of errors
- All report data stored in Sheet: `Reports`

**If not subscribed:**
- Button shows message: "You are not subscribed to SSR. Subscribe now."
- Link to Shop page

---

## 10. Google Sheets Structure

| Sheet Name | Purpose |
|------------|---------|
| Students | Student profiles, tokens, tickets, subscription status, trial status |
| Grammar | Correct answers for Grammar tasks |
| GrammarX | Valid extractions for Grammar X tasks |
| Alike | Correct answers for Alike tasks |
| AlikeX | Correct answers for Alike X tasks |
| Seeds | Keyword banks + AI blacklists for Seeds tasks |
| SeedsX | Keyword banks + AI blacklists for Seeds X tasks |
| Vivid | Keyword banks + AI blacklists for Vivid tasks |
| VividX | Keyword banks + AI blacklists for Vivid X tasks |
| Label | Correct answers + synonyms for Label tasks |
| LabelX | Correct answers for Label X tasks |
| GoldenEar | Correct answers for Golden Ear tasks |
| GoldenEarX | Keyword banks for Golden Ear X tasks |
| Figurative | Keyword dictionaries for Figurative tasks |
| FigurativeX | Correct answers for Figurative X tasks |
| SingSangSung | Keyword banks for Sing Sang Sung tasks |
| SingSangSungX | Audio file references + consent records |
| Dictation | Original texts for Dictation tasks |
| DictationX | Original texts for Dictation X tasks |
| ElMagazine | Text passages + audio file references |
| ElMagazineX | Text passages + audio file references |
| Reports | Full correction log per task per student |
| Appeals | All student appeals + admin responses |
| Inbox | All notifications per student |
| Tasks | Task schedule (unlock dates/times per activity) |
| Seasons | Season dates, active season, leaderboard snapshots |
| SocialMedia | Likes/shares data for EXB social media |
| Bonus | Bonus column for manual token additions |
| AdminLog | All admin actions logged |

---

## 11. Pages Structure

### 11.1 Public Pages
| Page | Description |
|------|-------------|
| Landing Page | Hero, preview question, top 3 leaderboard, CTA |
| Sign Up | Google email, name, age, photo (pending approval), auto-generated code + passkey |
| Login | Code + passkey / forgot → email |

### 11.2 Student Pages
| Page | Description |
|------|-------------|
| Dashboard | Activity grid, tokens, rank, season badge, Inbox, Profile, SSR status |
| Activity Page | iFrame with task + Guide icon |
| Leaderboard | General rank + Season rank + filters |
| Shop | Buy Golden Tickets (Vodafone Cash) + spend tickets |

### 11.3 Admin Pages
| Page | Description |
|------|-------------|
| Admin Panel | Full control: appeals, photo approvals, manual bonuses, social media EXB, all activity links, student management |

### 11.4 Dashboard Sections (embedded, not separate pages)
- Profile (name, photo, level, tokens, tickets)
- Inbox (notifications, appeal responses)
- SSR subscription status
- Season badge + progress

---

## 12. Student Profile & Authentication

### Registration Data
| Field | Notes |
|-------|-------|
| Full name | Required |
| Age | Required |
| Google email | Used for login recovery |
| Profile photo | Requires admin approval before display |
| Auto-generated code | Sent after signup — used for login |
| Passkey | Sent after signup — used for login |

### Authentication
- Login: Code + Passkey
- Forgot credentials: email recovery (branded email matching site theme)
- Student data stored in LocalStorage after login

### Photo Approval
- New photo → pending status → Admin Panel approval button
- Rejected photos → default avatar shown

---

## 13. Admin Panel Features

- Master key access (bypasses all restrictions on all pages)
- All activities unlocked for admin
- Admin activity recorded in Sheets normally (excluded from leaderboard)
- Photo approval queue
- Appeal management (view, respond, add bonus)
- Social media EXB data entry (likes/shares per student)
- Manual token bonus (via Bonus Column with 30-second cooldown)
- Links to all site pages
- Season management (start/end dates, active tasks)
- Student management (view, suspend, unsuspend)
- No need to access main Sheet directly

---

## 14. Notifications (Inbox)

All notifications sent to student Inbox inside Dashboard.

| Event | Message |
|-------|---------|
| Task score added | "Your score for [Activity] Task [#] has been added: [X] tokens" |
| AI detection warning | "Warning [1/2/3]: AI-generated content detected in [Activity] Task [#]. Score: 0 tokens." |
| Account suspended | "Your account has been suspended due to repeated AI detection violations." |
| Appeal response (accepted) | "[X] tokens added for appeal #[ref] for task #[task]. Reason: Technical error." |
| Appeal response (rejected) | "Appeal #[ref] for task #[task] has been reviewed. Correction is accurate." |
| Dictation rejected | "Task [#] rejected: [unclear photo / bad handwriting / strikethrough]. You may retry." |
| Milestone reached | "Congratulations! You've reached [X] tokens and earned 1 Golden Ticket!" |
| SSR expiry reminder | "Your SSR subscription expires at the end of this season." |
| Social Media EXB | "[X] tokens added from social media engagement on your [Activity] submission." |
| Free Trial reminder | "Your Free Trial score will be added at the end of the trial period." |

---

## 15. Task Schedule Logic

- Tasks stored in Sheet: `Tasks` with unlock datetime per activity per task
- Apps Script checks current datetime against unlock datetime
- Free activities: unlock every 2 days
- Paid activities: unlock every 1 day
- Locked task shows: lock icon + unlock date/time
- Paid activity (subscribed but locked by schedule): shows unlock date/time
- Paid activity (not subscribed): shows subscription prompt

---

## 16. Free Trial Rules

- Duration: 14 days from registration
- All activities unlocked (no subscription needed)
- Tokens earned: added immediately to account
- Student notified after each trial activity submission:
  *"Note: You are in Free Trial mode. Your tokens are being added normally. Trial ends on [date]."*
- After trial ends: only free activities remain accessible unless subscribed

---

## 17. config.js Structure

```javascript
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/...",
  DRIVE_FOLDERS: {
    DICTATION_UPLOADS: "https://drive.google.com/...",
    ELMAGAZINE_UPLOADS: "https://drive.google.com/...",
    DATA_ROOT: "https://drive.google.com/..."
  },
  SEASON: {
    NUMBER: 1,
    START_DATE: "2025-01-01",
    END_DATE: "2025-01-31"
  },
  TOKENS_PER_TICKET: 3000,
  TRIAL_DAYS: 14,
  SUBSCRIPTION_COST_TICKETS: 3,
  SSR_COST_TICKETS: 1
};
```

---

## 18. Drive Folder Structure

```
/Data/
  /Grammar/
    /1/ → (no assets — text only in Sheet)
  /GrammarX/
    /1/ → text passages (if needed)
  /Vivid/
    /1/ → 1.jpg, 2.jpg ...
  /VividX/
    /1/ → 1.jpg
  /GoldenEar/
    /1/ → 1.mp3
  /GoldenEarX/
    /1/ → 1.mp3, 2.mp3, 3.mp3, 4.mp3
  /Figurative/
    /1/ → (text only)
  /FigurativeX/
    /1/ → 1.mp3 ... 10.mp3
  /Alike/
    /1/ → (text only)
  /AlikeX/
    /1/ → 1.mp3 ... 10.mp3
  /Label/
    /1/ → 1.jpg ... 10.jpg
  /LabelX/
    /1/ → (text only)
  /Seeds/
    /1/ → (text only)
  /SeedsX/
    /1/ → (text only)
  /SingSangSung/
    /1/ → (text only — Arabic lyrics)
  /SingSangSungX/
    /1/ → 1.mp3 (song excerpt)
  /Dictation/
    /1/ → 1.mp3
  /DictationX/
    /1/ → 1.mp3, 2.mp3, 3.mp3, 4.mp3
  /ElMagazine/
    /1/ → (text only)
  /ElMagazineX/
    /1/ → (text only)

/Uploads/
  /Dictation/ → student photo uploads
  /DictationX/ → student photo uploads
  /ElMagazine/ → student audio uploads
  /ElMagazineX/ → student audio uploads
  /SingSangSungX/ → student audio uploads
  /ProfilePhotos/ → pending approval photos
```

---

*Document Version: 1.0 | EYC Empire — Superstars Project*
*All specifications subject to review before development begins.*
