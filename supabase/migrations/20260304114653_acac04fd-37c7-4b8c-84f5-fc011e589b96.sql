
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  loja text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Devices table
CREATE TABLE public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modelo text NOT NULL,
  capacidade text NOT NULL,
  cor text NOT NULL,
  cor_hex text NOT NULL DEFAULT '#000000',
  condicao text NOT NULL CHECK (condicao IN ('novo_lacrado', 'usado_a', 'usado_b', 'para_pecas')),
  status text NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em_revisao', 'vendido', 'reservado')),
  imei text NOT NULL DEFAULT '',
  preco_custo numeric NOT NULL DEFAULT 0,
  preco_venda numeric,
  notas text NOT NULL DEFAULT '',
  origem_troca uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own devices" ON public.devices
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own devices" ON public.devices
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own devices" ON public.devices
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own devices" ON public.devices
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Sales table
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  modelo text NOT NULL,
  capacidade text NOT NULL,
  cor text NOT NULL,
  condicao text NOT NULL,
  tipo text NOT NULL DEFAULT 'venda' CHECK (tipo IN ('venda', 'troca')),
  status text NOT NULL DEFAULT 'concluida' CHECK (status IN ('concluida', 'em_revisao', 'cancelada')),
  preco_venda numeric NOT NULL DEFAULT 0,
  preco_custo numeric NOT NULL DEFAULT 0,
  cliente text NOT NULL DEFAULT '',
  aparelho_troca_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sales" ON public.sales
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sales" ON public.sales
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sales" ON public.sales
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create profile for existing users (admin)
INSERT INTO public.profiles (id, nome)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;
