import axios from 'axios';
import { R2Config } from '@/lib/config';
import {
  checkAuth,
  listFiles,
  deleteFile,
  renameFile,
  getDownloadUrl,
  getPresignedUrl,
  initMultipartUpload,
  getMultipartPresignedUrl,
  completeMultipartUpload,
} from '@/lib/api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const config: R2Config = {
  accessKeyId: 'ak123',
  secretAccessKey: 'sk456',
  bucket: 'test-bucket',
  endpoint: 'https://example.r2.cloudflarestorage.com',
  region: 'auto',
};

const expectedHeaders = {
  'X-R2-Access-Key': 'ak123',
  'X-R2-Secret-Key': 'sk456',
  'X-R2-Bucket': 'test-bucket',
  'X-R2-Endpoint': 'https://example.r2.cloudflarestorage.com',
  'X-S3-Region': 'auto',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('api.ts', () => {
  describe('checkAuth', () => {
    it('sends GET /api/auth with correct headers', async () => {
      mockedAxios.get.mockResolvedValue({ data: { success: true } });
      const result = await checkAuth(config);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth', { headers: expectedHeaders });
      expect(result.success).toBe(true);
    });
  });

  describe('listFiles', () => {
    it('sends GET /api/files with headers and prefix', async () => {
      mockedAxios.get.mockResolvedValue({ data: { files: [{ key: 'test.txt' }] } });
      const result = await listFiles(config, 'docs/');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/files?prefix=docs%2F',
        { headers: expectedHeaders }
      );
      expect(result).toEqual([{ key: 'test.txt' }]);
    });

    it('defaults to empty prefix', async () => {
      mockedAxios.get.mockResolvedValue({ data: { files: [] } });
      await listFiles(config);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/files?prefix=',
        { headers: expectedHeaders }
      );
    });
  });

  describe('deleteFile', () => {
    it('sends DELETE with encoded key', async () => {
      mockedAxios.delete.mockResolvedValue({ data: { success: true } });
      await deleteFile(config, 'path/to file.txt');
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/files/path%2Fto%20file.txt',
        { headers: expectedHeaders }
      );
    });
  });

  describe('renameFile', () => {
    it('sends POST with rename action', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      await renameFile(config, 'old.txt', 'new.txt');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/files/old.txt',
        { action: 'rename', newKey: 'new.txt' },
        { headers: expectedHeaders }
      );
    });
  });

  describe('getDownloadUrl', () => {
    it('sends POST with download action', async () => {
      mockedAxios.post.mockResolvedValue({ data: { url: 'https://signed-url.example.com' } });
      const url = await getDownloadUrl(config, 'file.pdf');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/files/file.pdf',
        { action: 'download' },
        { headers: expectedHeaders }
      );
      expect(url).toBe('https://signed-url.example.com');
    });
  });

  describe('getPresignedUrl', () => {
    it('sends POST with key and contentType', async () => {
      mockedAxios.post.mockResolvedValue({ data: { url: 'https://presigned.example.com' } });
      const url = await getPresignedUrl(config, 'upload.jpg', 'image/jpeg');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/upload/presign',
        { key: 'upload.jpg', contentType: 'image/jpeg' },
        { headers: expectedHeaders }
      );
      expect(url).toBe('https://presigned.example.com');
    });
  });

  describe('multipart upload', () => {
    it('initMultipartUpload returns uploadId', async () => {
      mockedAxios.post.mockResolvedValue({ data: { uploadId: 'upload-123' } });
      const id = await initMultipartUpload(config, 'big.zip', 'application/zip');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/upload/multipart/init',
        { key: 'big.zip', contentType: 'application/zip' },
        { headers: expectedHeaders }
      );
      expect(id).toBe('upload-123');
    });

    it('getMultipartPresignedUrl returns signed URL', async () => {
      mockedAxios.post.mockResolvedValue({ data: { url: 'https://part-url.example.com' } });
      const url = await getMultipartPresignedUrl(config, 'big.zip', 'upload-123', 1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/upload/multipart/presign',
        { key: 'big.zip', uploadId: 'upload-123', partNumber: 1 },
        { headers: expectedHeaders }
      );
      expect(url).toBe('https://part-url.example.com');
    });

    it('completeMultipartUpload sends parts', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      const parts = [{ partNumber: 1, eTag: 'abc' }, { partNumber: 2, eTag: 'def' }];
      await completeMultipartUpload(config, 'big.zip', 'upload-123', parts);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/upload/multipart/complete',
        { key: 'big.zip', uploadId: 'upload-123', parts },
        { headers: expectedHeaders }
      );
    });
  });

  describe('error handling', () => {
    it('propagates network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect(checkAuth(config)).rejects.toThrow('Network Error');
    });
  });
});
