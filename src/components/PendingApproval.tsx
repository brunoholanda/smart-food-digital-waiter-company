import { Button, Result } from 'antd';
import { Hourglass } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PendingApproval({
  title = 'Aguardando aprovação',
  subtitle = 'O gerenciamento do cardápio será liberado assim que o cadastro for confirmado pela equipe SmartFood.',
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="sf-surface" style={{ padding: 24 }}>
      <Result
        icon={
          <div className="sf-pulse" style={{ color: 'var(--sf-coral)' }}>
            <Hourglass size={48} />
          </div>
        }
        title={title}
        subTitle={subtitle}
        extra={
          <Link to="/app/profile">
            <Button type="primary">Completar perfil</Button>
          </Link>
        }
      />
    </div>
  );
}
