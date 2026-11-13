import {
  Alert,
  Button,
  Form,
  Input,
  Select,
  Steps,
  Typography,
  message,
} from 'antd';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { lookupCep } from '../api/cep';
import { EmailSuggestInput } from '../components/EmailSuggestInput';
import { useAuth } from '../hooks/AuthContext';
import type { CuisineType, RegisterPayload } from '../types';
import { CUISINE_OPTIONS } from '../utils/cuisine';
import { getApiErrorMessage } from '../utils/format';
import {
  isValidCpfCnpj,
  isValidPhone,
  maskCep,
  maskCpfCnpj,
  maskPhone,
  onlyDigits,
} from '../utils/masks';

interface OwnerStep {
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface RestaurantStep {
  tradeName: string;
  legalName?: string;
  document?: string;
  whatsapp?: string;
  cuisineType?: CuisineType;
  description?: string;
}

interface AddressStep {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownerForm] = Form.useForm<OwnerStep>();
  const [restaurantForm] = Form.useForm<RestaurantStep>();
  const [addressForm] = Form.useForm<AddressStep>();
  const [draft, setDraft] = useState<Partial<RegisterPayload>>({});
  const lastFetchedCep = useRef<string>('');

  const nextFromOwner = async () => {
    const values = await ownerForm.validateFields();
    if (values.password !== values.confirmPassword) {
      message.error('As senhas não coincidem');
      return;
    }
    setDraft((prev) => ({
      ...prev,
      ownerName: values.ownerName,
      email: values.email.trim().toLowerCase(),
      phone: onlyDigits(values.phone),
      password: values.password,
    }));
    setStep(1);
  };

  const nextFromRestaurant = async () => {
    const values = await restaurantForm.validateFields();
    setDraft((prev) => ({
      ...prev,
      ...values,
      document: values.document ? onlyDigits(values.document) : undefined,
      whatsapp: values.whatsapp ? onlyDigits(values.whatsapp) : undefined,
    }));
    setStep(2);
  };

