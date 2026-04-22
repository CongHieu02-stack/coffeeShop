-- Drop all old policies
DROP POLICY IF EXISTS "Admin can delete products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Admin can insert products" ON products;

-- Create comprehensive policies for admin
CREATE POLICY "Admin can insert products"
ON products FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can update products"
ON products FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can delete products"
ON products FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Or disable RLS temporarily for testing
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
