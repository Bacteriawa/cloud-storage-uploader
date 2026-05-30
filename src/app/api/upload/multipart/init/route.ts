import { NextResponse } from 'next/server';
import { getS3Client, getBucketName, verifyAuth } from '@/lib/s3';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';

export async function POST(req: Request) {
  try {
    verifyAuth(req);
    const client = getS3Client(req);
    const bucket = getBucketName(req);
    const body = await req.json();
    const { key, contentType } = body;

    const command = new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const response = await client.send(command);
    
    return NextResponse.json({ 
      success: true, 
      uploadId: response.UploadId,
      key: response.Key
    });
  } catch (error: unknown) {
    console.error('Init multipart error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
