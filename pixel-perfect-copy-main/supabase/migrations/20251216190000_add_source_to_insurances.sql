-- Add source column to insurances table for Sales Dashboard Matrix
ALTER TABLE public.insurances 
ADD COLUMN IF NOT EXISTS source text;

-- Optional: Add category if needed, though product_name might suffice
-- ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS product_category text;
