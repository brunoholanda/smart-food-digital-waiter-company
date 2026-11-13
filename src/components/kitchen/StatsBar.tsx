import type { KitchenStats } from '../../types';

interface StatsBarProps {
  stats: KitchenStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="stats-bar">
      <div className="stat-chip accent-queued">
        <span className="stat-label">Na fila</span>
        <strong>{stats.queued}</strong>
      </div>
      <div className="stat-chip accent-preparing">
        <span className="stat-label">Preparando</span>
        <strong>{stats.preparing}</strong>
      </div>
      <div className="stat-chip accent-ready">
        <span className="stat-label">Prontos</span>
        <strong>{stats.ready}</strong>
      </div>
    </div>
  );
}
