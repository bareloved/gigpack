-- Migration: Create user_templates table for custom user-created templates
-- This table stores user-defined GigPack templates that can be reused

CREATE TABLE user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📋',
  default_values JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by owner
CREATE INDEX idx_user_templates_owner_id ON user_templates(owner_id);

-- Enable Row Level Security
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own templates
CREATE POLICY "Users can view own templates" ON user_templates
  FOR SELECT USING (auth.uid() = owner_id);

-- RLS Policy: Users can insert their own templates
CREATE POLICY "Users can create own templates" ON user_templates
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- RLS Policy: Users can update their own templates
CREATE POLICY "Users can update own templates" ON user_templates
  FOR UPDATE USING (auth.uid() = owner_id);

-- RLS Policy: Users can delete their own templates
CREATE POLICY "Users can delete own templates" ON user_templates
  FOR DELETE USING (auth.uid() = owner_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER trigger_user_templates_updated_at
  BEFORE UPDATE ON user_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_user_templates_updated_at();

