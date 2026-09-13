import { useMemo, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  getNodeDef,
  getBaseFields,
  getAppendFieldDefs,
  fieldKeyPrefix,
  translateTitle,
} from "../../data/questionBank";
import { UI_TEXT } from "../../data/patientUiText";
import QuestionnaireField from "./QuestionnaireField";
import BusyLabel from "../../components/BusyLabel";

// Renders every field for the current node (base fields + any backend-injected
// append fields, e.g. the LMP overlay) and collects them into the
// {field_id, value, input_mode} shape the backend's submit_answer expects.
export default function QuestionnaireStep({
  nodeId,
  resolvedModule,
  appendFields,
  lang,
  onSubmit,
  onBack,
  onTranscribe,
  isSubmitting,
}) {
  const t = UI_TEXT[lang || "en"];
  const nodeDef = getNodeDef(nodeId);
  const [values, setValues] = useState({});
  const [inputModes, setInputModes] = useState({});
  const [error, setError] = useState("");

  const fieldGroups = useMemo(() => {
    const base = getBaseFields(nodeDef, resolvedModule).map((field) => ({
      field,
      keyPrefix: fieldKeyPrefix(nodeId, { resolvedModule }),
    }));
    const appended = getAppendFieldDefs(nodeDef, appendFields).map((field) => ({
      field,
      keyPrefix: fieldKeyPrefix(nodeId, { isAppended: true }),
    }));
    return [...base, ...appended];
  }, [nodeDef, resolvedModule, appendFields, nodeId]);

  if (!nodeDef) {
    return (
      <div className="text-center text-sm text-rose-700 font-semibold py-8">
        Unknown questionnaire step ({nodeId}). Please contact staff for assistance.
      </div>
    );
  }

  function handleChange(fieldId, value, inputMode = "tap") {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setInputModes((prev) => ({ ...prev, [fieldId]: inputMode }));
    setError("");
  }

  async function handleTranscribe(fieldId, blob) {
    if (!onTranscribe) throw new Error("Voice input unavailable");
    const transcript = await onTranscribe(blob, lang);
    setInputModes((prev) => ({ ...prev, [fieldId]: "voice" }));
    return transcript;
  }

  function handleSubmit() {
    // Only fields actually rendered top-level need an answer - nested
    // conditional fields validate themselves as they appear, since a value
    // for them only exists once their trigger fires.
    const missing = fieldGroups.filter(({ field }) => {
      const v = values[field.field_id];
      if (Array.isArray(v)) return v.length === 0;
      if (typeof v === "string") return v.trim() === "";
      return v === undefined || v === null;
    });
    if (missing.length > 0) {
      setError(t.qMissingAnswer);
      return;
    }

    const answers = Object.entries(values)
      .filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
      .map(([field_id, value]) => ({
        field_id,
        value,
        input_mode: inputModes[field_id] || "tap",
      }));

    onSubmit(answers);
  }

  return (
    <div className="w-full space-y-4">
      <div className="text-center pb-0.5">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {translateTitle(nodeId, lang, nodeDef.title_en)}
        </h2>
      </div>

      <div className="space-y-4">
        {fieldGroups.map(({ field, keyPrefix }) => (
          <QuestionnaireField
            key={field.field_id}
            field={field}
            keyPrefix={keyPrefix}
            lang={lang}
            values={values}
            onChange={(fieldId, value) => handleChange(fieldId, value)}
            onTranscribe={onTranscribe ? (blob) => handleTranscribe(field.field_id, blob) : undefined}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs sm:text-sm font-bold text-rose-800">
          {error}
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t.backBtn}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors disabled:opacity-60"
        >
          <span>
            <BusyLabel busy={isSubmitting} messages={t.busyAnswer} idleLabel={t.qContinueBtn} />
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
