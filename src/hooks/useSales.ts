import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Sale {
  id: string;
  user_id: string;
  device_id: string | null;
  modelo: string;
  capacidade: string;
  cor: string;
  condicao: string;
  tipo: 'venda' | 'troca';
  status: 'concluida' | 'em_revisao' | 'cancelada';
  preco_venda: number;
  preco_custo: number;
  cliente: string;
  aparelho_troca_id: string | null;
  created_at: string;
}

export function useSales() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sales', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Sale[];
    },
    enabled: !!user,
  });

  const addSale = useMutation({
    mutationFn: async (sale: Omit<Sale, 'id' | 'user_id' | 'created_at'>) => {
      // Client-side validation
      if (!sale.modelo || sale.modelo.length > 200) throw new Error('Modelo inválido');
      if (sale.cliente && sale.cliente.length > 200) throw new Error('Nome do cliente muito longo');
      if (!['venda', 'troca'].includes(sale.tipo)) throw new Error('Tipo de venda inválido');
      if (!['concluida', 'em_revisao', 'cancelada'].includes(sale.status)) throw new Error('Status inválido');

      const { data, error } = await supabase
        .from('sales')
        .insert({ ...sale, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  return {
    sales: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    addSale,
    refetch: query.refetch,
  };
}
