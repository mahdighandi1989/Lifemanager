import { afterEach, describe, expect, it, vi } from 'vitest';
import api from '../api';
import { installUploaded, isHtmlFile } from '../miniApps';

describe('«صفحهٔ جدا شود» — the owner installs while attaching', () => {
  afterEach(() => vi.restoreAllMocks());

  it('offers the toggle only for HTML files', () => {
    expect(isHtmlFile({ name: 'learning-architecture.html' })).toBe(true);
    expect(isHtmlFile({ name: 'x.HTM' })).toBe(true);
    expect(isHtmlFile({ name: 'page', type: 'text/html' })).toBe(true);
    expect(isHtmlFile({ name: 'notes.pdf', type: 'application/pdf' })).toBe(false);
  });

  it('installs right after the last installed page, titled from the file name', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { apps: [{ path: '/apps/neuro-focus' }] } });
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { app: { path: '/apps/app-915e33ea' } } });
    const app = await installUploaded('915e33ea6234', 'learning-architecture.html');
    expect(app.path).toBe('/apps/app-915e33ea');
    expect(post).toHaveBeenCalledWith('/mini-apps', { file_id: '915e33ea6234', title: 'learning architecture', after: '/apps/neuro-focus' });
  });

  it('falls back to right after «/import» when nothing is installed yet', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { apps: [] } });
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { app: { path: '/apps/x' } } });
    await installUploaded('id1', 'a.html');
    expect(post.mock.calls[0][1].after).toBe('/import');
  });
});
