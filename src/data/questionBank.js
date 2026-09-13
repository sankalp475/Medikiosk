// Local, translated copy of the backend's question bank, used only to RENDER
// whatever node the backend hands back (see MediKiosk_Implementation_Plan_v3.md,
// Section 4). This file never decides branching - the backend is authoritative
// for that; this just knows how to display a given node_id in the patient's
// chosen language.
import bankData from "./questionBankData.json";
import translations from "./translated.json";

const NODES = bankData.nodes;

export function getNodeDef(nodeId) {
  return NODES[nodeId];
}

// The field list a patient-facing node actually shows.
// - Normal nodes: nodeDef.fields
// - DEPARTMENT_MODULE: nodeDef.modules[resolvedModule].fields
export function getBaseFields(nodeDef, resolvedModule) {
  if (nodeDef?.modules) {
    return nodeDef.modules[resolvedModule]?.fields || [];
  }
  return nodeDef?.fields || [];
}

// Extra field definitions injected by on_complete.rules (e.g. MEDICATIONS' LMP
// overlay), matched against the append_fields id list the backend returned.
export function getAppendFieldDefs(nodeDef, appendFieldIds) {
  if (!appendFieldIds || appendFieldIds.length === 0) return [];
  const rules = nodeDef?.on_complete?.rules || [];
  const defs = [];
  for (const rule of rules) {
    if (rule.action === "append_fields") {
      for (const f of rule.append || []) {
        if (appendFieldIds.includes(f.field_id)) defs.push(f);
      }
    }
  }
  return defs;
}

// The translation-key prefix for a field depends on where it lives:
// - plain node field:      "{nodeId}"
// - DEPARTMENT_MODULE sub: "{nodeId}.{resolvedModule}"
// - appended (LMP, etc.):  "{nodeId}.append"
export function fieldKeyPrefix(nodeId, { resolvedModule, isAppended } = {}) {
  if (isAppended) return `${nodeId}.append`;
  if (resolvedModule) return `${nodeId}.${resolvedModule}`;
  return nodeId;
}

function lookup(key, lang, fallback) {
  const entry = translations[key];
  if (!entry) return fallback;
  return entry[lang] || entry.en || fallback;
}

export function translateTitle(nodeId, lang, fallback) {
  return lookup(`${nodeId}.title`, lang, fallback);
}

export function translateFieldLabel(keyPrefix, field, lang) {
  return lookup(`${keyPrefix}.${field.field_id}.label`, lang, field.label_en);
}

export function translateOptionLabel(keyPrefix, field, option, lang) {
  return lookup(`${keyPrefix}.${field.field_id}.option.${option.id}`, lang, option.label_en);
}
