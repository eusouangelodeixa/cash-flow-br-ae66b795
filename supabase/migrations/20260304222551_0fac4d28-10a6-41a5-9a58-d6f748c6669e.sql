CREATE TABLE IF NOT EXISTS public.whatsapp_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reason text NOT NULL,
  event text NOT NULL DEFAULT '',
  phone text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_audit_events_created_at
  ON public.whatsapp_audit_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_audit_events_reason
  ON public.whatsapp_audit_events (reason);

CREATE INDEX IF NOT EXISTS idx_whatsapp_audit_events_phone
  ON public.whatsapp_audit_events (phone);

ALTER TABLE public.whatsapp_audit_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'whatsapp_audit_events'
      AND policyname = 'Admins can read whatsapp audit events'
  ) THEN
    CREATE POLICY "Admins can read whatsapp audit events"
      ON public.whatsapp_audit_events
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;