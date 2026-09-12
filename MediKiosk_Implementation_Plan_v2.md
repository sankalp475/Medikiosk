# MediKiosk — Consolidated Implementation Plan (v2)
### SIH26047 — Patient Case-Taking Software (Ministry of AYUSH)

This supersedes the original `MediKiosk_Implementation_Plan.md` where the two conflict.
Anything marked **[OPEN]** is genuinely undecided — do not treat it as settled.

---

## 1. Scope — locked against the actual PS text

Source of truth for scope: `SIH26047_1_Complete_Text.docx` (the official PS), not just the team's
earlier pitch deck. Cross-checked against it directly.

**In scope, must build:**
- Adaptive intake that branches on chief complaint *and* prior answers (not a flat fixed question
  list) — see Section 4.
- Patient identification via ABHA ID or Guest/new registration at Step 1 (PS explicitly names this).
- Red-flag detection that surfaces as an unmissable, immediate marker on the doctor's queue (PS
  wording: "immediate priority alert to triage staff," stronger than a passive sort order).
- Multilingual voice + tap intake (English/Hindi/Malayalam) — this is the PS's core differentiator
  for accessibility, not optional.
- Doctor dashboard: queue (list) + AI-drafted summary with source evidence + edit/confirm before
  finalizing, never auto-saving AI output as fact.
- Admin: doctor + department management.

**Explicitly out of scope (with the reasoning to give judges if asked):**
- Real ABDM/ABHA/HIS/FHIR push to a live government registry — sandbox approval isn't achievable in
  this timeframe. Data is kept FHIR-*compatible in structure*; the connection itself is mocked.
- Sign-language avatar — the PS itself labels this a stretch goal.
- Full patient self-service portal (login+password, browse/manage records anytime) — PS mentions a
  "patient dashboard" for this; we support the lighter version (returning-patient lookup shows past
  visit summaries) but not a full separate account-management product surface.
- Abnormal-lab-value / drug-interaction flagging — needs a real pharmacology reference dataset to be
  trustworthy; roadmap item, not attempted until the core flow is solid.
- AYUSH sub-branches beyond Ayurveda (Yoga/Unani/Siddha/Homeopathy) — zero source content exists for
  these across every reference document provided; not selectable.
- SuperAdmin / multi-hospital tenancy, per-hospital language config UI, autonomous AI diagnosis —
  carried over unchanged from the original plan.

