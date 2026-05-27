import { NextResponse } from 'next/server';
import { getS3Client, getBucketName, verifyAuth } from '@/lib/s3';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET(req: Request) {
  try {
    verifyAuth(req);
    const client = getS3Client(req);
    const bucket = getBucketName(req);
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get('prefix') || '';

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const response = await client.send(command);
    const files = response.Contents?.map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      eTag: item.ETag,
    })) || [];

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    console.error('List files error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
