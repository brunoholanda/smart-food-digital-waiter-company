import { App, Button, Modal, Radio, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import * as kitchenApi from '../../api/kitchen';
import type { PaymentMethod, TableBill } from '../../types';
import { formatCurrency, getApiErrorMessage } from '../../utils/format';

interface SettleBillModalProps {
  open: boolean;
  tableId: string | null;
  tableNumber?: number | null;
  onClose: () => void;
  onSettled: () => void;
}

export function SettleBillModal({
  open,
  tableId,
  tableNumber,
  onClose,
  onSettled,
}: SettleBillModalProps) {
  const { message } = App.useApp();
  const [bill, setBill] = useState<TableBill | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('PIX');

  useEffect(() => {
    if (!open || !tableId) return;
    let active = true;
    setLoading(true);
    void kitchenApi
      .getTableBill(tableId)
      .then((data) => {
        if (active) setBill(data);
      })
      .catch((err) => {
        message.error(getApiErrorMessage(err, 'Não foi possível carregar a conta'));
        onClose();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, tableId, message, onClose]);

  const handleSettle = async () => {
    if (!tableId) return;
    setSaving(true);
    try {
      const result = await kitchenApi.settleTableBill(tableId, { method });
      message.success(
        result.tableFinalized
          ? `Conta da mesa ${result.bill.tableNumber} recebida · mesa finalizada`
          : `Conta da mesa ${result.bill.tableNumber} recebida · ${result.settledCount} pedido(s)`,
      );
      onSettled();
      onClose();
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Não foi possível registrar o pagamento'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={`Fechar conta · Mesa ${tableNumber ?? bill?.tableNumber ?? '—'}`}
      centered
      width={560}
      destroyOnHidden
      footer={[
        <Button key="close" onClick={onClose} disabled={saving}>
          Voltar
        </Button>,
        <Button
          key="settle"
          type="primary"
          loading={saving}
          disabled={loading || !bill || bill.openOrderCount === 0}
          onClick={() => void handleSettle()}
        >
          Confirmar recebimento
        </Button>,
      ]}
    >
      {loading ? (
        <Typography.Paragraph>Carregando pedidos em aberto...</Typography.Paragraph>
      ) : bill ? (
        <div className="settle-bill-modal">
          <div className="settle-bill-total">
            <span>Total a receber</span>
            <strong>{formatCurrency(bill.total)}</strong>
          </div>
          <Typography.Paragraph type="secondary">
            {bill.openOrderCount} pedido(s) em aberto. Confira com o cliente e registre a
            forma de pagamento recebida na mesa.
          </Typography.Paragraph>

          <div className="settle-bill-orders">
            {bill.orders.map((order) => (
              <div key={order.id} className="settle-bill-order">
                <div className="settle-bill-order__head">
                  <strong>{order.code}</strong>
                  <span>{formatCurrency(order.total)}</span>
                </div>
                {order.items.map((item) => (
                  <div key={item.id} className="settle-bill-order__item">
                    {item.quantity}× {item.name}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <Typography.Text strong>Forma recebida</Typography.Text>
          <Radio.Group
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ display: 'block', marginTop: 8 }}
          >
            <Space direction="vertical">
              <Radio value="PIX">PIX</Radio>
              <Radio value="CARD">Cartão</Radio>
              <Radio value="CASH">Dinheiro</Radio>
            </Space>
          </Radio.Group>
        </div>
      ) : null}
    </Modal>
  );
}
