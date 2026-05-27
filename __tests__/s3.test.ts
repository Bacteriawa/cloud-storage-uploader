import { getS3Client, getBucketName, verifyAuth } from '../src/lib/s3';

describe('S3 Utils', () => {
  it('should throw an error if missing R2 headers', () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
    } as unknown as Request;

    expect(() => getS3Client(mockRequest)).toThrow('Missing R2 configuration headers');
  });

  it('should initialize S3Client if headers are valid', () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'X-R2-Access-Key') return '123';
          if (key === 'X-R2-Secret-Key') return '456';
          if (key === 'X-R2-Endpoint') return 'https://test.r2.com';
          return null;
        }),
      },
    } as unknown as Request;

    const client = getS3Client(mockRequest);
    expect(client).toBeDefined();
  });

  it('should throw if bucket header is missing', () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
    } as unknown as Request;

    expect(() => getBucketName(mockRequest)).toThrow('Missing R2 bucket header');
  });

  it('should return bucket name', () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('my-bucket'),
      },
    } as unknown as Request;

    expect(getBucketName(mockRequest)).toBe('my-bucket');
  });
});