**[OPEN]** Should the AYUSH track be *labeled* "Ayurveda" specifically (my recommendation, to avoid
implying broader AYUSH coverage the app doesn't have), or kept as a generic "AYUSH" label? Never
explicitly confirmed.

---

## 2. Patient Identification

**Decided:**
- Two paths: **ABHA ID** (persistent identity, past-visit lookup) and **Guest** (one-time only, no
  persistence, no return lookup at all — not even via a token). **Aadhaar is out for now** — despite
  the PS naming it as a Step 1 alternative, only ABHA + Guest are implemented in this build.
- **No third persistent-identity fallback for now.** A name+DOB+phone path (for patients with neither
  ABHA nor Aadhaar on them who still want a retrievable record) is not implemented — ABHA/Guest remain
  the only two identification paths. Both of these can be revisited later if time permits.
- ABHA is **mocked**: the patient types an ABHA-shaped ID; there is no real call to UIDAI/ABDM to
  verify it. On first-time entry, a **hardcoded mock "ABHA fetch"** returns demo demographic data
  (name, age, sex) as if it came from the real registry; this is stored on the `Patient` record from
  then on (not re-fetched on later visits).
- **Sex/gender** is not asked as a question anywhere in the intake — for ABHA patients it comes from
  the mocked ABHA fetch; for **Guest patients it must be asked explicitly at registration**, since the
  questionnaire engine's routing (the LMP overlay, see Section 4) depends on it and there's no ABHA
  record to pull it from.
- **ABHA storage: hash, not reversible encryption.** Recommendation, given as decided based on your
  "either can be used" — reasoning: the only use of the stored value is equality-lookup ("does this
  input match an existing patient"); nothing in this system ever needs to recover the original raw
  ABHA number (real ABDM calls are mocked, never made). A one-way hash (SHA-256) is sufficient and
  has no key-management/key-loss risk that reversible encryption carries. Since a 14-digit numeric ID
  is a small, guessable space, add a single application-wide pepper (a secret string from `.env`,
  concatenated before hashing) — cheap, no rotation burden, meaningfully raises the bar over a plain
  hash.
- On first registration, generate and show the patient a **`patient_uuid`** (e.g. printed on their
  Smart Consultation Pass receipt) as a second, shorter way to look themselves up later. Returning
  visit: patient enters **either** their ABHA ID (hashed and compared) **or** their `patient_uuid`
  (matched directly) — both resolve to the same `Patient` row.

---

## 3. Auth / Login (Doctor + Admin)

**Decided / already matches existing code:**
- `Doctor` model already wraps Django's `User` via a `OneToOneField` (`doctor_profile`) — a doctor's
  login account is created by the Admin alongside the `Doctor` row, exactly as you described.
- Doctor login needs to additionally return a `role` field in its response (currently returns
  access/refresh tokens + `doctor_id` only) so the frontend can route correctly.

**Decided — resolves the (a)/(b) conflict below: option (b).**
- Admin and Doctor **share one custom-frontend login, redirected by role** — not Django's built-in
  `/admin/` panel. This supersedes the original plan's Admin-via-`/admin/`-only approach ("no custom
  UI needs to be built for this role"); an actual Admin-facing dashboard route now needs to be built,
  which the original plan had explicitly avoided to save build time.
- The attached `main.jsx`/`ProtectedRoute.jsx` pattern (unrelated bus-fleet app) is the structural
  reference for role-whitelisted routing + an axios-driven auth check — **adapted to MediKiosk's JWT
  access/refresh tokens (`simplejwt`)**, not copied as-is, since the reference's `ProtectedRoute` calls
  a `/verify-auth` endpoint and relies on a long-lived session concept that doesn't map directly onto
  token-based auth.

---

## 4. Questionnaire Engine

**Canonical data artifact:** `medikiosk_question_bank_v2.json` — a branching decision tree (not a flat
10-question list), covering: Red-Flag gate → Chief Complaint → History of Present Illness →
Department-specific module (Eyes/Ears/Nose/Skin/Heart/Lungs/Kidney/Digestion, each with nested
follow-ups triggered by specific symptom selections) → Allopathy/Ayurveda track fork (4 nodes each) →
shared Past History & Allergies → Medications (+ conditional LMP overlay for female patients aged
10–60). Full detail and the judgment calls already flagged and confirmed live in that file's own
`notes` field and inline `note` fields — treat that JSON as authoritative, this doc doesn't repeat it.

**Orchestration — decided:**
- **Backend is authoritative.** It holds the full bank (structure + branching rules + English
  reference text) and is the only thing that decides the next node — required for a defensible,
  server-side audit trail of exactly what was asked/answered (relevant to the PS's DPDP-Act/consent
  framing), and for resumability if a session drops mid-interview.
- **Frontend holds a parallel copy**, keyed by the identical `node_id`/`field_id`/`option_id`s,
  containing only pre-translated display text (en/hi/ml) — it never needs the branching rules, only
  renders whatever node the backend hands it.
- **One combined round trip per question**, not two: submitting an answer and receiving the next node
  happen in the same API call. This was always going to be one call anyway (every answer must reach
  the backend to be persisted, regardless of who decides what's next), so piggy-backing the "next
  node" decision onto it costs no extra latency.

**Runtime protocol (this is the actual "how to use it" pattern):**
1. On visit creation, backend sets `Visit.current_node = "RED_FLAG"`.
2. Frontend requests the current state once at intake start; backend returns a **minimal** payload —
   just `{node_id, resolved_module?, append_fields?}` — never the full field/option definitions, since
   the frontend already has those locally. (`resolved_module` = which department sub-module to show
   when `node_id` is `DEPARTMENT_MODULE`; `append_fields` = e.g. the LMP field when the conditional
   overlay applies.)
3. Frontend looks up that `node_id` (+ resolved_module/append_fields) in its own local translated bank
   copy and renders it in the patient's selected language.
4. Patient answers → frontend `POST`s `{node_id, answers}` → backend **re-validates against its own
   master bank** (never trusts frontend-submitted structure blindly), applies that node's
   `on_complete` rules (set concern flag, resolve department module, evaluate the LMP condition,
   etc.), persists the structured answer, computes the next node — and returns
   `{next_node, resolved_module?, append_fields?}` in the **same response**.
5. Repeat until `next_node == "END_OF_INTERVIEW"` → frontend transitions to the document-upload screen.

**Translation generation:** two companion artifacts were generated to produce the frontend's
translated copy safely (so the translation step can't accidentally corrupt ids/types/branching
logic):
- `medikiosk_translation_manifest_en.json` — every translatable string extracted into a flat,
  id-keyed list (304 strings), with all structural/logic fields stripped out entirely.
- `translation_generation_prompt.txt` — the exact prompt to pair with that manifest in an LLM chat to
  produce Hindi/Malayalam versions, with explicit rules against altering keys, against introducing
  unrequested Sanskrit/Ayurvedic terminology, and a "flag rather than guess" instruction for anything
  the translating model isn't confident about.
- **This translation must still go through a native Hindi/Malayalam speaker and, for Ayurveda content,
  an Ayurvedic practitioner, before use** — an LLM's first-pass translation of clinical content is a
  draft, not a ship-ready artifact. (Your own `MediKiosk_Dashavidha_Design_Notes_v1.pdf` already
  requires SME validation of every question before the demo — this extends that same requirement to
  the translated versions.)

**[OPEN]** `HISTORY_OF_PRESENT_ILLNESS`'s "have you taken treatment for this episode" overlaps with
`ALLOPATHY_TREATMENT_HISTORY`'s "have you consulted a doctor before" — flagged, not trimmed.

**[OPEN]** Several source-doc items were deliberately left out as low-diagnostic-value
(ear-cleaning habits, glasses/contact-lens history, per-organ family history) — asked if you want them
added back for completeness; not yet answered.

**[OPEN]** `TRANSLATION_ARCHITECTURE.md`'s Tier 3 proposes fully client-side STT (browser Web Speech
API) for *all three* languages, conflicting with the Implementation Plan's choice of Bhashini as
primary STT with Web Speech as an *English-only* fallback. Never resolved — this determines whether a
backend ASR proxy endpoint is even needed for Hindi/Malayalam.

**Outstanding, not a decision but a checklist item:** the question bank still needs sign-off from an
actual Ayurvedic practitioner/SME before being presented as clinically validated, per your own Design
Notes doc. No amount of engineering work substitutes for this.

---

## 5. AI Services — Primary + Fallback

| Capability | Primary | Fallback | Status |
|---|---|---|---|
| STT | Bhashini | **[OPEN]** — deferred by you ("tell you later") | Architecture (try-primary-then-fallback via `asr.py` orchestrator) agreed; provider choice pending |
| TTS | Bhashini | **[OPEN]** — deferred | See Section 6 — TTS usage pattern reduces how much this matters for the core flow |
| OCR | Tesseract (local, no network dependency) | **[OPEN]** — deferred (Gemini vision vs. separate HF OCR model both discussed, neither confirmed) | Architecture agreed |
| Summarizer | Gemini | **[OPEN]** — deferred (HF-hosted open instruct model discussed, not confirmed) | Architecture agreed |

No requirement that the summarizer specifically be an "Indian" model — that reasoning applies to
ASR/TTS language coverage (why Bhashini exists), not text summarization from already-transcribed text.

---

## 6. TTS Usage Pattern

Because the question bank is fixed and finite (not freely generated per patient), **pre-generate and
cache static TTS audio once per question × per language at build/seed time**, and serve those static
files at runtime — rather than calling a TTS API live for every patient on every question. The same
translated text used for on-screen display is the exact text fed to the TTS call once during seeding.

This removes TTS from the live per-patient network path entirely for the core questionnaire — a real
demo-reliability win, and it sidesteps most of the fallback-chain urgency for TTS specifically. The
live TTS fallback chain (Section 5) still matters for STT (which is inherently per-patient, can't be
pre-baked) and for any genuinely dynamic spoken content, if that's ever added.

---

## 7. Audio Handling (STT input)

Record client-side using the browser's `MediaRecorder` API directly in a compressed codec (e.g.
`audio/webm;codecs=opus`) rather than raw WAV — this compresses on the actual bandwidth-constrained leg
(patient's device → server over venue wifi), which is where compression actually matters.

**Decided — confirmed against the API.** Bhashini's ASR service accepts WAV mainly, not `opus`/`webm`
directly, so transcoding is required. The client-side recording stays compressed
(`audio/webm;codecs=opus`, as above) for the bandwidth-constrained device→server leg; the backend then
transcodes to 16kHz mono WAV **server-side, immediately before the Bhashini call** — that leg isn't
bandwidth-constrained, so it costs no user-facing latency.

Also keep individual clips short — already a stated demo-reliability tip in the original plan;
compression and short clip length both help, independently of each other.

---

## 8. Database

**Decided:** local Postgres as primary, for both development and the live demo — an AI-call network
dependency is unavoidable regardless, but a local DB avoids adding per-query hosted-latency on top of
that during a live audience-watching demo. Hosted free tier (Neon/Supabase) only for periodic shared
backups/dumps between teammates, never as the live runtime DB.

---

## 9. Doctor Dashboard

List of patients (today's queue, red-flagged ones visually unmissable at the top) on the left,
selected patient's expanded AI-drafted summary + source evidence + edit controls on the right — matches
the already-existing `DoctorQueueView`/`DoctorVisitDetailView` backend data shape. This is primarily a
frontend build task; no backend gap identified. Queue polls every 2 minutes plus a manual refresh
button.

**[OPEN]** Prescription: your dashboard needs "space for prescription" — is this a free-text field on
the visit, or a structured model (drug name / dosage / duration, individually listed and printable)?
Never answered; affects the data model.

---

## 10. Data Model Changes Needed (not yet implemented)

- `Patient.sex` — populated from mocked ABHA fetch, or asked directly during Guest registration.
- `Patient.abha_hash` (peppered SHA-256) replacing plaintext ABHA storage; `Patient.patient_uuid` as
  the alternate lookup key.
- `Visit.current_node` — replaces a flat step-number with a reference into the node graph.
- `Visit.questionnaire_answers` — restructured to `{node_id, field_id, value, input_mode,
  confidence_score}` per-entry shape (already agreed earlier), to correctly represent composite and
  multi-select questions.
- `Prescription` — structure **[OPEN]**, see Section 9.

---

## 11. Implementation Order

1. Section 3's auth architecture and Section 2's Aadhaar/name+DOB+phone questions are now resolved
   (see Sections 2–3) and no longer block real work. Remaining **[OPEN]** items (Section 1's AYUSH
   label, Section 4's content questions, Section 5's fallback providers, Section 9's prescription
   model) can be resolved in parallel as they come up.
2. Data model migrations (Section 10).
3. `dialogue_engine.py` — the node-graph orchestrator described in Section 4, against
   `medikiosk_question_bank_v2.json`.
4. Rewrite `patient_identify`/registration flow for ABHA-hash/Guest/UUID per Section 2 (no Aadhaar, no
   name+DOB+phone fallback).
5. Update `doctor_login` response to include `role`; build out Admin auth per Section 3's option (b) —
   shared custom-frontend login with role-based redirect.
6. AI fallback chain modules (`asr.py`, `tts.py`, OCR/summarizer second providers) — as soon as
   provider choices land.
7. TTS pre-generation/seeding script per Section 6.
8. Hand off to frontend: the question bank JSON, the translation manifest + generated hi/ml file (once
   translated and reviewed), and the runtime protocol in Section 4.
9. Doctor dashboard UI build (frontend).
10. SME review pass on question content and translations.
11. Local-DB demo rehearsal, including an offline-fallback run-through (Ollama + local Postgres) to
    rule out a wifi failure sinking the live demo.

---

## Appendix: Companion Files

- `medikiosk_question_bank_v2.json` — canonical question/decision-tree bank.
- `medikiosk_translation_manifest_en.json` — flat extracted strings for translation.
- `translation_generation_prompt.txt` — prompt to produce the hi/ml translated version from the
  manifest above.
