
-- Create business_categories table
CREATE TABLE public.business_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  icon text,
  default_product_categories jsonb DEFAULT '[]'::jsonb,
  default_services jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view business categories"
ON public.business_categories FOR SELECT TO public
USING (true);

-- Add business_category_id to companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS business_category_id uuid REFERENCES public.business_categories(id);

-- Add setup_completed flag to companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS setup_completed boolean NOT NULL DEFAULT false;
