import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  nome: string;
  loja: string;
  whatsapp: string;
  instagram: string;
  whatsapp_verified: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Omit<Profile, 'id' | 'created_at'>>) => {
      // Client-side validation
      if (updates.nome !== undefined && updates.nome.length > 200) throw new Error('Nome muito longo (máx 200 caracteres)');
      if (updates.loja !== undefined && updates.loja.length > 200) throw new Error('Nome da loja muito longo (máx 200 caracteres)');
      if (updates.whatsapp !== undefined && updates.whatsapp.length > 30) throw new Error('WhatsApp inválido');
      if (updates.instagram !== undefined && updates.instagram.length > 100) throw new Error('Instagram muito longo (máx 100 caracteres)');

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user!.id)
        .select()
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateProfile,
  };
}
