// خداشهر — the correction chip: every task/list/writing/directive/project
// shows its sahat and lets the owner reassign it in place. The stored value
// always wins on the backend (POST /api/sahat/assign), so a correction here
// is final and flows into the map/districts immediately.
//
// Renders as a small colored chip; clicking opens a native <select> (reliable,
// keyboard-friendly, no portal). `source === 'auto'` gets a subtle dashed
// border — an honest «این حدسِ ماشین است، نه حکمِ تو».
import React, { useState } from 'react';
import api from '../lib/api';
import { SAHAT_META, SAHAT_KEYS } from '../lib/sahat';

function SahatChip({ entityType, entityId, sahat, source, onChanged }) {
  const [value, setValue] = useState(sahat || '');
  const [owned, setOwned] = useState(source === 'owner');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const meta = SAHAT_META[value] || null;

  const save = async (next) => {
    if (!next || next === value) { setEditing(false); return; }
    setBusy(true);
    try {
      await api.post('/sahat/assign', {
        entity_type: entityType, entity_id: entityId, sahat: next,
      });
      setValue(next);
      setOwned(true);
      if (onChanged) onChanged(next);
    } catch { /* keep the old value — best-effort */ } finally {
      setBusy(false);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <select
        autoFocus
        value={value}
        disabled={busy}
        onChange={(e) => save(e.target.value)}
        onBlur={() => setEditing(false)}
        className="rounded-md border border-gray-300 bg-white px-1 py-0.5 text-[11px] text-gray-700"
        data-testid={`sahat-chip-select-${entityType}-${entityId}`}
      >
        {SAHAT_KEYS.map((k) => (
          <option key={k} value={k}>{SAHAT_META[k].icon} {SAHAT_META[k].fa}</option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true); }}
      title={meta ? `ساحت: ${meta.fa}${owned ? '' : ' (حدسِ خودکار — برای اصلاح کلیک کن)'}` : 'تعیین ساحت'}
      data-testid={`sahat-chip-${entityType}-${entityId}`}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80 ${
        meta ? meta.chip : 'bg-gray-50 text-gray-500 border-gray-200'
      } ${owned ? '' : 'border-dashed'}`}
    >
      <span>{meta ? meta.icon : '·'}</span>
      <span>{meta ? meta.short : 'ساحت'}</span>
    </button>
  );
}

export default SahatChip;
