import { S3Client } from '@aws-sdk/client-s3';

export function getS3Client(req: Request) {
  const accessKeyId = req.headers.get('X-R2-Access-Key');
  const secretAccessKey = req.headers.get('X-R2-Secret-Key');
  const endpoint = req.headers.get('X-R2-Endpoint');

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error('Missing R2 configuration headers');
  }

  return new S3Client({
    region: 'auto',
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

export function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const sitePassword = process.env.SITE_PASSWORD;
  
  if (sitePassword && authHeader !== `Bearer ${sitePassword}`) {
    throw new Error('Unauthorized');
  }
}
