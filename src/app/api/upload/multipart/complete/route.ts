import { NextResponse } from 'next/server';
import { getS3Client, getBucketName, verifyAuth } from '@/lib/s3';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

export async function POST(req: Request) {
  try {
    verifyAuth(req);
    const client = getS3Client(req);
    const bucket = getBucketName(req);
    const body = await req.json();
    const { key, uploadId, parts } = body;

    const command = new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((p: { eTag: string; partNumber: number }) => ({
          ETag: p.eTag,
          PartNumber: p.partNumber,
        })),
      },
    });

    await client.send(command);
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Complete multipart error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
