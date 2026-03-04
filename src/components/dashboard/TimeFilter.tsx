import { TimeFilter } from '@/pages/Dashboard';

interface Props {
  timeFilter: TimeFilter;
  setTimeFilter: (f: TimeFilter) => void;
}

const filters: { key: TimeFilter; label: string }[] = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' },
  { key: 'ano', label: 'Ano' },
];

const TimeFilterBar = ({ timeFilter, setTimeFilter }: Props) => {
  return (
    <div className="flex items-center gap-1 md:gap-2">
      {filters.map(f => (
        <button
          key={f.key}
          onClick={() => setTimeFilter(f.key)}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-pill text-xs md:text-sm-apple font-medium transition-colors ${
            timeFilter === f.key
              ? 'bg-foreground text-background'
              : 'bg-[rgba(255,255,255,0.04)] text-muted-foreground hover:text-foreground'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};

export default TimeFilterBar;
