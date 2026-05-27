import { NextResponse } from 'next/server';
import { getS3Client, getBucketName, verifyAuth } from '@/lib/s3';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(req: Request) {
  try {
    verifyAuth(req);
    const client = getS3Client(req);
    const bucket = getBucketName(req);
    const body = await req.json();
    const { key, uploadId, partNumber } = body;

    const command = new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Presign part error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
