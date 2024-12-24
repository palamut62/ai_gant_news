import { NextResponse } from 'next/server';
import OpenAI from "openai";

// OpenAI istemcisini yapılandır
const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function GET() {
  try {
    console.log('API isteği başlatılıyor...');
    console.log('API Key:', process.env.XAI_API_KEY?.substring(0, 10) + '...');
    console.log('Base URL:', openai.baseURL);

    if (!process.env.XAI_API_KEY) {
      throw new Error('API anahtarı bulunamadı');
    }

    const completion = await openai.chat.completions.create({
      model: "grok-2",
      messages: [
        {
          role: "system",
          content: "Sen bir AI gelişmelerini takip eden ve bunları JSON formatında raporlayan bir asistandın."
        },
        {
          role: "user",
          content: `Son bir ay içindeki önemli yapay zeka gelişmelerini JSON formatında listele. 
          Her gelişme için şu bilgileri sağla:
          1. Başlık (kısa açıklama, max 255 karakter)
          2. Detaylı açıklama (uzun metin)
          3. Tarih (YYYY-MM-DD formatında)

          Özellikle şu konulara odaklan:
          - Yeni AI model lansmanları ve güncellemeleri
          - Önemli araştırma makaleleri ve bulguları
          - Büyük teknoloji şirketlerinin AI duyuruları
          - AI regülasyonları ve etik gelişmeler
          - AI güvenliği ve risk yönetimi

          Yanıtı aşağıdaki JSON formatında ver:
          {
            "updates": [
              {
                "title": "Kısa açıklama",
                "description": "Detaylı açıklama",
                "event_date": "YYYY-MM-DD"
              }
            ]
          }`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    console.log('API yanıtı alındı:', completion);

    return NextResponse.json({ data: completion });
  } catch (error: any) {
    console.error('API hatası detayları:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack,
      response: error.response?.data
    });

    return NextResponse.json(
      { 
        error: 'AI güncellemeleri alınamadı',
        details: error.message,
        name: error.name,
        cause: error.cause,
        response: error.response?.data
      },
      { status: 500 }
    );
  }
} 