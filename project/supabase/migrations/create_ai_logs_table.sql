-- Create ai_logs table
CREATE TABLE IF NOT EXISTS ai_logs (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  title_en text NOT NULL,
  description text NOT NULL,
  description_en text NOT NULL,
  event_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
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