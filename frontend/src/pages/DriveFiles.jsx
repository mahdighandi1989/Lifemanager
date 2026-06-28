import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// DriveFiles page (audit task 7367c6f0 AC8): lists the user's files and marks
// the ones cold-tiered out to Google Drive with a badge + a download link to
// the Drive blob. Reads GET /api/drive/files.
function DriveFiles({ embedded = false }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    api
      .get('/drive/files')
      .then((res) => setFiles(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError('خطا در دریافت فایل‌ها: ' + (e.message || '')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Upload an actual file: multipart POST to /api/drive/upload-file. The backend
  // stores it locally and, when Drive is connected, pushes the bytes up and
  // fills in the Drive id/link automatically.
  const onUpload = useCallback(
    (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      setError(null);
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      api
        .post('/drive/upload-file', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(() => load())
        .catch((err) => setError('خطا در بارگذاری فایل: ' + (err?.response?.data?.detail || err.message || '')))
        .finally(() => {
          setUploading(false);
          e.target.value = '';
        });
    },
    [load],
  );

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="drive-files-page">
      <div className="max-w-3xl mx-auto px-4" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">فایل‌های من</h1>
          <label
            data-testid="drive-upload-label"
            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium cursor-pointer hover:bg-blue-700"
          >
            {uploading ? 'در حال بارگذاری...' : 'بارگذاری فایل'}
            <input
              type="file"
              data-testid="drive-upload-input"
              onChange={onUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
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
