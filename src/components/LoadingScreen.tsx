import { Spin } from 'antd';

export function LoadingScreen({ tip = 'Carregando...' }: { tip?: string }) {
  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'grid',
        placeItems: 'center',
        padding: 32,
      }}
    >
      <Spin size="large" tip={tip} />
    </div>
  );
}
