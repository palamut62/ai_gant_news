import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from './supabase';

interface AIUpdate {
  event_date: string;
  short_description: string;
  long_description: string;
  short_description_en: string;
  long_description_en: string;
  source_url?: string;
  created_at?: string;
}

// Gemini API istemcisini yapılandır
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function fetchAIUpdates(): Promise<AIUpdate[]> {
  try {
    console.log('API istekleri gönderiliyor...');

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const today = new Date();
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Türkçe ve İngilizce promptları hazırla
    const prompts = {
      tr: `Bugünün tarihi ${today.toISOString().split('T')[0]}.
      Geçmiş bir ay içindeki (${oneMonthAgo.toISOString().split('T')[0]} ile ${today.toISOString().split('T')[0]} arasında) önemli yapay zeka gelişmelerini araştır ve listele.
      
      Her gelişme için şu bilgileri sağla:
      1. event_date: Gelişmenin tarihi (YYYY-MM-DD formatında)
      2. short_description: Kısa açıklama (max 255 karakter)
      3. long_description: Detaylı açıklama (uzun metin)
      4. source_url: Gelişmenin kaynak URL'i (varsa)

      Özellikle şu konulara odaklan:
      - Yeni AI model lansmanları ve güncellemeleri
      - Önemli araştırma makaleleri ve bulguları
      - Büyük teknoloji şirketlerinin AI duyuruları
      - AI regülasyonları ve etik gelişmeler
      - AI güvenliği ve risk yönetimi`,
      en: `Today's date is ${today.toISOString().split('T')[0]}.
      Research and list important artificial intelligence developments in the past month (between ${oneMonthAgo.toISOString().split('T')[0]} and ${today.toISOString().split('T')[0]}).
      
      Provide the following information for each development:
      1. event_date: Date of the development (in YYYY-MM-DD format)
      2. short_description: Brief description (max 255 characters)
      3. long_description: Detailed description (long text)
      4. source_url: Source URL of the development (if available)

      Focus especially on these topics:
      - New AI model launches and updates
      - Important research papers and findings
      - AI announcements from major tech companies
      - AI regulations and ethical developments
      - AI safety and risk management`
    };

    const jsonInstructions = {
      tr: `
      Yanıtı direkt JSON formatında ver, markdown veya başka formatlama kullanma.
      Yanıt formatı:
      {
        "updates": [
          {
            "event_date": "YYYY-MM-DD",
            "short_description": "Kısa açıklama (max 255 karakter)",
            "long_description": "Detaylı açıklama",
            "source_url": "https://example.com/news"
          }
        ]
      }

      Önemli notlar:
      - event_date: Kesin tarih, YYYY-MM-DD formatında olmalı ve gelecek tarihli OLMAMALI
      - short_description: En fazla 255 karakter uzunluğunda olmalı
      - long_description: Detaylı ve açıklayıcı olmalı
      - Tüm tarihler ${oneMonthAgo.toISOString().split('T')[0]} ile ${today.toISOString().split('T')[0]} arasında olmalı
      - En az 5 en fazla 10 gelişme listele
      - Sadece doğrulanmış ve önemli gelişmeleri listele
      - Yanıtı direkt JSON olarak ver, markdown kullanma
      - Gelecek tarihli gelişmeler KABUL EDİLMEYECEKTİR`,
      en: `
      Provide the response directly in JSON format, don't use markdown or other formatting.
      Response format:
      {
        "updates": [
          {
            "event_date": "YYYY-MM-DD",
            "short_description": "Brief description (max 255 characters)",
            "long_description": "Detailed description",
            "source_url": "https://example.com/news"
          }
        ]
      }

      Important notes:
      - event_date: Exact date in YYYY-MM-DD format, MUST NOT be a future date
      - short_description: Maximum 255 characters
      - long_description: Detailed and explanatory
      - All dates must be between ${oneMonthAgo.toISOString().split('T')[0]} and ${today.toISOString().split('T')[0]}
      - List minimum 5, maximum 10 developments
      - Only list verified and important developments
      - Provide response directly as JSON, don't use markdown
      - Future dates will NOT be accepted`
    };

    // Türkçe ve İngilizce güncellemeleri al
    const [trResult, enResult] = await Promise.all([
      model.generateContent(`${prompts.tr}\n\n${jsonInstructions.tr}`),
      model.generateContent(`${prompts.en}\n\n${jsonInstructions.en}`)
    ]);

    const trText = trResult.response.text();
    const enText = enResult.response.text();

    // JSON parse işlemleri
    const trContent = JSON.parse(trText.replace(/```json\n|\n```/g, '').trim());
    const enContent = JSON.parse(enText.replace(/```json\n|\n```/g, '').trim());

    if (!trContent.updates || !Array.isArray(trContent.updates) || 
        !enContent.updates || !Array.isArray(enContent.updates)) {
      throw new Error('API yanıtları beklenen formatta değil');
    }

    // Türkçe ve İngilizce güncellemeleri eşleştir
    const combinedUpdates = trContent.updates.map((trUpdate: any, index: number) => {
      const enUpdate = enContent.updates[index];
      if (!enUpdate) return null;

      const eventDate = new Date(trUpdate.event_date);
      if (isNaN(eventDate.getTime())) return null;

      // Tarih kontrolü
      if (eventDate < oneMonthAgo || eventDate > today) return null;

      return {
        event_date: eventDate.toISOString().split('T')[0],
        short_description: trUpdate.short_description?.slice(0, 255).trim() || 'Başlıksız',
        long_description: trUpdate.long_description?.trim() || 'Açıklama yok',
        short_description_en: enUpdate.short_description?.slice(0, 255).trim() || 'No title',
        long_description_en: enUpdate.long_description?.trim() || 'No description',
        source_url: trUpdate.source_url || enUpdate.source_url,
        created_at: new Date().toISOString()
      };
    }).filter(Boolean) as AIUpdate[];

    return combinedUpdates;

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
        .insert({
          event_date: update.event_date,
          short_description: update.short_description,
          long_description: update.long_description,
          short_description_en: update.short_description_en,
          long_description_en: update.long_description_en,
          source_url: update.source_url,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Veritabanı hatası:', error);
        results.push({
          success: false,
          error: error.message,
          update: update
        });
      } else {
        // Başarılı kayıtlar için log oluştur
        console.log('Creating log for successful update:', update.short_description);
        const { error: logError } = await supabase
          .from('ai_logs')
          .insert({
            title: update.short_description,
            title_en: update.short_description_en,
            description: update.long_description,
            description_en: update.long_description_en,
            event_date: update.event_date,
            created_at: new Date().toISOString()
          });

        if (logError) {
          console.error('Log oluşturma hatası:', logError);
        } else {
          console.log('Log başarıyla oluşturuldu');
        }

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

  // Başarılı güncelleme sayısını kaydet
  const successCount = results.filter(r => r.success).length;
  if (successCount > 0) {
    try {
      await supabase
        .from('ai_updates')
        .insert({
          success_count: successCount,
        });

      // Toplu güncelleme logu ekle
      const { error: summaryLogError } = await supabase
        .from('ai_logs')
        .insert({
          title: `${successCount} Yeni Gelişme Eklendi`,
          title_en: `${successCount} New Developments Added`,
          description: `Toplam ${successCount} yeni AI gelişmesi başarıyla veritabanına kaydedildi.`,
          description_en: `Total ${successCount} new AI developments successfully saved to database.`,
          event_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (summaryLogError) {
        console.error('Özet log oluşturma hatası:', summaryLogError);
      } else {
        console.log('Özet log başarıyla oluşturuldu');
      }
    } catch (err) {
      console.error('Güncelleme kaydı hatası:', err);
    }
  }

  return results;
}