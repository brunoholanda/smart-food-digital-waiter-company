import { App, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import * as kitchenApi from '../../api/kitchen';
import type { KitchenOrder } from '../../types';
import {
  formatCurrency,
  formatDateTime,
  getApiErrorMessage,
  kitchenStatusLabel,
} from '../../utils/format';

export function HistoryPage() {
  const { message } = App.useApp();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await kitchenApi.getKitchenHistory();
        if (active) setOrders(data);
      } catch (err) {
        message.error(getApiErrorMessage(err, 'Falha ao carregar histórico'));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [message]);

  const columns: ColumnsType<KitchenOrder> = [
    {
      title: 'Mesa',
      key: 'mesa',
      width: 90,
      render: (_, row) => (
        <strong className="history-mesa">
          {row.tableNumber ?? row.table?.number ?? '—'}
        </strong>
      ),
    },
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => `#${code}`,
    },
    {
      title: 'Cliente',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string | null | undefined) => name || '—',
    },
    {
      title: 'Itens',
      key: 'items',
      render: (_, row) =>
        row.items?.map((i) => `${i.quantity}× ${i.name}`).join(', ') || '—',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number | string) => formatCurrency(total),
    },
    {
      title: 'Status',
      dataIndex: 'kitchenStatus',
      key: 'kitchenStatus',
      render: (status: KitchenOrder['kitchenStatus']) => (
        <Tag color={status === 'DELIVERED' ? 'success' : 'error'}>
          {kitchenStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Atualizado',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value: string | undefined) => formatDateTime(value),
    },
  ];

  if (loading) {
    return (
      <div className="kitchen-loading inline">
        <Spin size="large" tip="Carregando histórico..." />
      </div>
    );
  }

  return (
    <div className="history-page">
      <Typography.Title level={3} className="page-title">
        Histórico da cozinha
      </Typography.Title>
      <Typography.Paragraph className="page-subtitle">
        Últimos pedidos entregues ou cancelados.
      </Typography.Paragraph>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 900 }}
        className="history-table"
      />
    </div>
  );
}
