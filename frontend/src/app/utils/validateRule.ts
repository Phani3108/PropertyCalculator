import type { RuleJson } from './ruleLoader';

// Lightweight runtime validation against a subset of schema keys
export function validateRule(rule: any): rule is RuleJson {
  if (!rule || typeof rule !== 'object') return false;
  const required = ['region','property_types','stamp_duty','registration_fee','gst_applicable','loan','last_verified','source','updated_by'];
  for (const k of required) {
    if (!(k in rule)) return false;
  }
  if (!Array.isArray(rule.property_types) || typeof rule.stamp_duty !== 'number' || typeof rule.registration_fee !== 'number') return false;
  if (typeof rule.loan !== 'object' || rule.loan == null) return false;
  return true;
}

