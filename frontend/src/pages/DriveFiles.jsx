import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// DriveFiles page (audit task 7367c6f0 AC8): lists the user's files and marks
// the ones cold-tiered out to Google Drive with a badge + a download link to
// the Drive blob. Reads GET /api/drive/files.
function DriveFiles() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api
      .get('/drive/files')
      .then((res) => setFiles(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError('خطا در دریافت فایل‌ها: ' + (e.message || '')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="drive-files-page">
      <div className="max-w-3xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">فایل‌های من</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {files.length === 0 ? (
          <p data-testid="drive-empty" className="text-gray-400 text-sm">
            فایلی ثبت نشده است.
          </p>
        ) : (
          <ul className="space-y-2">
            {files.map((f) => {
              const onDrive = f.storage_location === 'drive' || !!f.drive_file_id;
              return (
                <li
                  key={f.id}
                  data-testid={`drive-file-${f.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800">{f.filename}</span>
                    {onDrive && (
                      <span
                        data-testid="drive-badge"
                        className="text-[11px] bg-green-100 text-green-700 rounded px-2 py-0.5"
                      >
                        Drive ☁
                      </span>
                    )}
                  </div>
                  {onDrive && f.drive_link && (
                    <a
                      data-testid={`drive-download-${f.id}`}
                      href={f.drive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline shrink-0"
                    >
                      دانلود
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DriveFiles;
