
-- Create backups table
CREATE TABLE public.backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  file_url text,
  file_size bigint DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  backup_type text NOT NULL DEFAULT 'manual',
  tables_included jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can manage backups"
ON public.backups FOR ALL TO authenticated
USING (company_id = get_user_company_id(auth.uid()))
WITH CHECK (company_id = get_user_company_id(auth.uid()));
