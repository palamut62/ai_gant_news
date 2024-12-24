import { NextResponse } from 'next/server';
import { fetchAIUpdates, saveUpdatesToDatabase } from '@/lib/xai';

export async function GET() {
  try {
    // XAI API ile güncel yapay zeka gelişmelerini al
    const updates = await fetchAIUpdates();
    
    if (updates.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Yeni güncelleme bulunamadı.',
        updates: []
      });
    }

    // Güncellemeleri veritabanına kaydet ve sonuçları al
    const results = await saveUpdatesToDatabase(updates);

    // Başarılı ve başarısız işlemleri ayır
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Yanıt mesajını oluştur
    let message = `${successful.length} yeni yapay zeka gelişmesi eklendi.`;
    if (failed.length > 0) {
      message += ` ${failed.length} kayıt eklenemedi.`;
    }

    return NextResponse.json({ 
      success: true, 
      message,
      stats: {
        total: updates.length,
        successful: successful.length,
        failed: failed.length
      },
      updates: successful.map(r => r.data) // Başarıyla eklenen kayıtları döndür
    });

  } catch (error) {
    console.error('XAI API güncellemesi sırasında hata:', error);
    return NextResponse.json(
      { 
        error: 'Güncelleme işlemi başarısız oldu.',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      }, 
      { status: 500 }
    );
  }
} 