import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const runtime = 'edge';

export async function GET(request: Request) {
  const headersList = headers();
  const cronSecret = headersList.get('x-cron-secret');

  // Güvenlik kontrolü
  if (cronSecret !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // AI güncellemelerini al
    const updateResponse = await fetch(`${request.url}/../../update-ai`);
    const updateData = await updateResponse.json();

    return NextResponse.json({
      success: true,
      message: 'CRON job başarıyla çalıştı',
      updateResult: updateData
    });
  } catch (error) {
    console.error('CRON job hatası:', error);
    return NextResponse.json(
      { error: 'CRON job başarısız oldu' },
      { status: 500 }
    );
  }
} 