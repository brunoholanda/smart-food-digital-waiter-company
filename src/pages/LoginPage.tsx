import { Alert, Button, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { getApiErrorMessage } from '../utils/format';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/login'
      ? (location.state as { from: string }).from
      : '/app';

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível entrar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sf-surface sf-rise" style={{ padding: 24 }}>
      <Typography.Title level={2} className="sf-display" style={{ marginTop: 0 }}>
        Entrar
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Acesse o painel do seu restaurante.
      </Typography.Paragraph>

      {error ? (
        <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />
      ) : null}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            { required: true, message: 'Informe o e-mail' },
            { type: 'email', message: 'E-mail inválido' },
          ]}
        >
          <Input size="large" placeholder="voce@restaurante.com" autoComplete="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Senha"
          rules={[{ required: true, message: 'Informe a senha' }]}
        >
          <Input.Password size="large" placeholder="••••••••" autoComplete="current-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          Entrar
        </Button>
      </Form>

      <Typography.Paragraph style={{ marginTop: 20, marginBottom: 0, textAlign: 'center' }}>
        Ainda não tem conta? <Link to="/register">Cadastre seu restaurante</Link>
      </Typography.Paragraph>
    </div>
  );
}
