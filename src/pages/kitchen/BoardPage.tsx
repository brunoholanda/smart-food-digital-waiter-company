import { Button, Spin, Tag, Tooltip } from 'antd';
import { RefreshCw, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EditOrderModal } from '../../components/kitchen/EditOrderModal';
import { KanbanColumn } from '../../components/kitchen/KanbanColumn';
import { ServiceCallsPanel } from '../../components/kitchen/ServiceCallsPanel';
import { SettleBillModal } from '../../components/kitchen/SettleBillModal';
import { StatsBar } from '../../components/kitchen/StatsBar';
import { useKitchenOrders } from '../../hooks/useKitchenOrders';
import type { KitchenOrder } from '../../types';

export function BoardPage() {
  const {
    byStatus,
    serviceCalls,
    highlightedTableNumbers,
    stats,
    loading,
    updatingId,
    flashIds,
    callFlashIds,
    connected,
    refresh,
    updateStatus,
    updateOrder,
    updateServiceCall,
    soundEnabled,
    audioReady,
    toggleSound,
    unlockAudio,
  } = useKitchenOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [editingOrder, setEditingOrder] = useState<KitchenOrder | null>(null);
  const [focusTable, setFocusTable] = useState<number | null>(null);
  const [settleTable, setSettleTable] = useState<{
    tableId: string;
    tableNumber: number;
  } | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh(true);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredByStatus = useMemo(() => {
    if (focusTable == null) return byStatus;
    const match = (order: KitchenOrder) =>
      (order.tableNumber ?? order.table?.number) === focusTable;
    return {
      QUEUED: byStatus.QUEUED.filter(match),
      PREPARING: byStatus.PREPARING.filter(match),
      READY: byStatus.READY.filter(match),
    };
  }, [byStatus, focusTable]);

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
          {focusTable != null ? (
            <Tag
              color="warning"
              closable
              onClose={() => setFocusTable(null)}
              style={{ marginInlineEnd: 0 }}
            >
              Filtrando mesa {focusTable}
            </Tag>
          ) : null}
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

      <ServiceCallsPanel
        calls={serviceCalls}
        flashIds={callFlashIds}
        updatingId={updatingId}
        onAcknowledge={(id) => updateServiceCall(id, 'ACKNOWLEDGED')}
        onResolve={(id) => updateServiceCall(id, 'RESOLVED')}
        onFocusOrder={(_orderId, tableNumber) => setFocusTable(tableNumber)}
        onSettleBill={(tableId, tableNumber) =>
          setSettleTable({ tableId, tableNumber })
        }
      />

      <div className="kanban-board">
        <KanbanColumn
          title="Na fila"
          accent="queued"
          count={filteredByStatus.QUEUED.length}
          orders={filteredByStatus.QUEUED}
          flashIds={flashIds}
          highlightedTableNumbers={highlightedTableNumbers}
          updatingId={updatingId}
          onUpdateStatus={updateStatus}
          onEditOrder={setEditingOrder}
        />
        <KanbanColumn
          title="Preparando"
          accent="preparing"
          count={filteredByStatus.PREPARING.length}
          orders={filteredByStatus.PREPARING}
          flashIds={flashIds}
          highlightedTableNumbers={highlightedTableNumbers}
          updatingId={updatingId}
          onUpdateStatus={updateStatus}
          onEditOrder={setEditingOrder}
        />
        <KanbanColumn
          title="Pronto"
          accent="ready"
          count={filteredByStatus.READY.length}
          orders={filteredByStatus.READY}
          flashIds={flashIds}
          highlightedTableNumbers={highlightedTableNumbers}
          updatingId={updatingId}
          onUpdateStatus={updateStatus}
          onEditOrder={setEditingOrder}
        />
      </div>

      <EditOrderModal
        open={Boolean(editingOrder)}
        order={editingOrder}
        saving={updatingId === editingOrder?.id}
        onClose={() => setEditingOrder(null)}
        onSave={async (payload) => {
          if (!editingOrder) return;
          await updateOrder(editingOrder.id, payload);
          setEditingOrder(null);
        }}
      />

      <SettleBillModal
        open={Boolean(settleTable)}
        tableId={settleTable?.tableId ?? null}
        tableNumber={settleTable?.tableNumber}
        onClose={() => setSettleTable(null)}
        onSettled={() => {
          void refresh(true);
        }}
      />
    </div>
  );
}
