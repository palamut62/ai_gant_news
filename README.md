# ai_gant_news

<div align="center">
  <img src="public/gant.png" alt="AI Timeline Screenshot" width="100%">
  <p align="center">
    <em>Interactive AI Development Timeline with Bilingual Support</em>
  </p>
</div>

A dynamic web application that tracks and visualizes artificial intelligence developments on an interactive timeline. Created by [palamut62](https://github.com/palamut62) and deployed at [umutcelik.online](https://umutcelik.online).

## Features

### 🌐 Bilingual Support
- Full support for both Turkish and English languages
- Real-time language switching without page reload
- Synchronized content in both languages

### 🤖 AI Development Tracking
- Automated fetching of AI developments using Google's Gemini AI
- Smart filtering and verification of developments
- Comprehensive coverage of:
  - New AI model launches and updates
  - Important research papers and findings
  - AI announcements from major tech companies
  - AI regulations and ethical developments
  - AI safety and risk management

### ⏳ Interactive Timeline
- Smooth scrolling timeline interface
- Drag and scroll functionality with momentum
- Sound effects synchronized with movement
- Visual feedback with spinning animations
- Color-coded events for better visualization
- Responsive design for both desktop and mobile
- Year indicators and navigation controls

### 🔄 Real-time Updates
- Automatic refresh functionality
- Progress indicators during updates
- Real-time log display in sidebar
- Update notifications and summaries

### 🎨 Modern UI/UX
- Dark/Light theme support
- Responsive design for all screen sizes
- Beautiful animations and transitions
- Blur effects and modern aesthetics
- Accessibility features

### 💾 Data Management
- Supabase database integration
- Real-time data synchronization
- Efficient caching and loading
- Automatic data validation

### 🔊 Sound Features
- Interactive sound effects during timeline navigation
- Speed-based sound modulation
- Smooth volume transitions
- Touch-responsive audio feedback

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **AI**: Google Gemini AI API
- **Database**: Supabase
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks
- **Version Control**: Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/palamut62/ai-timeline-news.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:
```bash
npm run dev
```

## Usage

- **Language Toggle**: Click the language icon to switch between Turkish and English
- **Timeline Navigation**: 
  - Drag the timeline left/right
  - Use arrow buttons for precise navigation
  - Click on events for detailed information
- **Updates**: 
  - Click the refresh icon to fetch new developments
  - View update logs in the sidebar
  - Monitor real-time changes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Created by [palamut62](https://github.com/palamut62)

Website: [umutcelik.online](https://umutcelik.online)

## Acknowledgments

- Google Gemini AI for providing the AI capabilities
- Supabase for the robust backend infrastructure
- The Next.js team for the amazing framework
- All contributors and users of the application

## Database Structure

### Supabase Tables

#### 1. ai_developments
```sql
CREATE TABLE ai_developments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_date DATE NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  short_description_en TEXT NOT NULL,
  long_description_en TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_developments ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access
CREATE POLICY "Allow anonymous access to ai_developments"
  ON ai_developments
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_ai_developments_event_date ON ai_developments(event_date DESC);
CREATE INDEX idx_ai_developments_created_at ON ai_developments(created_at DESC);
```

#### 2. ai_logs
```sql
CREATE TABLE ai_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description TEXT NOT NULL,
  description_en TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access
CREATE POLICY "Allow anonymous access to ai_logs"
  ON ai_logs
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_ai_logs_created_at ON ai_logs(created_at DESC);

-- Create realtime publication
DROP PUBLICATION IF EXISTS ai_logs_publication;
CREATE PUBLICATION ai_logs_publication FOR TABLE ai_logs;
```

#### 3. ai_updates
```sql
CREATE TABLE ai_updates (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  success_count INTEGER NOT NULL,
  update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_updates ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access
CREATE POLICY "Allow anonymous access to ai_updates"
  ON ai_updates
  FOR SELECT
  TO anon
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_ai_updates_update_time ON ai_updates(update_time DESC);
```

### Database Relationships and Usage

1. **ai_developments**: Main table storing AI development events
   - Stores both Turkish and English descriptions
   - Tracks event dates and source URLs
   - Used for timeline visualization

2. **ai_logs**: Logging table for update operations
   - Records successful updates and changes
   - Provides real-time update notifications
   - Displayed in the sidebar

3. **ai_updates**: Update tracking table
   - Tracks successful update counts
   - Records last update timestamps
   - Used for refresh status display

### Supabase Setup

1. Create a new project in Supabase
2. Execute the SQL queries above to create tables
3. Set up the following environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Enable realtime functionality:
   - Go to Database → Replication
   - Enable replication for the `ai_logs` table
   - Verify the publication is created

5. Configure RLS policies:
   - Verify policies are created for each table
   - Test anonymous access
   - Monitor access patterns
