-- Create shift_reports table
CREATE TABLE IF NOT EXISTS shift_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_cash INTEGER NOT NULL DEFAULT 0,
  total_transfer INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  invoice_count INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on staff_id for faster queries
CREATE INDEX IF NOT EXISTS idx_shift_reports_staff_id ON shift_reports(staff_id);
CREATE INDEX IF NOT EXISTS idx_shift_reports_created_at ON shift_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE shift_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can insert their own shift reports
CREATE POLICY "Staff can insert shift reports"
ON shift_reports FOR INSERT
WITH CHECK (auth.uid() = staff_id);

-- Policy: Staff can view their own shift reports
CREATE POLICY "Staff can view own shift reports"
ON shift_reports FOR SELECT
USING (auth.uid() = staff_id);

-- Policy: Admin can view all shift reports
CREATE POLICY "Admin can view all shift reports"
ON shift_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Admin can delete shift reports
CREATE POLICY "Admin can delete shift reports"
ON shift_reports FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shift_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_shift_reports_updated_at_trigger
BEFORE UPDATE ON shift_reports
FOR EACH ROW
EXECUTE FUNCTION update_shift_reports_updated_at();
