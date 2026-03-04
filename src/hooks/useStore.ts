import { createContext, useContext } from 'react';
import { Device, mockDevices } from '@/data/devices';
import { Sale, mockSales } from '@/data/sales';
import { UserProfile, mockUser } from '@/data/user';

export type TimeFilter = 'hoje' | 'semana' | 'mes' | 'ano' | 'custom';

export interface StoreState {
  devices: Device[];
  sales: Sale[];
  user: UserProfile;
  timeFilter: TimeFilter;
}

export const initialState: StoreState = {
  devices: mockDevices,
  sales: mockSales,
  user: mockUser,
  timeFilter: 'ano',
};

export const StoreContext = createContext<{
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export type StoreAction =
  | { type: 'SET_TIME_FILTER'; payload: TimeFilter }
  | { type: 'ADD_DEVICE'; payload: Device }
  | { type: 'UPDATE_DEVICE'; payload: { id: string; updates: Partial<Device> } }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'UPDATE_USER'; payload: Partial<UserProfile> };

export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_TIME_FILTER':
      return { ...state, timeFilter: action.payload };
    case 'ADD_DEVICE':
      return { ...state, devices: [action.payload, ...state.devices] };
    case 'UPDATE_DEVICE':
      return {
        ...state,
        devices: state.devices.map(d =>
          d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
        ),
      };
    case 'ADD_SALE':
      return { ...state, sales: [action.payload, ...state.sales] };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function useStore() {
  return useContext(StoreContext);
}
