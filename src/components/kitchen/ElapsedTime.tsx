import { useEffect, useState } from 'react';
import { formatElapsed } from '../../utils/format';

interface ElapsedTimeProps {
  from: string | null | undefined;
  urgentAfterMinutes?: number;
  className?: string;
}

export function ElapsedTime({
  from,
  urgentAfterMinutes = 10,
  className = '',
}: ElapsedTimeProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!from) return <span className={className}>—</span>;

  const elapsedMs = now - new Date(from).getTime();
  const urgent = elapsedMs >= urgentAfterMinutes * 60_000;

  return (
    <span className={`elapsed-time${urgent ? ' is-urgent' : ''} ${className}`.trim()}>
      {formatElapsed(from, now)}
    </span>
  );
}
