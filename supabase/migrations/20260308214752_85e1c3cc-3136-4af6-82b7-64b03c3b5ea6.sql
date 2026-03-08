
-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quotation items follow quotation access" ON public.quotation_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.company_id = public.get_user_company_id(auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.company_id = public.get_user_company_id(auth.uid())));

-- Create receipt storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Auth users can upload receipts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'receipts');
CREATE POLICY "Public can view receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');
CREATE POLICY "Auth users can delete receipts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'receipts');

-- Add receipt_url to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_url text;
