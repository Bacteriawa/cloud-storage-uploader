import { S3Client } from '@aws-sdk/client-s3';

export function getS3Client(req: Request) {
  const accessKeyId = req.headers.get('X-R2-Access-Key');
  const secretAccessKey = req.headers.get('X-R2-Secret-Key');
  const endpoint = req.headers.get('X-R2-Endpoint');
  const region = req.headers.get('X-S3-Region') || 'auto';

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error('Missing R2 configuration headers');
  }

  // Validate endpoint format
  if (!/^https?:\/\/.+/i.test(endpoint)) {
    throw new Error('Invalid endpoint: must start with http:// or https://');
  }

  // Validate key length (prevent abuse)
  if (accessKeyId.length > 256 || secretAccessKey.length > 256) {
    throw new Error('Invalid credentials: key too long');
  }

  return new S3Client({
    region: region,
    endpoint: endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export function getBucketName(req: Request) {
  const bucket = req.headers.get('X-R2-Bucket');
  if (!bucket) {
    throw new Error('Missing R2 bucket header');
  }
  return bucket;
}

export function verifyAuth(_req: Request) {
  // Authentication has been removed per user request
  return true;
}
