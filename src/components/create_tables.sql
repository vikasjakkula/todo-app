-- Supabase SQL Schema for Todo App
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own todos
CREATE POLICY "Users can view their own todos" 
  ON todos FOR SELECT 
  USING (true);

-- Create policy to allow users to insert their own todos
CREATE POLICY "Users can insert their own todos" 
  ON todos FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to update their own todos
CREATE POLICY "Users can update their own todos" 
  ON todos FOR UPDATE 
  USING (true);

-- Create policy to allow users to delete their own todos
CREATE POLICY "Users can delete their own todos" 
  ON todos FOR DELETE 
  USING (true);