  const handleCepLookup = async (rawCep: string) => {
    const digits = onlyDigits(rawCep);
    if (digits.length !== 8 || digits === lastFetchedCep.current) return;

    setCepLoading(true);
    try {
      const address = await lookupCep(digits);
      lastFetchedCep.current = digits;
      addressForm.setFieldsValue({
        zipCode: address.zipCode,
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        ...(address.complement
          ? { complement: address.complement }
          : {}),
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

  const submit = async () => {
    const address = await addressForm.validateFields();
    const payload: RegisterPayload = {
      ownerName: draft.ownerName!,
      email: draft.email!,
      password: draft.password!,
      phone: draft.phone!,
      tradeName: draft.tradeName!,
      legalName: draft.legalName,
      document: draft.document,
      whatsapp: draft.whatsapp || draft.phone,
      cuisineType: draft.cuisineType,
      description: draft.description,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state?.toUpperCase(),
      zipCode: address.zipCode ? onlyDigits(address.zipCode) : undefined,
    };

    setLoading(true);
    setError(null);
    try {
      await register(payload);
      message.success('Cadastro enviado! Aguarde a aprovação.');
      navigate('/app', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível concluir o cadastro'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sf-surface sf-rise" style={{ padding: 24 }}>
      <Typography.Title level={2} className="sf-display" style={{ marginTop: 0 }}>
        Cadastre seu restaurante
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Em poucos passos você cria o cardápio digital SmartFood.
      </Typography.Paragraph>

      <Steps
        current={step}
        size="small"
        style={{ marginBottom: 24 }}
        items={[
          { title: 'Você' },
          { title: 'Restaurante' },
          { title: 'Endereço' },
        ]}
      />

      {error ? (
        <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />
      ) : null}

      {step === 0 && (
        <Form form={ownerForm} layout="vertical" requiredMark={false}>
          <Form.Item
            name="ownerName"
            label="Seu nome"
            rules={[{ required: true, min: 2, message: 'Informe seu nome' }]}
          >
            <Input size="large" placeholder="Nome completo" />
          </Form.Item>
          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              { required: true, message: 'Informe o e-mail' },
              { type: 'email', message: 'E-mail inválido' },
            ]}
            extra="Digite @ e a primeira letra do provedor para ver sugestões"
          >
            <EmailSuggestInput
              size="large"
              placeholder="voce@gmail.com"
              autoComplete="email"
            />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Telefone"
            getValueFromEvent={(e) => maskPhone(e.target.value)}
            rules={[
              { required: true, message: 'Informe um telefone válido' },
              {
                validator: async (_, value) => {
                  if (!value || isValidPhone(value)) return;
                  throw new Error('Use DDD + número (10 ou 11 dígitos)');
                },
              },
            ]}
          >
            <Input
              size="large"
              placeholder="(11) 99999-9999"
              inputMode="tel"
              maxLength={15}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Senha"
            rules={[{ required: true, min: 6, message: 'Mínimo de 6 caracteres' }]}
          >
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirmar senha"
            rules={[{ required: true, message: 'Confirme a senha' }]}
          >
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" size="large" block onClick={() => void nextFromOwner()}>
            Continuar
          </Button>
        </Form>
      )}

      {step === 1 && (
        <Form
          form={restaurantForm}
          layout="vertical"
          requiredMark={false}
          initialValues={{ cuisineType: 'BRAZILIAN' }}
        >
          <Form.Item
            name="tradeName"
            label="Nome fantasia"
            rules={[{ required: true, min: 2, message: 'Informe o nome do restaurante' }]}
          >
            <Input size="large" placeholder="Ex.: Cantina do Bairro" />
          </Form.Item>
          <Form.Item name="legalName" label="Razão social">
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="document"
            label="CNPJ / CPF"
            getValueFromEvent={(e) => maskCpfCnpj(e.target.value)}
            rules={[
              {
                validator: async (_, value) => {
                  if (!value) return;
                  if (isValidCpfCnpj(value)) return;
                  throw new Error('CPF ou CNPJ inválido');
                },
              },
            ]}
          >
            <Input
              size="large"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              inputMode="numeric"
              maxLength={18}
            />
          </Form.Item>
          <Form.Item
            name="whatsapp"
            label="WhatsApp (se diferente do telefone)"
            getValueFromEvent={(e) => maskPhone(e.target.value)}
            rules={[
              {
                validator: async (_, value) => {
                  if (!value || isValidPhone(value)) return;
                  throw new Error('Use DDD + número (10 ou 11 dígitos)');
                },
              },
            ]}
          >
            <Input
              size="large"
              placeholder="(11) 99999-9999"
              inputMode="tel"
              maxLength={15}
            />
          </Form.Item>
          <Form.Item name="cuisineType" label="Tipo de cozinha">
            <Select
              size="large"
              options={CUISINE_OPTIONS}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="description" label="Descrição curta">
            <Input.TextArea rows={3} placeholder="Conte o que torna seu restaurante especial" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="large" block onClick={() => setStep(0)}>
              Voltar
            </Button>
            <Button type="primary" size="large" block onClick={() => void nextFromRestaurant()}>
              Continuar
            </Button>
          </div>
        </Form>
      )}

      {step === 2 && (
        <Form form={addressForm} layout="vertical" requiredMark={false}>
          <Form.Item
            name="zipCode"
            label="CEP"
            getValueFromEvent={(e) => maskCep(e.target.value)}
            rules={[
              {
                validator: async (_, value) => {
                  if (!value) return;
                  if (onlyDigits(value).length === 8) return;
                  throw new Error('CEP deve ter 8 dígitos');
                },
              },
            ]}
            extra="Ao completar o CEP, o endereço é preenchido automaticamente (ViaCEP)"
          >
            <Input
              size="large"
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
              disabled={cepLoading}
              onChange={(e) => {
                const digits = onlyDigits(e.target.value);
                if (digits.length < 8) lastFetchedCep.current = '';
                void handleCepLookup(e.target.value);
              }}
            />
          </Form.Item>
          <Form.Item name="street" label="Rua">
            <Input size="large" disabled={cepLoading} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="number" label="Número">
              <Input size="large" />
            </Form.Item>
            <Form.Item name="complement" label="Complemento">
              <Input size="large" />
            </Form.Item>
          </div>
          <Form.Item name="neighborhood" label="Bairro">
            <Input size="large" disabled={cepLoading} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 12 }}>
            <Form.Item name="city" label="Cidade">
              <Input size="large" disabled={cepLoading} />
            </Form.Item>
            <Form.Item name="state" label="UF">
              <Input
                size="large"
                maxLength={2}
                disabled={cepLoading}
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="large" block onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={() => void submit()}
            >
              Criar conta
            </Button>
          </div>
        </Form>
      )}

      <Typography.Paragraph style={{ marginTop: 20, marginBottom: 0, textAlign: 'center' }}>
        Já tem conta? <Link to="/login">Entrar</Link>
      </Typography.Paragraph>
    </div>
  );
}
