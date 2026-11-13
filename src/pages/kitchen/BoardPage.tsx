import { Button, Spin, Tag, Tooltip } from 'antd';
import { RefreshCw, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { KanbanColumn } from '../../components/kitchen/KanbanColumn';
import { StatsBar } from '../../components/kitchen/StatsBar';
import { useKitchenOrders } from '../../hooks/useKitchenOrders';

export function BoardPage() {
  const {
    byStatus,
    stats,
    loading,
    updatingId,
    flashIds,
    connected,
    refresh,
    updateStatus,
    soundEnabled,
    audioReady,
    toggleSound,
    unlockAudio,
  } = useKitchenOrders();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh(true);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="kitchen-loading inline">
        <Spin size="large" tip="Carregando pedidos..." />
      </div>
    );
  }

  return (
    <div className="board-page">
      <div className="board-toolbar">
        <StatsBar stats={stats} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Tag
            color={connected ? 'success' : 'default'}
            icon={connected ? <Wifi size={14} /> : <WifiOff size={14} />}
            style={{ marginInlineEnd: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {connected ? 'Ao vivo' : 'Reconectando…'}
          </Tag>
          <Tooltip
            title={
              soundEnabled
                ? audioReady
                  ? 'Alerta sonoro ativo'
                  : 'Clique para liberar o áudio do navegador'
                : 'Alerta sonoro desligado'
            }
          >
            <Button
              size="large"
              type={soundEnabled ? 'primary' : 'default'}
              icon={soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              onClick={() => {
                if (soundEnabled && !audioReady) {
                  void unlockAudio();
                  return;
                }
                void toggleSound();
              }}
            >
              {soundEnabled ? 'Som' : 'Mudo'}
            </Button>
          </Tooltip>
          <Button
            size="large"
            icon={<RefreshCw size={18} />}
            loading={refreshing}
            onClick={() => void handleRefresh()}
          >
            Atualizar
          </Button>
        </div>
      </div>

      <div className="kanban-board">
        <KanbanColumn
          title="Na fila"
          accent="queued"
          count={byStatus.QUEUED.length}
          orders={byStatus.QUEUED}
          flashIds={flashIds}
          updatingId={updatingId}
          onUpdateStatus={updateStatus}
        />
        <KanbanColumn
          title="Preparando"
          accent="preparing"
          count={byStatus.PREPARING.length}
          orders={byStatus.PREPARING}
          flashIds={flashIds}
          updatingId={updatingId}
          onUpdateStatus={updateStatus}
        />
        <KanbanColumn
          title="Pronto"
          accent="ready"
          count={byStatus.READY.length}
          orders={byStatus.READY}
          flashIds={flashIds}
          updatingId={updatingId}
          onUpdateStatus={updateStatus}
        />
      </div>
    </div>
  );
}
