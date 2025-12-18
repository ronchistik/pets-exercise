import { Card } from './Card';

interface StatCardProps {
  value: number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <Card className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </Card>
  );
}

