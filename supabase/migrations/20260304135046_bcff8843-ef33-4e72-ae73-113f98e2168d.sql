
-- Add whatsapp_verified to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_verified boolean NOT NULL DEFAULT false;

-- Table for verification codes
CREATE TABLE public.whatsapp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone text NOT NULL,
  code text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verifications"
  ON public.whatsapp_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Table for message logs
CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text NOT NULL,
  direction text NOT NULL DEFAULT 'incoming' CHECK (direction IN ('incoming', 'outgoing')),
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'image')),
  content text,
  transcription text,
  interpreted_action jsonb,
  action_result jsonb,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'completed', 'error')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.whatsapp_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert/update (edge functions use service role)
CREATE POLICY "Service can manage messages"
  ON public.whatsapp_messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service can manage verifications"
  ON public.whatsapp_verifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
