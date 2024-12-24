import { supabase } from '../lib/supabase';

async function main() {
  console.log('Starting database seeding...');

  // Önce tabloyu oluştur
  const { error: createError } = await supabase.rpc('create_ai_developments_table');
  
  if (createError) {
    console.error('Error creating table:', createError);
    return;
  }

  // Örnek verileri ekle
  const sampleData = [
    {
      title: 'ChatGPT Lansmanı',
      description: 'OpenAI tarafından geliştirilen ChatGPT, yapay zeka destekli sohbet robotu olarak kullanıma sunuldu. Bu lansman, AI teknolojisinin geniş kitlelere ulaşması açısından önemli bir dönüm noktası oldu.',
      event_date: '2022-11-30',
      impact_score: 9
    },
    {
      title: 'GPT-4 Duyurusu',
      description: 'OpenAI, ChatGPT\'nin arkasındaki dil modelinin yeni versiyonu GPT-4\'ü duyurdu. Önceki versiyonlara göre daha gelişmiş anlama ve yanıt üretme yetenekleriyle dikkat çekti.',
      event_date: '2023-03-14',
      impact_score: 8
    },
    {
      title: 'Google Bard Lansmanı',
      description: 'Google, kendi yapay zeka sohbet robotu Bard\'ı kullanıma sundu. Bu hamle, AI sohbet robotları alanında rekabetin artmasına neden oldu.',
      event_date: '2023-03-21',
      impact_score: 7
    },
    {
      title: 'Claude 2 Lansmanı',
      description: 'Anthropic, gelişmiş AI asistanı Claude 2\'yi duyurdu. Daha uzun bağlam penceresi ve gelişmiş yetenekleriyle dikkat çekti.',
      event_date: '2023-07-11',
      impact_score: 7
    },
    {
      title: 'Gemini Ultra Duyurusu',
      description: 'Google, çok modlu AI modeli Gemini\'yi duyurdu. Ultra versiyonu birçok değerlendirmede GPT-4\'ü geçmeyi başardı.',
      event_date: '2023-12-06',
      impact_score: 8
    }
  ];

  // Verileri ekle
  const { error: insertError } = await supabase
    .from('ai_developments')
    .insert(sampleData);

  if (insertError) {
    console.error('Error inserting data:', insertError);
    return;
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0)); 