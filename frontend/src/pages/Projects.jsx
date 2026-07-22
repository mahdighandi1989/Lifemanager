/**
 * Projects Page
 * 
 * Purpose: Displays a list of projects fetched from the backend API, allows users to view
 * project details (name, description, status, creation date), and provides a form to create
 * new projects. This component is the main project management interface for the LifeManager app.
 * 
 * Upstream: Fetches data from GET /projects and POST /projects endpoints.
 * Downstream: Used by the main App router as a page component.
 * Side effects: Makes HTTP requests to the backend API on mount and on project creation.
 */

import React, { useState, useEffect, useRef } from 'react';
import SahatChip from '../components/SahatChip';

// All project data lives under /api/projects. The bare /projects path is
// the SPA route that renders this page.
const API_BASE = '/api';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS = {
  active: 'فعال',
  completed: 'تکمیل‌شده',
  on_hold: 'متوقف',
  archived: 'آرشیو',
};

function ProjectCard({ project, onDelete }) {
  const status = project.status || 'active';
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{project.name || project.title}</h3>
            {project.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{project.description}</p>
            )}
          </div>
        </div>
        <span className="flex flex-shrink-0 items-center gap-1.5 ml-2">
          <SahatChip
            entityType="project"
            entityId={project.id}
            sahat={project.sahat}
            source={project.sahat_source}
          />
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[status] || status}
          </span>
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        {project.created_at ? (
          <p className="text-xs text-gray-400">
            ایجاد: {new Date(project.created_at).toLocaleDateString('fa-IR')}
          </p>
        ) : <span />}
        <button
          type="button"
          onClick={() => onDelete && onDelete(project)}
          data-testid={`project-delete-${project.id}`}
          className="text-xs text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="حذف پروژه"
        >
          حذف
        </button>
      </div>
    </div>
  );
}

function Projects({ embedded = false }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adding, setAdding] = useState(false);
  // Synchronous in-flight guard: `adding` (React state) updates a render tick
  // late, so a fast double-click can fire two POSTs before the button
  // disables. A ref flips immediately and blocks the second submit — the root
  // cause of the duplicate rows the owner saw. The server-side idempotent
  // create is the backstop; this stops the request from ever leaving.
  const submitting = useRef(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      setError('خطا در دریافت پروژه‌ها: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (project) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`حذف پروژهٔ «${project.name || project.title}»؟`)) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${project.id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setProjects(prev => prev.filter(p => p.id !== project.id));
      } else {
        setError('حذف پروژه ناموفق بود');
      }
    } catch {
      setError('حذف پروژه ناموفق بود');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (submitting.current) return;   // block a second submit already in flight
    submitting.current = true;
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim(), status: 'active' }),
      });
      if (res.ok) {
        const project = await res.json();
        // Server create is idempotent by (owner, name): re-adding the same
        // name returns the existing row. De-dupe locally so it isn't listed
        // twice if it's already on screen.
        setProjects(prev =>
          prev.some(p => p.id === project.id) ? prev : [project, ...prev]
        );
        setNewName('');
        setNewDesc('');
        setShowForm(false);
      }
    } catch {
      setError('خطا در افزودن پروژه');
    } finally {
      setAdding(false);
      submitting.current = false;
    }
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          {embedded ? <div /> : (
          <div>
            <h1 className="text-3xl font-bold text-gray-900">پروژه‌ها</h1>
            <p className="text-gray-500 mt-1">سازماندهی و پیگیری پروژه‌های شما</p>
          </div>
          )}
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>پروژه جدید</span>
          </button>
        </div>

        {/* Add Project Form */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 space-y-3">
            <h2 className="font-semibold text-gray-900">پروژه جدید</h2>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="نام پروژه *"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="توضیحات (اختیاری)"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={adding || !newName.trim()}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {adding ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                انصراف
              </button>
            </div>
          </form>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            در حال بارگذاری...
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-gray-500 font-medium">هنوز پروژه‌ای ندارید</p>
            <p className="text-sm text-gray-400 mt-1">روی «پروژه جدید» کلیک کنید تا شروع کنید</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
