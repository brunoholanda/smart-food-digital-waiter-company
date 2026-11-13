import { Button, Tag } from 'antd';
import { BellRing, CheckCheck, HandHelping, Receipt } from 'lucide-react';
import type { ServiceCall } from '../../types';

const reasonLabel: Record<ServiceCall['reason'], string> = {
  CHANGE_ORDER: 'Alterar pedido',
  CANCEL_ORDER: 'Cancelar pedido',
  CLOSE_BILL: 'Fechar conta',
};

interface ServiceCallsPanelProps {
  calls: ServiceCall[];
  flashIds: Set<string>;
  updatingId: string | null;
  onAcknowledge: (callId: string) => Promise<void>;
  onResolve: (callId: string) => Promise<void>;
  onFocusOrder?: (orderId: string | null, tableNumber: number) => void;
  onSettleBill?: (tableId: string, tableNumber: number) => void;
}

export function ServiceCallsPanel({
  calls,
  flashIds,
  updatingId,
  onAcknowledge,
  onResolve,
  onFocusOrder,
  onSettleBill,
}: ServiceCallsPanelProps) {
  if (calls.length === 0) return null;

  return (
    <section className="service-calls-panel" aria-live="polite">
      <header className="service-calls-panel__header">
        <div className="service-calls-panel__title">
          <BellRing size={18} />
          <h2>Chamados da mesa</h2>
          <Tag color="warning" style={{ marginInlineEnd: 0 }}>
            {calls.length}
          </Tag>
        </div>
        <p>Cliente pediu atendimento na mesa — alterar, cancelar ou fechar a conta.</p>
      </header>

      <div className="service-calls-panel__list">
        {calls.map((call) => {
          const flashing = flashIds.has(call.id);
          const busy = updatingId === call.id;
          const isCloseBill = call.reason === 'CLOSE_BILL';
          return (
            <article
              key={call.id}
              className={`service-call-card${flashing ? ' is-flashing' : ''}${
                call.status === 'ACKNOWLEDGED' ? ' is-ack' : ''
              }${isCloseBill ? ' is-bill' : ''}`}
            >
              <div className="service-call-card__main">
                <div className="service-call-card__mesa">
                  <span>Mesa</span>
                  <strong>{call.tableNumber}</strong>
                </div>
                <div className="service-call-card__body">
                  <div className="service-call-card__reason">
                    {isCloseBill ? <Receipt size={16} /> : <HandHelping size={16} />}
                    {reasonLabel[call.reason]}
                    <Tag
                      color={call.status === 'ACKNOWLEDGED' ? 'processing' : 'error'}
                      style={{ marginInlineEnd: 0 }}
                    >
                      {call.status === 'ACKNOWLEDGED' ? 'Em atendimento' : 'Aberto'}
                    </Tag>
                  </div>
                  {call.message ? (
                    <p className="service-call-card__message">{call.message}</p>
                  ) : (
                    <p className="service-call-card__message muted">
                      {isCloseBill
                        ? 'Cliente pediu para fechar a conta · confira o valor e receba o pagamento.'
                        : 'Sem mensagem · atenda a mesa e ajuste o pedido na fila.'}
                    </p>
                  )}
                </div>
              </div>
              <div className="service-call-card__actions">
                {onFocusOrder ? (
                  <Button
                    size="large"
                    onClick={() =>
                      onFocusOrder(call.relatedOrderId ?? null, call.tableNumber)
                    }
                  >
                    Ver pedidos
                  </Button>
                ) : null}
                {isCloseBill && onSettleBill ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<Receipt size={16} />}
                    onClick={() => onSettleBill(call.tableId, call.tableNumber)}
                  >
                    Receber pagamento
                  </Button>
                ) : null}
                {call.status === 'OPEN' ? (
                  <Button
                    type={isCloseBill ? 'default' : 'primary'}
                    size="large"
                    loading={busy}
                    onClick={() => void onAcknowledge(call.id)}
                  >
                    Atender
                  </Button>
                ) : null}
                {!isCloseBill ? (
                  <Button
                    size="large"
                    icon={<CheckCheck size={16} />}
                    loading={busy}
                    onClick={() => void onResolve(call.id)}
                  >
                    Resolver
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
