import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Device {
  id: string;
  user_id: string;
  modelo: string;
  capacidade: string;
  cor: string;
  cor_hex: string;
  condicao: 'novo_lacrado' | 'usado_a' | 'usado_b' | 'para_pecas';
  status: 'disponivel' | 'em_revisao' | 'vendido' | 'reservado';
  imei: string;
  preco_custo: number;
  preco_venda: number | null;
  notas: string;
  origem_troca: string | null;
  created_at: string;
  updated_at: string;
}

export type DeviceInsert = Omit<Device, 'id' | 'created_at' | 'updated_at'>;

export function useDevices() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['devices', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Device[];
    },
    enabled: !!user,
  });

  const addDevice = useMutation({
    mutationFn: async (device: Omit<DeviceInsert, 'user_id'>) => {
      // Client-side validation
      if (!device.modelo || device.modelo.length > 200) throw new Error('Modelo inválido');
      if (device.imei && device.imei.length > 15) throw new Error('IMEI deve ter no máximo 15 dígitos');
      if (device.notas && device.notas.length > 2000) throw new Error('Notas muito longas (máx 2000 caracteres)');
      if (!['novo_lacrado', 'usado_a', 'usado_b', 'para_pecas'].includes(device.condicao)) throw new Error('Condição inválida');
      if (!['disponivel', 'em_revisao', 'vendido', 'reservado'].includes(device.status)) throw new Error('Status inválido');

      const { data, error } = await supabase
        .from('devices')
        .insert({ ...device, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Device;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });

  const updateDevice = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Device> }) => {
      const { data, error } = await supabase
        .from('devices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Device;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });

  const deleteDevice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('devices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });

  return {
    devices: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    addDevice,
    updateDevice,
    deleteDevice,
    refetch: query.refetch,
  };
}
