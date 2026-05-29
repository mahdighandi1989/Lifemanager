import React, { useState } from 'react';
import api from '../../lib/api';

// DeduplicationPanel (audit task fbd9bd36 AC4): scan for similar Task/Project/
// List groups and merge a selected entity into another of its group (source ->
// target). The source is soft-deleted and its content moves to the target —
// no summarization, no deletion.
function DeduplicationPanel() {
  const [groups, setGroups] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState(null);

  const scan = async () => {
    setScanning(true);
    try {
      const res = await api.post('/deduplication/scan');
      const g = await api.get('/deduplication/groups', {
        params: { job_id: res.data?.job_id },
      });
      setGroups(Array.isArray(g.data?.groups) ? g.data.groups : []);
      setStatus(`${res.data?.group_count ?? 0} گروه مشابه پیدا شد`);
    } catch (e) {
      setStatus('خطا در اسکن: ' + (e.message || ''));
    } finally {
      setScanning(false);
    }
  };

  const merge = async (group, sourceId) => {
    const targetId = group.entity_ids.find((id) => id !== sourceId);
    if (targetId == null) return;
    try {
      await api.post('/deduplication/merge', {
        source_id: sourceId,
        target_id: targetId,
        entity_type: group.entity_type,
      });
      setStatus(`ادغام شد (${group.entity_type}): ${sourceId} → ${targetId}`);
      scan();
    } catch (e) {
      setStatus('خطا در ادغام: ' + (e.message || ''));
    }
  };

  return (
    <div
      data-testid="deduplication-panel"
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">اسکن و ادغام موارد تکراری</h2>
        <button
          data-testid="dedup-scan-btn"
          onClick={scan}
          disabled={scanning}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {scanning ? 'در حال اسکن...' : 'اسکن و ادغام'}
        </button>
      </div>
      {status && (
        <p data-testid="dedup-status" className="text-sm text-gray-500 mb-3">
          {status}
        </p>
      )}
      {groups.length === 0 ? (
        <p data-testid="dedup-empty" className="text-gray-400 text-sm">
          موردی برای ادغام نیست (ابتدا اسکن کنید).
        </p>
      ) : (
        <ul data-testid="dedup-groups" className="space-y-3">
          {groups.map((group, gi) => (
            <li key={gi} data-testid={`dedup-group-${gi}`} className="border rounded-lg p-3">
              <div className="text-xs text-blue-600 mb-1">{group.entity_type}</div>
              <ul className="space-y-1">
                {group.items.map((it) => (
                  <li key={it.id} className="flex justify-between items-center text-sm">
                    <span>{it.label}</span>
                    <button
                      data-testid={`dedup-merge-${gi}-${it.id}`}
                      onClick={() => merge(group, it.id)}
                      className="text-xs bg-green-600 text-white rounded px-2 py-1 hover:bg-green-700"
                    >
                      ادغام در دیگری
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DeduplicationPanel;
