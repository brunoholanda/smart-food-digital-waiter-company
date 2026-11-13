import { Progress, Tag, Typography } from 'antd';
import { CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Restaurant } from '../types';
import { getProfileCompletion } from '../utils/profileCompletion';

interface ProfileCompletionCardProps {
  restaurant: Restaurant;
  compact?: boolean;
}

function progressStatus(percent: number): 'success' | 'normal' | 'active' {
  if (percent >= 100) return 'success';
  if (percent >= 60) return 'active';
  return 'normal';
}

export function ProfileCompletionCard({
  restaurant,
  compact = false,
}: ProfileCompletionCardProps) {
  const { percent, completed, total, missing } = getProfileCompletion(restaurant);

  return (
    <div
      className="sf-surface"
      style={{
        padding: compact ? 16 : 20,
        marginBottom: 20,
        background:
          percent >= 100
            ? 'linear-gradient(135deg, rgba(22,163,74,0.08), #fff)'
            : 'linear-gradient(135deg, rgba(255,107,53,0.08), #fff)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Conclusão do cadastro
          </Typography.Text>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              marginTop: 4,
            }}
          >
            <Typography.Title level={2} style={{ margin: 0, lineHeight: 1 }}>
              {percent}%
            </Typography.Title>
            <Tag color={percent >= 100 ? 'success' : 'processing'}>
              {completed}/{total} etapas
            </Tag>
          </div>
          <Typography.Paragraph
            type="secondary"
            style={{ margin: '8px 0 0', maxWidth: 420 }}
          >
            {percent >= 100
              ? 'Cadastro completo. Seu restaurante está pronto para receber clientes.'
              : 'Complete os itens abaixo para deixar o perfil mais atrativo e confiável.'}
          </Typography.Paragraph>
        </div>

        <div style={{ width: 120 }}>
          <Progress
            type="circle"
            percent={percent}
            size={100}
            status={progressStatus(percent)}
            strokeColor={percent >= 100 ? '#16a34a' : '#ff6b35'}
          />
        </div>
      </div>

      {!compact && missing.length > 0 ? (
        <div style={{ marginTop: 16 }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            Pendências
          </Typography.Text>
          <div style={{ display: 'grid', gap: 8 }}>
            {missing.map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.75)',
                  border: '1px solid var(--sf-border)',
                }}
              >
                <Circle size={16} color="var(--sf-coral)" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.href ? (
                  <Link to={item.href} style={{ color: 'var(--sf-coral)', fontWeight: 600 }}>
                    Completar
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!compact && percent >= 100 ? (
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#16a34a',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          Tudo certo por aqui
        </div>
      ) : null}
    </div>
  );
}
