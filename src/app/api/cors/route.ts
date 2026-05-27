import { NextResponse } from 'next/server';
import { getS3Client, getBucketName, verifyAuth } from '@/lib/s3';
import { PutBucketCorsCommand } from '@aws-sdk/client-s3';

export async function POST(req: Request) {
  try {
    verifyAuth(req);
    const client = getS3Client(req);
    const bucket = getBucketName(req);

    const command = new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    });

    await client.send(command);
    return NextResponse.json({ success: true, message: 'CORS configured successfully' });
  } catch (error: any) {
    console.error('CORS setup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
