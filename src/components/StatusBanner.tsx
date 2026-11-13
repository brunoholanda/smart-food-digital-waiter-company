import { Alert } from 'antd';
import { Clock3, CircleAlert, Ban } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RestaurantStatus } from '../types';

const config: Record<
  Exclude<RestaurantStatus, 'APPROVED'>,
  { type: 'info' | 'warning' | 'error'; title: string; description: string; icon: ReactNode }
> = {
  PENDING: {
    type: 'info',
    title: 'Cadastro em análise',
    description:
      'Estamos revisando as informações do seu restaurante. Assim que for aprovado, você poderá publicar o cardápio e gerenciar itens.',
    icon: <Clock3 size={18} />,
  },
  REJECTED: {
    type: 'error',
    title: 'Cadastro rejeitado',
    description:
      'Revise os dados do perfil e entre em contato com o suporte para reenviar a solicitação.',
    icon: <CircleAlert size={18} />,
  },
  SUSPENDED: {
    type: 'warning',
    title: 'Conta suspensa',
    description:
      'O acesso ao cardápio público está temporariamente suspenso. Atualize seus dados ou fale com o suporte.',
    icon: <Ban size={18} />,
  },
};

export function StatusBanner({
  status,
  rejectionReason,
}: {
  status: RestaurantStatus;
  rejectionReason?: string | null;
}) {
  if (status === 'APPROVED') return null;
  const item = config[status];
  return (
    <Alert
      type={item.type}
      showIcon
      icon={item.icon}
      message={item.title}
      description={
        status === 'REJECTED' && rejectionReason
          ? `${item.description} Motivo: ${rejectionReason}`
          : item.description
      }
      style={{ borderRadius: 16, marginBottom: 20 }}
    />
  );
}
