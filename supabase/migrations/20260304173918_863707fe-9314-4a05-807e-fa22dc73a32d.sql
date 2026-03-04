
DO $$ BEGIN
  -- sales constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_tipo_check') THEN
    ALTER TABLE public.sales ADD CONSTRAINT sales_tipo_check CHECK (tipo IN ('venda', 'troca'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_status_check') THEN
    ALTER TABLE public.sales ADD CONSTRAINT sales_status_check CHECK (status IN ('concluida', 'em_revisao', 'cancelada'));
  END IF;
  -- profiles length
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_nome_length') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_nome_length CHECK (char_length(nome) <= 200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_loja_length') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_loja_length CHECK (char_length(loja) <= 200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_whatsapp_length') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_whatsapp_length CHECK (char_length(whatsapp) <= 30);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_instagram_length') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_instagram_length CHECK (char_length(instagram) <= 100);
  END IF;
  -- devices length
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'devices_modelo_length') THEN
    ALTER TABLE public.devices ADD CONSTRAINT devices_modelo_length CHECK (char_length(modelo) <= 200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'devices_notas_length') THEN
    ALTER TABLE public.devices ADD CONSTRAINT devices_notas_length CHECK (char_length(notas) <= 2000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'devices_imei_length') THEN
    ALTER TABLE public.devices ADD CONSTRAINT devices_imei_length CHECK (char_length(imei) <= 15);
  END IF;
  -- sales length
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_cliente_length') THEN
    ALTER TABLE public.sales ADD CONSTRAINT sales_cliente_length CHECK (char_length(cliente) <= 200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_modelo_length') THEN
    ALTER TABLE public.sales ADD CONSTRAINT sales_modelo_length CHECK (char_length(modelo) <= 200);
  END IF;
END $$;
