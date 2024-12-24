import axios from 'axios';
import { supabase } from './supabase';

interface AIUpdate {
  event_date: string;
  short_description: string;
  long_description: string;
  created_at?: string;
}

interface GrokResponse {
  text: string;
}

export async function fetchAIUpdates(): Promise<AIUpdate[]> {
  try {
    console.log('API isteği gönderiliyor...');

    // Kendi API route'umuza istek at
    const response = await fetch('/api/ai-updates');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'API isteği başarısız oldu');
    }

    console.log('API yanıtı alındı:', result);

    // API yanıtını parse et
    const messageContent = result.data.choices[0].message.content;
    console.log('API yanıt içeriği:', messageContent);

    let content;
    try {
      content = JSON.parse(messageContent);
      console.log('Parse edilen içerik:', content);
    } catch (err) {
      console.error('JSON parse hatası:', err);
      throw new Error('API yanıtı geçerli bir JSON formatında değil');
    }

    if (!content.updates || !Array.isArray(content.updates)) {
      console.error('Geçersiz yanıt formatı:', content);
      throw new Error('API yanıtı beklenen formatta değil');
    }

    // Son 30 günün tarihini hesapla
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log('Bulunan güncelleme sayısı:', content.updates.length);

    // Her güncellemeyi doğrula ve formatla
    const formattedUpdates = content.updates
      .map((update: any) => {
        try {
          // Tarihi doğrula
          const eventDate = new Date(update.event_date);
          if (isNaN(eventDate.getTime())) {
            console.error('Geçersiz tarih:', update.event_date);
            return null;
          }

          // Tarih son 1 ay içinde mi kontrol et
          if (eventDate < thirtyDaysAgo) {
            console.log('Eski tarihli güncelleme atlanıyor:', update.event_date);
            return null;
          }

          return {
            event_date: eventDate.toISOString().split('T')[0],
            short_description: update.title?.slice(0, 255).trim() || 'Başlıksız',
            long_description: update.description?.trim() || 'Açıklama yok',
          };
        } catch (err) {
          console.error('Güncelleme formatlanırken hata:', err);
          return null;
        }
      })
      .filter(Boolean) as AIUpdate[];

    console.log('Formatlanmış güncellemeler:', formattedUpdates);
    return formattedUpdates;

  } catch (err: unknown) {
    console.error('Beklenmeyen hata:', err);
    return [];
  }
}

export async function saveUpdatesToDatabase(updates: AIUpdate[]) {
  const results = [];
  
  for (const update of updates) {
    try {
      const { data, error } = await supabase
        .from('ai_developments')
        .upsert(
          {
            event_date: update.event_date,
            short_description: update.short_description,
            long_description: update.long_description,
            created_at: new Date().toISOString()
          },
          {
            onConflict: 'event_date,short_description'
          }
        )
        .select();

      if (error) {
        console.error('Veritabanı hatası:', error);
        results.push({
          success: false,
          error: error.message,
          update: update
        });
      } else {
        results.push({
          success: true,
          data: data?.[0],
          update: update
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      console.error('İşlem hatası:', errorMessage);
      results.push({
        success: false,
        error: errorMessage,
        update: update
      });
    }
  }

  // İşlem sonuçlarını logla
  console.log('Veritabanı işlem sonuçları:', {
    total: updates.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    details: results
  });

  return results;
} 