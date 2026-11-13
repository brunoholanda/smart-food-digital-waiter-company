import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd';
import { Printer, Plus, QrCode, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';
import * as tablesApi from '../api/tables';
import { LoadingScreen } from '../components/LoadingScreen';
import { PendingApproval } from '../components/PendingApproval';
import { StatusBanner } from '../components/StatusBanner';
import { SectionTitle } from '../components/ImageUpload';
import { useRestaurant } from '../hooks/useRestaurant';
import type { Table, TablesListResponse } from '../types';
import { getApiErrorMessage } from '../utils/format';

export function TablesQrPage() {
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const [data, setData] = useState<TablesListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [bulkForm] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await tablesApi.listTables();
      setData(result);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Não foi possível carregar as mesas'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (restaurant?.status === 'APPROVED') {
      void load();
    } else {
      setLoading(false);
    }
  }, [restaurant?.status, load]);

  if (restaurantLoading && !restaurant) return <LoadingScreen tip="Carregando..." />;
  if (!restaurant) {
    return <Typography.Text>Restaurante não encontrado</Typography.Text>;
  }

  if (restaurant.status !== 'APPROVED') {
    return (
      <div className="sf-fade-in">
        <SectionTitle
          title="QR / Mesas"
          subtitle="Gere códigos QR para cada mesa e habilite pedidos na cozinha."
        />
        <StatusBanner status={restaurant.status} rejectionReason={restaurant.rejectionReason} />
        <PendingApproval
          title="QR Codes disponíveis após aprovação"
          subtitle="Assim que o cadastro for aprovado, você poderá criar mesas e imprimir os códigos QR para pedidos no salão."
        />
      </div>
    );
  }

  if (loading && !data) return <LoadingScreen tip="Carregando mesas..." />;

  const tables = data?.tables ?? [];
  const menuUrl = data?.menuUrl ?? `${window.location.origin}/m/${restaurant.slug}`;
  const shortMenuPath = `/m/${restaurant.slug}`;

  const createSingle = async () => {
    const values = await createForm.validateFields();
    setSaving(true);
    try {
      await tablesApi.createTable({
        number: values.number,
        label: values.label || undefined,
      });
      message.success(`Mesa ${values.number} criada`);
      setCreateOpen(false);
      createForm.resetFields();
      await load();
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Erro ao criar mesa'));
    } finally {
      setSaving(false);
    }
  };

  const createBulk = async () => {
    const values = await bulkForm.validateFields();
    setSaving(true);
    try {
      const result = await tablesApi.bulkCreateTables({
        from: values.from,
        to: values.to,
      });
      message.success(
        result.created
          ? `${result.created} mesa(s) criada(s)`
          : 'Nenhuma mesa nova (números já existiam)',
      );
      setBulkOpen(false);
      bulkForm.resetFields();
      await load();
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Erro ao criar mesas'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (table: Table, isActive: boolean) => {
    try {
      await tablesApi.updateTable(table.id, { isActive });
      message.success(isActive ? 'Mesa ativada' : 'Mesa desativada');
      await load();
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Erro ao atualizar mesa'));
    }
  };

  const removeTable = async (id: string) => {
    try {
      await tablesApi.deleteTable(id);
      message.success('Mesa removida');
      await load();
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Erro ao remover mesa'));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sf-fade-in">
      <SectionTitle
        title="QR / Mesas"
        subtitle="Gere e imprima os QR Codes das mesas para habilitar pedidos no salão."
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button icon={<Plus size={16} />} type="primary" onClick={() => setCreateOpen(true)}>
              Nova mesa
            </Button>
            <Button onClick={() => setBulkOpen(true)}>Criar em lote</Button>
            <Button icon={<Printer size={16} />} onClick={handlePrint} disabled={!tables.length}>
              Imprimir
            </Button>
          </div>
        }
      />

      <StatusBanner status={restaurant.status} rejectionReason={restaurant.rejectionReason} />

      <Alert
        className="sf-no-print"
        type="warning"
        showIcon
        icon={<QrCode size={18} />}
        style={{ marginBottom: 16, borderRadius: 14 }}
        message="Pedidos na mesa só funcionam com o QR/link da mesa"
        description={
          <div>
            <p style={{ margin: '0 0 8px' }}>
              Para o cliente pedir pela mesa e o pedido chegar na cozinha, use o{' '}
              <strong>QR Code gerado abaixo para cada mesa</strong> (ou o link{' '}
              <Typography.Text code>/m/.../mesa/...</Typography.Text>).
            </p>
            <p style={{ margin: 0 }}>
              O link do <strong>cardápio geral</strong> é só para visualizar o menu —{' '}
              <strong>não abre pedido na mesa</strong>.
            </p>
          </div>
        }
      />

      <div className="sf-surface sf-no-print" style={{ padding: 18, marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              padding: 12,
              background: '#fff',
              borderRadius: 16,
              border: '1px solid var(--sf-border)',
            }}
          >
            <QRCodeSVG value={menuUrl} size={112} level="M" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="sf-display" style={{ fontSize: 20 }}>
                Cardápio geral
              </div>
              <Tag>Somente visualização</Tag>
            </div>
            <Typography.Text type="secondary" style={{ display: 'block', margin: '8px 0' }}>
              Ideal para Instagram, WhatsApp ou balcão. Neste link o cliente{' '}
              <strong>não</strong> consegue enviar pedido para a cozinha.
            </Typography.Text>
            <Typography.Text code style={{ wordBreak: 'break-all' }}>
              {shortMenuPath}
            </Typography.Text>
            <div style={{ marginTop: 10 }}>
              <Tag color={data?.tableOrderingEnabled ? 'success' : 'default'}>
                {data?.tableOrderingEnabled
                  ? 'Pedidos por mesa ativos (use os QRs das mesas)'
                  : 'Crie mesas para gerar links de pedido'}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      <div className="sf-no-print" style={{ marginBottom: 12 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          QRs das mesas (para pedidos)
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: '6px 0 0' }}>
          Imprima e cole estes códigos nas mesas. Cada um identifica a mesa e libera o pedido.
        </Typography.Paragraph>
      </div>

      {tables.length === 0 ? (
        <div className="sf-surface sf-no-print" style={{ padding: 24 }}>
          <Empty
            description={
              <span>
                Nenhuma mesa cadastrada. Crie a primeira para gerar o QR/link de pedido na mesa.
              </span>
            }
          />
        </div>
      ) : (
        <div
          className="sf-no-print"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          {tables.map((table) => (
            <div key={table.id} className="sf-surface" style={{ padding: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <div>
                  <div className="sf-display" style={{ fontSize: 22 }}>
                    Mesa {table.number}
                  </div>
                  {table.label ? (
                    <Typography.Text type="secondary">{table.label}</Typography.Text>
                  ) : null}
                </div>
                <Switch
                  checked={table.isActive}
                  onChange={(checked) => void toggleActive(table, checked)}
                  checkedChildren="Ativa"
                  unCheckedChildren="Off"
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  padding: 12,
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid var(--sf-border)',
                  opacity: table.isActive ? 1 : 0.45,
                }}
              >
                <QRCodeSVG value={table.menuUrl} size={140} level="M" />
              </div>
              <Tag color="orange" style={{ marginTop: 10 }}>
                Link de pedido da mesa
              </Tag>
              <Typography.Text
                type="secondary"
                style={{
                  display: 'block',
                  marginTop: 8,
                  fontSize: 12,
                  wordBreak: 'break-all',
                }}
              >
                /m/{data?.slug}/mesa/{table.code}
              </Typography.Text>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <Popconfirm
                  title="Remover esta mesa?"
                  okText="Remover"
                  cancelText="Cancelar"
                  onConfirm={() => void removeTable(table.id)}
                >
                  <Button danger type="text" icon={<Trash2 size={16} />}>
                    Excluir
                  </Button>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable sheet */}
      <div className="sf-print-only">
        <div className="sf-print-sheet">
          <div className="sf-print-card sf-print-card--menu">
            <div className="sf-print-card__brand">{data?.tradeName ?? restaurant.tradeName}</div>
            <div className="sf-print-card__title">Cardápio</div>
            <QRCodeSVG value={menuUrl} size={160} level="M" />
            <div className="sf-print-card__url">{shortMenuPath}</div>
            <div className="sf-print-card__hint">Somente visualização</div>
          </div>
          {tables
            .filter((t) => t.isActive)
            .map((table) => (
              <div key={table.id} className="sf-print-card">
                <div className="sf-print-card__brand">
                  {data?.tradeName ?? restaurant.tradeName}
                </div>
                <div className="sf-print-card__title">Mesa {table.number}</div>
                {table.label ? (
                  <div className="sf-print-card__label">{table.label}</div>
                ) : null}
                <QRCodeSVG value={table.menuUrl} size={160} level="M" />
                <div className="sf-print-card__url">
                  /m/{data?.slug}/mesa/{table.code}
                </div>
                <div className="sf-print-card__hint">Escaneie para pedir nesta mesa</div>
              </div>
            ))}
        </div>
      </div>

      <Modal
        title="Nova mesa"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => void createSingle()}
        confirmLoading={saving}
        okText="Criar"
        cancelText="Cancelar"
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            name="number"
            label="Número da mesa"
            rules={[{ required: true, message: 'Informe o número' }]}
          >
            <InputNumber min={1} max={9999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="label" label="Rótulo (opcional)">
            <Input placeholder="Ex.: Varanda, VIP..." maxLength={40} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Criar mesas em lote"
        open={bulkOpen}
        onCancel={() => setBulkOpen(false)}
        onOk={() => void createBulk()}
        confirmLoading={saving}
        okText="Criar"
        cancelText="Cancelar"
      >
        <Typography.Paragraph type="secondary">
          Cria mesas numeradas no intervalo (números já existentes são ignorados). Máx. 200 por
          vez.
        </Typography.Paragraph>
        <Form form={bulkForm} layout="vertical">
          <Form.Item
            name="from"
            label="De"
            rules={[{ required: true, message: 'Informe o início' }]}
          >
            <InputNumber min={1} max={9999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="to"
            label="Até"
            rules={[{ required: true, message: 'Informe o fim' }]}
          >
            <InputNumber min={1} max={9999} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
