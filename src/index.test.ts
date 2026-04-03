import { describe, it, expect, vi, beforeEach } from 'vitest';
import { client, PGAtlasClient, version } from './index';

describe('PG Atlas SDK v0.3.0 (with Generated Client)', () => {
  it('should have the correct version', () => {
    expect(version).toBe('0.3.0');
  });

  describe('PGAtlasClient', () => {
    let mockFetch: any;

    beforeEach(() => {
      mockFetch = vi.fn();
      vi.stubGlobal('fetch', mockFetch);
    });

    const mockResponse = (data: any, ok = true, status = 200) => ({
      ok,
      status,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => data,
      text: async () => JSON.stringify(data),
    });

    it('should initialize the client with correct production URL by default', () => {
      const sdk = new PGAtlasClient();
      expect(sdk).toBeDefined();
    });

    it('should call fetch with the correct URL for getHealth', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ status: 'ok', version: '0.3.0' }));

      const sdk = new PGAtlasClient();
      const { data } = await sdk.getHealth();

      const [request] = mockFetch.mock.calls[0];
      const url = typeof request === 'string' ? request : request.url;
      const method = typeof request === 'string' ? mockFetch.mock.calls[0][1]?.method : request.method;

      expect(url).toBe('https://pg-atlas-backend-h8gen.ondigitalocean.app/health');
      expect(method).toBe('GET');
      expect(data?.status).toBe('ok');
    });

    it('should handle listProjects with query parameters', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0, limit: 50, offset: 0 }));

      const sdk = new PGAtlasClient();
      await sdk.listProjects({ project_type: 'public-good', search: 'test' });

      const [request] = mockFetch.mock.calls[0];
      const urlStr = typeof request === 'string' ? request : request.url;
      const url = new URL(urlStr);
      expect(url.searchParams.get('project_type')).toBe('public-good');
      expect(url.searchParams.get('search')).toBe('test');
    });

    it('should include Authorization header when apiKey is set', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ status: 'ok' }));

      const sdk = new PGAtlasClient({ apiKey: 'test-token' });
      await sdk.getHealth();

      const [request] = mockFetch.mock.calls[0];
      const headers = typeof request === 'string' ? mockFetch.mock.calls[0][1]?.headers : request.headers;
      
      // Headers can be a Record or a Headers object
      const auth = typeof headers.get === 'function' ? headers.get('Authorization') : headers.Authorization;
      expect(auth).toBe('Bearer test-token');
    });

    it('should handle ingestSbom (POST) with JSON body', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ message: 'Accepted', repository: 'owner/repo', package_count: 5 }, true, 202));

      const sdk = new PGAtlasClient({ apiKey: 'gh-token' });
      const payload = { spdxVersion: 'SPDX-2.3', name: 'test-repo' };
      const { data } = await sdk.ingestSbom(payload);

      const [request] = mockFetch.mock.calls[0];
      const url = typeof request === 'string' ? request : request.url;
      const method = typeof request === 'string' ? mockFetch.mock.calls[0][1]?.method : request.method;

      expect(url).toBe('https://pg-atlas-backend-h8gen.ondigitalocean.app/ingest/sbom');
      expect(method).toBe('POST');
      expect(data?.package_count).toBe(5);
    });

    it('should handle getMetadata', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ total_projects: 42, total_repos: 100 }));

      const sdk = new PGAtlasClient();
      const { data } = await sdk.getMetadata();

      const [request] = mockFetch.mock.calls[0];
      const url = typeof request === 'string' ? request : request.url;
      
      expect(url).toBe('https://pg-atlas-backend-h8gen.ondigitalocean.app/metadata');
      expect(data?.total_projects).toBe(42);
    });

    describe('Error Handling', () => {
      it('should return error information for 401 Unauthorized', async () => {
        mockFetch.mockResolvedValueOnce(mockResponse({ detail: 'Invalid token' }, false, 401));

        const sdk = new PGAtlasClient();
        const { error } = await sdk.getHealth();

        expect(error).toBeDefined();
        expect((error as any)?.detail).toBe('Invalid token');
      });

      it('should handle 422 Validation Error', async () => {
        mockFetch.mockResolvedValueOnce(mockResponse({ detail: [{ loc: ['body', 'name'], msg: 'field required' }] }, false, 422));

        const sdk = new PGAtlasClient();
        const { error } = await sdk.ingestSbom({});

        expect(error).toBeDefined();
        expect(Array.isArray((error as any)?.detail)).toBe(true);
      });
    });
  });
});
