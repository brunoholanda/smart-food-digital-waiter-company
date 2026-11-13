import { App, Button, Input, InputNumber, Modal, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { KitchenOrder } from '../../types';
import { formatCurrency, toNumber } from '../../utils/format';

interface EditLine {
  id: string;
  name: string;
  quantity: number;
  notes: string;
  unitPrice: number;
}

interface EditOrderModalProps {
  open: boolean;
  order: KitchenOrder | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: {
    notes?: string;
    items: Array<{ id: string; quantity: number; notes?: string }>;
  }) => Promise<void>;
}

export function EditOrderModal({
  open,
  order,
  saving = false,
  onClose,
  onSave,
}: EditOrderModalProps) {
  const { modal } = App.useApp();
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<EditLine[]>([]);

  useEffect(() => {
    if (!order || !open) return;
    setNotes(order.notes ?? '');
    setLines(
      (order.items ?? [])
        .filter((item) => Boolean(item.id))
        .map((item) => ({
          id: item.id as string,
          name: item.name,
          quantity: item.quantity,
          notes: item.notes ?? '',
          unitPrice: toNumber(item.unitPrice ?? item.lineTotal) / Math.max(item.quantity, 1),
        })),
    );
  }, [order, open]);

  const total = useMemo(
    () => lines.reduce((acc, line) => acc + line.unitPrice * line.quantity, 0),
    [lines],
  );

  const updateQty = (id: string, quantity: number) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, quantity: Math.max(0, quantity) } : line,
      ),
    );
  };

  const updateNotes = (id: string, value: string) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, notes: value } : line)),
    );
  };

  const handleSave = async () => {
    if (!order) return;
    const remaining = lines.filter((line) => line.quantity > 0);
    if (remaining.length === 0) {
      modal.confirm({
        title: 'Cancelar pedido ao salvar?',
        content:
          'Todas as quantidades estão zeradas. Isso cancela o pedido e remove da fila.',
        okText: 'Sim, cancelar pedido',
        okButtonProps: { danger: true },
        cancelText: 'Voltar',
        centered: true,
        onOk: () =>
          onSave({
            notes,
            items: lines.map((line) => ({
              id: line.id,
              quantity: 0,
              notes: line.notes || undefined,
            })),
          }),
      });
      return;
    }

    await onSave({
      notes,
      items: lines.map((line) => ({
        id: line.id,
        quantity: line.quantity,
        notes: line.notes || undefined,
      })),
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={order ? `Alterar pedido ${order.code}` : 'Alterar pedido'}
      centered
      width={560}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onClose} disabled={saving}>
          Fechar
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={saving}
          onClick={() => void handleSave()}
        >
          Salvar alterações
        </Button>,
      ]}
    >
      {order ? (
        <div className="edit-order-modal">
          <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
            Mesa {order.tableNumber ?? order.table?.number ?? '—'} · ajuste itens ou
            cancele zerando as quantidades.
          </Typography.Paragraph>

          <div className="edit-order-lines">
            {lines.map((line) => (
              <div key={line.id} className="edit-order-line">
                <div className="edit-order-line__top">
                  <strong>{line.name}</strong>
                  <span>{formatCurrency(line.unitPrice * line.quantity)}</span>
                </div>
                <div className="edit-order-line__controls">
                  <InputNumber
                    min={0}
                    value={line.quantity}
                    onChange={(value) => updateQty(line.id, Number(value) || 0)}
                  />
                  <Input
                    value={line.notes}
                    onChange={(e) => updateNotes(line.id, e.target.value)}
                    placeholder="Obs. do item"
                    maxLength={160}
                  />
                </div>
              </div>
            ))}
          </div>

          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Observações do pedido
          </Typography.Text>
          <Input.TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={400}
            style={{ marginTop: 6, marginBottom: 12 }}
          />

          <div className="edit-order-total">
            <span>Total estimado</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
