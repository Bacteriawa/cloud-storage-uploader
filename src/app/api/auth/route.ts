import { NextResponse } from 'next/server';
import { getS3Client, getBucketName, verifyAuth } from '@/lib/s3';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET(req: Request) {
  try {
    verifyAuth(req);
    const client = getS3Client(req);
    const bucket = getBucketName(req);

    // Test connection by listing 1 object
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 1,
    });

    await client.send(command);

    return NextResponse.json({ success: true, message: 'Configuration is valid' });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}
