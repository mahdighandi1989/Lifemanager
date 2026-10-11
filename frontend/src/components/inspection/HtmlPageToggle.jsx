import { isHtmlFile } from '../../lib/miniApps';

/**
 * «این فایل صفحه شود» — shown next to an HTML file while it is being attached.
 * Ticked ⇒ the moment it is uploaded, the owner's own browser installs it as a
 * page (`installUploaded`). The flag rides on the File object (`lmAsPage`) so
 * every picker keeps its own list shape; `onChange` re-renders the parent.
 */
export default function HtmlPageToggle({ file, onChange }) {
  if (!isHtmlFile(file)) return null;
  return (
    <label dir="rtl" className="flex items-center gap-1 text-[11px] text-emerald-800"
      title="همین فایل، بی‌تغییر، به‌عنوانِ یک صفحهٔ جدا در منوی «ابزار» — بلافاصله پس از پیوست">
      <input type="checkbox" checked={!!file.lmAsPage} data-testid="inspection-as-page"
        onChange={(e) => { file.lmAsPage = e.target.checked; onChange(); }} />
      صفحهٔ جدا شود
    </label>
  );
}
