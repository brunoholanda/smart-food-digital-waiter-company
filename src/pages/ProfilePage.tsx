import {
  Button,
  Form,
  Input,
  Select,
  Switch,
  TimePicker,
  Typography,
  message,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { lookupCep } from '../api/cep';
import * as restaurantsApi from '../api/restaurants';
import { SectionTitle } from '../components/ImageUpload';
import { LoadingScreen } from '../components/LoadingScreen';
import { ProfileCompletionCard } from '../components/ProfileCompletionCard';
import { RestaurantCoverCard } from '../components/RestaurantCoverCard';
import { StatusBanner } from '../components/StatusBanner';
import { useRestaurant } from '../hooks/useRestaurant';
import type { UpdateRestaurantPayload } from '../types';
import { CUISINE_OPTIONS } from '../utils/cuisine';
import { WEEKDAYS, getApiErrorMessage } from '../utils/format';
import {
  isValidCpfCnpj,
  isValidPhone,
  maskCep,
  maskCpfCnpj,
  maskPhone,
  onlyDigits,
} from '../utils/masks';

interface HoursRow {
  dayOfWeek: number;
  opensAt: Dayjs | null;
  closesAt: Dayjs | null;
  isClosed: boolean;
}

export function ProfilePage() {
  const { restaurant, loading, refresh, setRestaurant } = useRestaurant();
  const [form] = Form.useForm<UpdateRestaurantPayload>();
  const [saving, setSaving] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [hours, setHours] = useState<HoursRow[]>([]);
  const lastFetchedCep = useRef('');

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!restaurant) return;
    form.setFieldsValue({
      tradeName: restaurant.tradeName,
      legalName: restaurant.legalName ?? undefined,
      document: restaurant.document
        ? maskCpfCnpj(restaurant.document)
        : undefined,
      phone: restaurant.phone ? maskPhone(restaurant.phone) : undefined,
      whatsapp: restaurant.whatsapp
        ? maskPhone(restaurant.whatsapp)
        : undefined,
      description: restaurant.description ?? undefined,
      cuisineType: restaurant.cuisineType,
      street: restaurant.street ?? undefined,
      number: restaurant.number ?? undefined,
      complement: restaurant.complement ?? undefined,
      neighborhood: restaurant.neighborhood ?? undefined,
      city: restaurant.city ?? undefined,
      state: restaurant.state ?? undefined,
      zipCode: restaurant.zipCode ? maskCep(restaurant.zipCode) : undefined,
      instagram: restaurant.instagram ?? undefined,
      website: restaurant.website ?? undefined,
      acceptsDelivery: restaurant.acceptsDelivery,
      acceptsPickup: restaurant.acceptsPickup,
      acceptsDineIn: restaurant.acceptsDineIn,
      isPublished: restaurant.isPublished,
    });

    const mapped: HoursRow[] = Array.from({ length: 7 }, (_, dayOfWeek) => {
      const existing = restaurant.openingHours?.find((h) => h.dayOfWeek === dayOfWeek);
      return {
        dayOfWeek,
        opensAt: dayjs(existing?.opensAt || '11:00', 'HH:mm'),
        closesAt: dayjs(existing?.closesAt || '23:00', 'HH:mm'),
        isClosed: existing?.isClosed ?? dayOfWeek === 1,
      };
    });
    setHours(mapped);
  }, [restaurant, form]);

  if (loading && !restaurant) return <LoadingScreen />;
  if (!restaurant) {
    return <Typography.Text>Restaurante não encontrado</Typography.Text>;
  }

  const approved = restaurant.status === 'APPROVED';

  const handleCepLookup = async (rawCep: string) => {
    const digits = onlyDigits(rawCep);
    if (digits.length !== 8 || digits === lastFetchedCep.current) return;

    setCepLoading(true);
    try {
      const address = await lookupCep(digits);
      lastFetchedCep.current = digits;
      form.setFieldsValue({
        zipCode: address.zipCode,
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        ...(address.complement ? { complement: address.complement } : {}),
      });
      message.success('Endereço encontrado pelo CEP');
    } catch (err) {
      lastFetchedCep.current = '';
      message.warning(
        err instanceof Error ? err.message : 'Não foi possível buscar o CEP',
      );
    } finally {
      setCepLoading(false);
    }
  };

  const onSaveProfile = async (values: UpdateRestaurantPayload) => {
    setSaving(true);
    try {
      const payload: UpdateRestaurantPayload = {
        ...values,
        document: values.document ? onlyDigits(values.document) : values.document,
        phone: values.phone ? onlyDigits(values.phone) : values.phone,
        whatsapp: values.whatsapp ? onlyDigits(values.whatsapp) : values.whatsapp,
        zipCode: values.zipCode ? onlyDigits(values.zipCode) : values.zipCode,
        state: values.state?.toUpperCase(),
      };
      const updated = await restaurantsApi.updateMyRestaurant(payload);
      setRestaurant({ ...restaurant, ...updated });
      message.success('Perfil atualizado');
      await refresh();
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Erro ao salvar perfil'));
    } finally {
      setSaving(false);
    }
  };

  const onSaveHours = async () => {
    setSavingHours(true);
    try {
      const payload = {
        hours: hours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          opensAt: h.opensAt?.format('HH:mm') || '11:00',
          closesAt: h.closesAt?.format('HH:mm') || '23:00',
          isClosed: h.isClosed,
        })),
      };
      const updated = await restaurantsApi.updateOpeningHours(payload);
      setRestaurant(updated);
      message.success('Horários atualizados');
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Erro ao salvar horários'));
    } finally {
      setSavingHours(false);
    }
  };

  const updateHour = (dayOfWeek: number, patch: Partial<HoursRow>) => {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h)),
    );
  };

  return (
    <div className="sf-fade-in">
      <SectionTitle
        title="Perfil do restaurante"
        subtitle="Identidade visual, dados de contato, endereço e horários."
      />
      <StatusBanner status={restaurant.status} rejectionReason={restaurant.rejectionReason} />

      <ProfileCompletionCard restaurant={restaurant} />

      <RestaurantCoverCard
        restaurant={restaurant}
        onUpdated={(updated) => {
          setRestaurant(updated);
          void refresh();
        }}
        footerNote={
          !approved ? (
            <Typography.Paragraph type="secondary" style={{ margin: '6px 0 0' }}>
              Você já pode ajustar logo e banner para agilizar a análise.
            </Typography.Paragraph>
          ) : null
        }
      />

      <div className="sf-surface" style={{ padding: 20, marginBottom: 20 }}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          Dados gerais
        </Typography.Title>
        <Form form={form} layout="vertical" onFinish={onSaveProfile} requiredMark={false}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <Form.Item
              name="tradeName"
              label="Nome fantasia"
              rules={[{ required: true, min: 2 }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="legalName" label="Razão social">
              <Input />
            </Form.Item>
            <Form.Item
              name="document"
              label="CNPJ / CPF"
              getValueFromEvent={(e) => maskCpfCnpj(e.target.value)}
              rules={[
                {
                  validator: async (_, value) => {
                    if (!value || isValidCpfCnpj(value)) return;
                    throw new Error('CPF ou CNPJ inválido');
                  },
                },
              ]}
            >
              <Input maxLength={18} inputMode="numeric" placeholder="000.000.000-00" />
            </Form.Item>
            <Form.Item name="cuisineType" label="Cozinha">
              <Select options={CUISINE_OPTIONS} />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Telefone"
              getValueFromEvent={(e) => maskPhone(e.target.value)}
              rules={[
                { required: true, message: 'Informe o telefone' },
                {
                  validator: async (_, value) => {
                    if (!value || isValidPhone(value)) return;
                    throw new Error('Telefone inválido');
                  },
                },
              ]}
            >
              <Input maxLength={15} inputMode="tel" placeholder="(11) 99999-9999" />
            </Form.Item>
            <Form.Item
              name="whatsapp"
              label="WhatsApp"
              getValueFromEvent={(e) => maskPhone(e.target.value)}
              rules={[
                {
                  validator: async (_, value) => {
                    if (!value || isValidPhone(value)) return;
                    throw new Error('WhatsApp inválido');
                  },
                },
              ]}
            >
              <Input maxLength={15} inputMode="tel" placeholder="(11) 99999-9999" />
            </Form.Item>
            <Form.Item name="instagram" label="Instagram">
              <Input placeholder="@seu_restaurante" />
            </Form.Item>
            <Form.Item name="website" label="Site">
              <Input />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Typography.Title level={5}>Endereço</Typography.Title>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <Form.Item
              name="zipCode"
              label="CEP"
              getValueFromEvent={(e) => maskCep(e.target.value)}
              extra="Completar o CEP preenche o endereço (ViaCEP)"
            >
              <Input
                maxLength={9}
                inputMode="numeric"
                placeholder="00000-000"
                disabled={cepLoading}
                onChange={(e) => {
                  const digits = onlyDigits(e.target.value);
                  if (digits.length < 8) lastFetchedCep.current = '';
                  void handleCepLookup(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item name="street" label="Rua">
              <Input disabled={cepLoading} />
            </Form.Item>
            <Form.Item name="number" label="Número">
              <Input />
            </Form.Item>
            <Form.Item name="complement" label="Complemento">
              <Input />
            </Form.Item>
            <Form.Item name="neighborhood" label="Bairro">
              <Input disabled={cepLoading} />
            </Form.Item>
            <Form.Item name="city" label="Cidade">
              <Input disabled={cepLoading} />
            </Form.Item>
            <Form.Item name="state" label="UF">
              <Input maxLength={2} disabled={cepLoading} style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
            <Form.Item name="acceptsDelivery" label="Delivery" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="acceptsPickup" label="Retirada" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="acceptsDineIn" label="No local" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isPublished" label="Publicado" valuePropName="checked">
              <Switch disabled={!approved} />
            </Form.Item>
          </div>

          <Button type="primary" htmlType="submit" loading={saving} size="large">
            Salvar perfil
          </Button>
        </Form>
      </div>

      <div className="sf-surface" style={{ padding: 20 }}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          Horário de funcionamento
        </Typography.Title>
        <div style={{ display: 'grid', gap: 12 }}>
          {hours.map((hour) => (
            <div
              key={hour.dayOfWeek}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(90px, 120px) 1fr',
                gap: 12,
                alignItems: 'center',
                paddingBottom: 10,
                borderBottom: '1px solid var(--sf-border)',
              }}
            >
              <div style={{ fontWeight: 600 }}>{WEEKDAYS[hour.dayOfWeek]}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Switch
                  checked={!hour.isClosed}
                  onChange={(open) => updateHour(hour.dayOfWeek, { isClosed: !open })}
                  checkedChildren="Aberto"
                  unCheckedChildren="Fechado"
                />
                <TimePicker
                  format="HH:mm"
                  value={hour.opensAt}
                  disabled={hour.isClosed}
                  onChange={(v) => updateHour(hour.dayOfWeek, { opensAt: v })}
                />
                <span style={{ color: 'var(--sf-text-muted)' }}>até</span>
                <TimePicker
                  format="HH:mm"
                  value={hour.closesAt}
                  disabled={hour.isClosed}
                  onChange={(v) => updateHour(hour.dayOfWeek, { closesAt: v })}
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          type="primary"
          size="large"
          style={{ marginTop: 16 }}
          loading={savingHours}
          onClick={() => void onSaveHours()}
        >
          Salvar horários
        </Button>
      </div>
    </div>
  );
}
