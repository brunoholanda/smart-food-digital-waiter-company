import {
  App,
  Button,
  Card,
  Form,
  Input,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import { Plus, RefreshCw, Trash2, Webhook } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import * as webhooksApi from '../api/webhooks';
import type { WebhookEndpoint } from '../api/webhooks';
import { PendingApproval } from '../components/PendingApproval';
import { useRestaurant } from '../hooks/useRestaurant';

export function WebhooksPage() {
  const { message, modal } = App.useApp();
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const [items, setItems] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await webhooksApi.listWebhooks());
    } catch {
      message.error('Não foi possível carregar webhooks');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    if (restaurant?.status === 'APPROVED') void load();
  }, [restaurant?.status, load]);

  if (restaurantLoading) return null;
  if (restaurant?.status !== 'APPROVED') {
    return <PendingApproval />;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Typography.Title level={2} style={{ marginBottom: 6 }}>
          Webhooks
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Receba eventos de novos pedidos (`kitchen.order.created`) em tempo real.
          A rota `/cozinha` já escuta esse canal via WebSocket; use URL externa
          para integrar impressoras, ERPs ou automações.
        </Typography.Paragraph>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            setCreating(true);
            try {
              const created = await webhooksApi.createWebhook({
                url: values.url,
                description: values.description,
                events: ['kitchen.order.created', 'kitchen.order.updated'],
              });
              message.success('Webhook criado');
              modal.info({
                title: 'Segredo do webhook',
                content: (
                  <div>
                    <p>Guarde este segredo para validar a assinatura HMAC:</p>
                    <Typography.Text code copyable>
                      {created.secret}
                    </Typography.Text>
                    <p style={{ marginTop: 12 }}>
                      Header: <code>X-SmartFood-Signature: sha256=...</code>
                    </p>
                  </div>
                ),
              });
              form.resetFields();
              await load();
            } catch {
              message.error('Falha ao criar webhook');
            } finally {
              setCreating(false);
            }
          }}
        >
          <Space.Compact style={{ width: '100%' }} direction="vertical">
            <Form.Item
              name="url"
              label="URL de destino"
              rules={[
                { required: true, message: 'Informe a URL' },
                { type: 'url', message: 'URL inválida' },
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input
                prefix={<Webhook size={16} />}
                placeholder="https://seu-sistema.com/hooks/smartfood"
                size="large"
              />
            </Form.Item>
            <Form.Item name="description" label="Descrição" style={{ marginBottom: 12 }}>
              <Input placeholder="Ex.: integração impressora / n8n" />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<Plus size={16} />} loading={creating}>
              Adicionar webhook
            </Button>
          </Space.Compact>
        </Form>
      </Card>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={false}
        columns={[
          {
            title: 'URL',
            dataIndex: 'url',
            render: (url: string, row) => (
              <div>
                <div style={{ fontWeight: 600 }}>{url}</div>
                <Typography.Text type="secondary">
                  {row.description || 'Sem descrição'}
                </Typography.Text>
              </div>
            ),
          },
          {
            title: 'Eventos',
            dataIndex: 'events',
            render: (events: string[]) =>
              events.map((e) => (
                <Tag key={e} color="orange">
                  {e}
                </Tag>
              )),
          },
          {
            title: 'Ativo',
            dataIndex: 'isActive',
            width: 100,
            render: (active: boolean, row) => (
              <Switch
                checked={active}
                onChange={async (checked) => {
                  try {
                    await webhooksApi.updateWebhook(row.id, { isActive: checked });
                    await load();
                  } catch {
                    message.error('Falha ao atualizar');
                  }
                }}
              />
            ),
          },
          {
            title: 'Ações',
            width: 180,
            render: (_, row) => (
              <Space>
                <Button
                  icon={<RefreshCw size={14} />}
                  onClick={async () => {
                    try {
                      const rotated = await webhooksApi.rotateWebhookSecret(row.id);
                      modal.info({
                        title: 'Novo segredo',
                        content: (
                          <Typography.Text code copyable>
                            {rotated.secret}
                          </Typography.Text>
                        ),
                      });
                      await load();
                    } catch {
                      message.error('Falha ao rotacionar segredo');
                    }
                  }}
                />
                <Button
                  danger
                  icon={<Trash2 size={14} />}
                  onClick={() => {
                    modal.confirm({
                      title: 'Remover webhook?',
                      onOk: async () => {
                        await webhooksApi.deleteWebhook(row.id);
                        await load();
                      },
                    });
                  }}
                />
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
