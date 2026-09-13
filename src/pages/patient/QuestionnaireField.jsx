import { useState } from "react";
import { Mic, Square, Plus, X, Loader2 } from "lucide-react";
import { translateFieldLabel, translateOptionLabel } from "../../data/questionBank";
import { UI_TEXT } from "../../data/patientUiText";

// Renders one field definition (plus any nested conditional/followup fields
// it triggers) and reports its value back via onChange(fieldId, value).
// `values` is the full answers map for the current node so nested fields can
// read their trigger's current value.
export default function QuestionnaireField({
  field,
  keyPrefix,
  lang,
  values,
  onChange,
  onTranscribe,
  depth = 0,
}) {
  const label = translateFieldLabel(keyPrefix, field, lang);
  const value = values[field.field_id];

  return (
    <div className={depth > 0 ? "mt-2.5 ml-4 border-l-2 border-emerald-200 pl-3.5" : ""}>
      <label className="block text-sm font-bold text-slate-800 mb-1.5">{label}</label>
      <FieldInput
        field={field}
        keyPrefix={keyPrefix}
        lang={lang}
        value={value}
        onChange={(v) => onChange(field.field_id, v)}
        onTranscribe={onTranscribe}
      />

      {/* yes_no_with_followup nested field */}
      {field.type === "yes_no_with_followup" && value === "yes" && field.followup_if_yes && (
        <QuestionnaireField
          field={field.followup_if_yes}
          keyPrefix={keyPrefix}
          lang={lang}
          values={values}
          onChange={onChange}
          onTranscribe={onTranscribe}
          depth={depth + 1}
        />
      )}
      {field.type === "yes_no_with_followup" && value === "no" && field.followup_if_no && (
        <QuestionnaireField
          field={field.followup_if_no}
          keyPrefix={keyPrefix}
          lang={lang}
          values={values}
          onChange={onChange}
          onTranscribe={onTranscribe}
          depth={depth + 1}
        />
      )}

      {/* conditional_followups: triggered by a specific selected option */}
      {(field.conditional_followups || []).map((cf) => {
        const selected = Array.isArray(value) ? value.includes(cf.trigger_option) : value === cf.trigger_option;
        if (!selected) return null;
        return (
          <QuestionnaireField
            key={cf.followup.field_id}
            field={cf.followup}
            keyPrefix={keyPrefix}
            lang={lang}
            values={values}
            onChange={onChange}
            onTranscribe={onTranscribe}
            depth={depth + 1}
          />
        );
      })}
    </div>
  );
}

function FieldInput({ field, keyPrefix, lang, value, onChange, onTranscribe }) {
  switch (field.type) {
    case "single_select":
      return <SingleSelect field={field} keyPrefix={keyPrefix} lang={lang} value={value} onChange={onChange} />;
    case "multi_select":
      return <MultiSelect field={field} keyPrefix={keyPrefix} lang={lang} value={value} onChange={onChange} />;
    case "multi_select_with_add":
      return (
        <MultiSelect field={field} keyPrefix={keyPrefix} lang={lang} value={value} onChange={onChange} allowAdd />
      );
    case "yes_no":
    case "yes_no_with_followup":
      return <YesNo value={value} onChange={onChange} />;
    case "scale_1_10":
      return <Scale value={value} onChange={onChange} />;
    case "free_text_or_voice":
      return <FreeTextOrVoice lang={lang} value={value} onChange={onChange} onTranscribe={onTranscribe} />;
    default:
      return null;
  }
}

function SingleSelect({ field, keyPrefix, lang, value, onChange }) {
  const t = UI_TEXT[lang || "en"];
  const [customText, setCustomText] = useState("");
  const selectedOption = field.options.find((o) => o.id === value);
  const showCustomInput = selectedOption?.triggers_free_text_or_voice;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-2">
        {field.options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                isSelected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
              }`}
            >
              {translateOptionLabel(keyPrefix, field, opt, lang)}
            </button>
          );
        })}
      </div>
      {showCustomInput && (
        <input
          type="text"
          value={customText}
          onChange={(e) => {
            setCustomText(e.target.value);
            onChange(e.target.value || selectedOption.id);
          }}
          placeholder={t.qDescribe}
          className="input input-sm w-full bg-slate-50 border-slate-300 text-xs rounded-lg mt-1"
        />
      )}
    </div>
  );
}

function MultiSelect({ field, keyPrefix, lang, value, onChange, allowAdd }) {
  const [customEntry, setCustomEntry] = useState("");
  const selected = Array.isArray(value) ? value : [];

  function toggle(optId) {
    if (selected.includes(optId)) {
      onChange(selected.filter((v) => v !== optId));
    } else {
      onChange([...selected, optId]);
    }
  }

  function addCustom() {
    const text = customEntry.trim();
    if (!text) return;
    onChange([...selected, text]);
    setCustomEntry("");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {field.options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                isSelected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
              }`}
            >
              {translateOptionLabel(keyPrefix, field, opt, lang)}
            </button>
          );
        })}
        {selected
          .filter((v) => !field.options.some((o) => o.id === v))
          .map((custom) => (
            <span
              key={custom}
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"
            >
              {custom}
              <button type="button" onClick={() => onChange(selected.filter((v) => v !== custom))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
      </div>
      {allowAdd && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customEntry}
            onChange={(e) => setCustomEntry(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            placeholder="Add another (not in list above)..."
            className="input input-sm flex-1 bg-slate-50 border-slate-300 text-xs rounded-lg"
          />
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      )}
    </div>
  );
}

function YesNo({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {["yes", "no"].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-xl border px-5 py-2 text-xs sm:text-sm font-bold capitalize transition-all ${
            value === opt
              ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
              : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Scale({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
            value === n
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-emerald-50"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function FreeTextOrVoice({ lang, value, onChange, onTranscribe }) {
  const t = UI_TEXT[lang || "en"];
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  async function startRecording() {
    if (!onTranscribe) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        try {
          const transcript = await onTranscribe(blob);
          onChange(value ? `${value} ${transcript}` : transcript);
        } catch {
          // Voice unavailable - patient can still type.
        } finally {
          setIsTranscribing(false);
        }
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  }

  function stopRecording() {
    mediaRecorder?.stop();
    setIsRecording(false);
    setIsTranscribing(true);
  }

  return (
    <div className="space-y-1.5">
      <textarea
        rows={2}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.qTypeOrSpeak}
        className="textarea textarea-bordered w-full text-xs sm:text-sm bg-slate-50 border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600"
      />
      {onTranscribe && (
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            isRecording
              ? "bg-rose-600 text-white animate-pulse"
              : isTranscribing
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          {isRecording ? (
            <Square className="h-3.5 w-3.5" />
          ) : isTranscribing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Mic className="h-3.5 w-3.5" />
          )}
          {isTranscribing ? t.qTranscribing : isRecording ? t.qStop : t.qSpeakAnswer}
        </button>
      )}
    </div>
  );
}
