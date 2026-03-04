import { ReactNode } from 'react';

interface KPICardProps {
  label: string;
  children: ReactNode;
  subInfo?: string;
  icon?: ReactNode;
  delay?: number;
}

const KPICard = ({ label, children, subInfo, icon, delay = 0 }: KPICardProps) => {
  return (
    <div
      className="glass-card p-4 md:p-6 relative overflow-hidden animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {icon && (
        <div className="absolute top-3 right-3 md:top-4 md:right-4 text-muted-foreground opacity-40">
          {icon}
        </div>
      )}
      <p className="label-uppercase mb-2 md:mb-3 text-[9px] md:text-[11px]">{label}</p>
      <div className="mb-1 md:mb-2">{children}</div>
      {subInfo && (
        <p className="text-[11px] md:text-sm-apple text-muted-foreground truncate">{subInfo}</p>
      )}
    </div>
  );
};

export default KPICard;
