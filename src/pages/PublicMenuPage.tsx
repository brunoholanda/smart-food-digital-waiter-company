import {
  Button,
  Drawer,
  Empty,
  Input,
  InputNumber,
  Result,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Flame,
  Leaf,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Banknote,
  WheatOff,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import * as ordersApi from '../api/orders';
import * as publicApi from '../api/public';
import * as tablesApi from '../api/tables';
import { LoadingScreen } from '../components/LoadingScreen';
import { SiteFooter } from '../components/SiteFooter';
import type {
  MenuItem,
  Order,
  PaymentMethod,
  PublicTableContext,
  Restaurant,
} from '../types';
import { cuisineLabel } from '../utils/cuisine';
import {
  WEEKDAYS,
  formatCurrency,
  getApiErrorMessage,
  toNumber,
  whatsappLink,
} from '../utils/format';
import { resolveImageUrl } from '../utils/images';

interface CartLine {
  key: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  variationName?: string;
  addonNames?: string[];
}

type CheckoutStep = 'cart' | 'checkout' | 'pay' | 'success';

export function PublicMenuPage() {
  const { slug = '', tableCode } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tableCtx, setTableCtx] = useState<PublicTableContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tableInvalid, setTableInvalid] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [paidOrder, setPaidOrder] = useState<Order | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const tableOrdering =
    Boolean(tableCode) && Boolean(tableCtx) && !tableInvalid;

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setNotFound(false);
      setTableInvalid(false);
      setTableCtx(null);
      try {
        const menuPromise = publicApi.getPublicMenu(slug);
        const tablePromise = tableCode
          ? tablesApi.getPublicTable(slug, tableCode).catch(() => null)
          : Promise.resolve(null);

        const [menu, table] = await Promise.all([menuPromise, tablePromise]);
        if (!active) return;

        setRestaurant(menu);
        setActiveCategory(menu.categories?.[0]?.id ?? '');

        if (tableCode) {
          if (!table) {
            setTableInvalid(true);
          } else {
            setTableCtx(table);
          }
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [slug, tableCode]);

  const featured = useMemo(
    () =>
      restaurant?.categories?.flatMap((c) => c.items ?? []).filter((i) => i.isFeatured) ??
      [],
    [restaurant],
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, line) => acc + line.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((acc, line) => acc + line.unitPrice * line.quantity, 0),
    [cart],
  );

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!restaurant?.categories?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveCategory(visible.target.id.replace('cat-', ''));
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.2, 0.5] },
    );
    restaurant.categories.forEach((cat) => {
      const el = sectionRefs.current[cat.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [restaurant]);

  const openItem = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQty(1);
    setItemNotes('');
  };

  const addToCart = () => {
    if (!selectedItem) return;
    const unitPrice = toNumber(selectedItem.promotionalPrice ?? selectedItem.basePrice);
    const notes = itemNotes.trim() || undefined;
    const key = `${selectedItem.id}::${notes ?? ''}`;
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + itemQty } : l,
        );
      }
      return [
        ...prev,
        {
          key,
          menuItemId: selectedItem.id,
          name: selectedItem.name,
          unitPrice,
          quantity: itemQty,
          notes,
        },
      ];
    });
    message.success('Adicionado ao pedido');
    setSelectedItem(null);
  };

  const updateLineQty = (key: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.key !== key);
      return prev.map((l) => (l.key === key ? { ...l, quantity } : l));
    });
  };

  const getSimpleQty = (menuItemId: string) =>
    cart
      .filter((l) => l.menuItemId === menuItemId)
      .reduce((acc, l) => acc + l.quantity, 0);

  const quickAddItem = (item: MenuItem) => {
    const unitPrice = toNumber(item.promotionalPrice ?? item.basePrice);
    const key = `${item.id}::`;
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [
        ...prev,
        {
          key,
          menuItemId: item.id,
          name: item.name,
          unitPrice,
          quantity: 1,
        },
      ];
    });
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(12);
    }
  };

  const quickRemoveItem = (item: MenuItem) => {
    const key = `${item.id}::`;
    const simple = cart.find((l) => l.key === key);
    if (simple) {
      updateLineQty(key, simple.quantity - 1);
      return;
    }
    // If only noted variants exist, reduce the last one
    const variants = cart.filter((l) => l.menuItemId === item.id);
    const last = variants[variants.length - 1];
    if (last) updateLineQty(last.key, last.quantity - 1);
  };

  const openCheckout = () => {
    setCheckoutStep('cart');
    setDrawerOpen(true);
  };

  const submitOrder = async () => {
    if (!tableCtx || !cart.length) return;
    setSubmitting(true);
    try {
      const order = await ordersApi.createPublicOrder({
        restaurantSlug: slug,
        tableCode: tableCtx.table.code,
        customerName: customerName.trim() || undefined,
        notes: orderNotes.trim() || undefined,
        items: cart.map((line) => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          notes: line.notes,
          variationName: line.variationName,
          addonNames: line.addonNames,
        })),
      });
      setPendingOrder(order);
      setCheckoutStep('pay');
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Não foi possível criar o pedido'));
    } finally {
      setSubmitting(false);
    }
  };

  const payOrder = async (method: PaymentMethod) => {
    if (!pendingOrder) return;
    setSubmitting(true);
    try {
      const paid = await ordersApi.payPublicOrder(pendingOrder.id, { method });
      setPaidOrder(paid);
      setCart([]);
      setCheckoutStep('success');
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Pagamento não concluído'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetAfterSuccess = () => {
    setDrawerOpen(false);
    setCheckoutStep('cart');
    setPendingOrder(null);
    setPaidOrder(null);
    setCustomerName('');
    setOrderNotes('');
  };

  if (loading) return <LoadingScreen tip="Abrindo cardápio..." />;
  if (notFound || !restaurant) {
    return (
      <div className="sf-page sf-atmosphere" style={{ display: 'grid', placeItems: 'center' }}>
        <Result
          status="404"
          title="Cardápio não encontrado"
          subTitle="Esse restaurante não está publicado."
        />
      </div>
    );
  }

  if (tableCode && tableInvalid) {
    return (
      <div className="sf-page sf-atmosphere" style={{ display: 'grid', placeItems: 'center' }}>
        <Result
          status="warning"
          title="Mesa inválida"
          subTitle="Este QR não corresponde a uma mesa ativa. Peça um novo código ao restaurante."
          extra={
            <Button type="primary" href={`/m/${slug}`}>
              Ver cardápio sem mesa
            </Button>
          }
        />
      </div>
    );
  }

  const wa = restaurant.whatsapp || restaurant.phone;
  const today = new Date().getDay();
  const todayHours = restaurant.openingHours?.find((h) => h.dayOfWeek === today);
  const bottomPad = tableOrdering ? 118 : 96;

  return (
    <div className="sf-page" style={{ background: 'var(--sf-cream)', paddingBottom: bottomPad }}>
      <div
        style={{
          height: 210,
          background: restaurant.bannerUrl
            ? `center/cover no-repeat url(${resolveImageUrl(restaurant.bannerUrl)})`
            : `linear-gradient(135deg, ${restaurant.coverColor || '#1c1917'}, #ff6b35)`,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 40%, rgba(28,25,23,0.55))',
          }}
        />
      </div>

      <div style={{ maxWidth: 720, margin: '-56px auto 0', padding: '0 16px', position: 'relative' }}>
        <div className="sf-surface sf-rise" style={{ padding: 18 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                flexShrink: 0,
                background: restaurant.logoUrl
                  ? `center/cover no-repeat url(${resolveImageUrl(restaurant.logoUrl)})`
                  : 'linear-gradient(145deg,#f5e6dc,#ffb086)',
                border: '3px solid #fff',
                boxShadow: 'var(--sf-shadow)',
              }}
            />
            <div style={{ minWidth: 0 }}>
              <h1 className="sf-display" style={{ fontSize: 28, margin: 0 }}>
                {restaurant.tradeName}
              </h1>
              <div style={{ color: 'var(--sf-text-muted)', fontSize: 14 }}>
                {cuisineLabel(restaurant.cuisineType)}
                {restaurant.estimatedTime ? ` · ${restaurant.estimatedTime}` : ''}
              </div>
              {tableOrdering && tableCtx ? (
                <span className="sf-table-badge">Mesa {tableCtx.table.number}</span>
              ) : null}
              {(restaurant.city || restaurant.neighborhood) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 4,
                    color: 'var(--sf-text-muted)',
                    fontSize: 13,
                  }}
                >
                  <MapPin size={14} />
                  {[restaurant.neighborhood, restaurant.city, restaurant.state]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </div>
          </div>

          {restaurant.description ? (
            <Typography.Paragraph style={{ marginTop: 14, marginBottom: 0 }}>
              {restaurant.description}
            </Typography.Paragraph>
          ) : null}

          {todayHours ? (
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--sf-charcoal-muted)',
                fontSize: 13,
              }}
            >
              <Clock3 size={14} />
              {todayHours.isClosed
                ? `Fechado hoje (${WEEKDAYS[today]})`
                : `Hoje · ${todayHours.opensAt} – ${todayHours.closesAt}`}
            </div>
          ) : null}

          {tableOrdering ? (
            <div className="sf-order-hint">
              <span className="sf-order-hint__badge">Pedido na mesa</span>
              <p>
                Use <strong>+</strong> para adicionar. Toque no nome do item para ver detalhes
                e observações.
              </p>
            </div>
          ) : null}
        </div>

        {featured.length > 0 ? (
          <section style={{ marginTop: 22 }} className="sf-rise-delay">
            <h2 className="sf-display" style={{ fontSize: 22, marginBottom: 12 }}>
              Destaques
            </h2>
            <div className="sf-chip-scroll" style={{ gap: 12 }}>
              {featured.map((item) => {
                const qty = getSimpleQty(item.id);
                return (
                  <div key={item.id} className="sf-feature-card">
                    <button
                      type="button"
                      className="sf-feature-card__media"
                      onClick={() => openItem(item)}
                      style={{
                        background: item.imageUrl
                          ? `center/cover no-repeat url(${resolveImageUrl(item.imageUrl)})`
                          : 'linear-gradient(145deg,#1c1917,#ff6b35)',
                      }}
                      aria-label={`Ver ${item.name}`}
                    />
                    <div className="sf-feature-card__body">
                      <button
                        type="button"
                        className="sf-feature-card__title"
                        onClick={() => openItem(item)}
                      >
                        {item.name}
                      </button>
                      <div className="sf-feature-card__row">
                        <span className="sf-feature-card__price">
                          {formatCurrency(item.promotionalPrice ?? item.basePrice)}
                        </span>
                        {tableOrdering ? (
                          <QtyStepper
                            quantity={qty}
                            onAdd={() => quickAddItem(item)}
                            onRemove={() => quickRemoveItem(item)}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 15,
            background: 'linear-gradient(180deg, #fff7f2 70%, rgba(255,247,242,0))',
            paddingTop: 14,
            marginTop: 8,
          }}
        >
          <div className="sf-chip-scroll">
            {(restaurant.categories ?? []).map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`sf-chip ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => scrollToCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {(restaurant.categories ?? []).map((category) => (
          <section
            key={category.id}
            id={`cat-${category.id}`}
            ref={(el) => {
              sectionRefs.current[category.id] = el;
            }}
            style={{ marginTop: 18, scrollMarginTop: 130 }}
          >
            <h2 className="sf-display" style={{ fontSize: 24, marginBottom: 4 }}>
              {category.name}
            </h2>
            {category.description ? (
              <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
                {category.description}
              </Typography.Paragraph>
            ) : null}

            {(category.items ?? []).length === 0 ? (
              <Empty description="Sem itens nesta categoria" />
            ) : (
              (category.items ?? []).map((item) => {
                const qty = getSimpleQty(item.id);
                return (
                  <article
                    key={item.id}
                    className={`sf-menu-item ${tableOrdering ? 'sf-menu-item--order' : ''}`}
                  >
                    <button
                      type="button"
                      className="sf-menu-item__main"
                      onClick={() => openItem(item)}
                    >
                      <div className="sf-menu-item__copy">
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                        {item.description ? (
                          <div className="sf-menu-item__desc">{item.description}</div>
                        ) : null}
                        <DietaryTags item={item} />
                        <div className="sf-menu-item__price">
                          {item.priceType === 'FROM' ? 'A partir de ' : ''}
                          {item.promotionalPrice ? (
                            <>
                              <span style={{ color: 'var(--sf-coral)' }}>
                                {formatCurrency(item.promotionalPrice)}
                              </span>{' '}
                              <span className="sf-menu-item__price-old">
                                {formatCurrency(item.basePrice)}
                              </span>
                            </>
                          ) : (
                            formatCurrency(item.basePrice)
                          )}
                        </div>
                      </div>
                      {item.imageUrl ? (
                        <img
                          className="sf-menu-item__thumb"
                          src={resolveImageUrl(item.imageUrl)}
                          alt=""
                        />
                      ) : (
                        <div className="sf-menu-item__thumb" />
                      )}
                    </button>

                    {tableOrdering ? (
                      <div className="sf-menu-item__actions">
                        <QtyStepper
                          quantity={qty}
                          onAdd={() => quickAddItem(item)}
                          onRemove={() => quickRemoveItem(item)}
                          emphasizeEmpty
                        />
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </section>
        ))}
      </div>

      {!tableOrdering && wa ? (
        <div className="sf-sticky-cta" style={{ maxWidth: 720, margin: '0 auto' }}>
          <Button
            type="primary"
            size="large"
            block
            icon={<MessageCircle size={18} />}
            href={whatsappLink(
              wa,
              `Olá! Vi o cardápio de ${restaurant.tradeName} e gostaria de fazer um pedido.`,
            )}
            target="_blank"
            rel="noreferrer"
            style={{ height: 52, fontSize: 16 }}
          >
            Pedir no WhatsApp
          </Button>
        </div>
      ) : null}

      {tableOrdering ? (
        <div className="sf-cart-bar">
          {cartCount > 0 ? (
            <button type="button" className="sf-cart-bar__inner" onClick={openCheckout}>
              <div className="sf-cart-bar__left">
                <span className="sf-cart-bar__bag">
                  <ShoppingBag size={18} />
                  <span className="sf-cart-bar__count">{cartCount}</span>
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Ver pedido</div>
                  <div style={{ fontSize: 12, opacity: 0.78 }}>
                    Mesa {tableCtx?.table.number} · toque para finalizar
                  </div>
                </div>
              </div>
              <div className="sf-cart-bar__total">{formatCurrency(cartTotal)}</div>
            </button>
          ) : (
            <div className="sf-cart-bar__empty">
              <ShoppingBag size={18} />
              <span>Adicione itens com + · o total aparece aqui</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Item detail drawer */}
      <Drawer
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        placement="bottom"
        height="auto"
        title={null}
        styles={{
          body: { padding: 0 },
          wrapper: { maxWidth: 720, margin: '0 auto' },
        }}
      >
        {selectedItem ? (
          <div>
            {selectedItem.imageUrl ? (
              <img
                src={resolveImageUrl(selectedItem.imageUrl)}
                alt={selectedItem.name}
                style={{ width: '100%', height: 220, objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  height: 140,
                  background: 'linear-gradient(135deg,#1c1917,#ff6b35)',
                }}
              />
            )}
            <div style={{ padding: 20 }}>
              <h3 className="sf-display" style={{ fontSize: 26, margin: 0 }}>
                {selectedItem.name}
              </h3>
              <div
                style={{
                  margin: '8px 0 12px',
                  fontWeight: 700,
                  color: 'var(--sf-coral)',
                  fontSize: 18,
                }}
              >
                {selectedItem.priceType === 'FROM' ? 'A partir de ' : ''}
                {formatCurrency(selectedItem.promotionalPrice ?? selectedItem.basePrice)}
              </div>
              {selectedItem.description ? (
                <Typography.Paragraph>{selectedItem.description}</Typography.Paragraph>
              ) : null}
              <DietaryTags item={selectedItem} large />
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginTop: 12,
                  color: 'var(--sf-text-muted)',
                  fontSize: 13,
                }}
              >
                {selectedItem.prepTimeMin ? <span>{selectedItem.prepTimeMin} min</span> : null}
                {selectedItem.calories ? <span>{selectedItem.calories} kcal</span> : null}
                {selectedItem.servesPeople ? (
                  <span>Serve {selectedItem.servesPeople}</span>
                ) : null}
                {toNumber(selectedItem.spicyLevel) > 0 ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={14} color="var(--sf-coral)" />
                    Picante {selectedItem.spicyLevel}
                  </span>
                ) : null}
              </div>
              {selectedItem.allergens?.length ? (
                <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
                  Alérgenos: {selectedItem.allergens.join(', ')}
                </Typography.Paragraph>
              ) : null}

              {tableOrdering ? (
                <div style={{ marginTop: 16 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    Observação do item (opcional)
                  </Typography.Text>
                  <Input.TextArea
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    rows={2}
                    maxLength={120}
                    placeholder="Ex.: sem cebola, bem passado..."
                    style={{ marginTop: 6, marginBottom: 14 }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <Button
                      icon={<Minus size={16} />}
                      onClick={() => setItemQty((q) => Math.max(1, q - 1))}
                    />
                    <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                      {itemQty}
                    </span>
                    <Button
                      icon={<Plus size={16} />}
                      onClick={() => setItemQty((q) => q + 1)}
                    />
                    <div style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--sf-coral)' }}>
                      {formatCurrency(
                        toNumber(selectedItem.promotionalPrice ?? selectedItem.basePrice) *
                          itemQty,
                      )}
                    </div>
                  </div>
                  <Button type="primary" size="large" block onClick={addToCart}>
                    Adicionar ao pedido
                  </Button>
                </div>
              ) : wa ? (
                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ marginTop: 8 }}
                  icon={<MessageCircle size={18} />}
                  href={whatsappLink(
                    wa,
                    `Olá! Quero pedir: ${selectedItem.name} (${formatCurrency(selectedItem.promotionalPrice ?? selectedItem.basePrice)})`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pedir este item
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Cart / checkout / pay / success drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          if (checkoutStep === 'success') {
            resetAfterSuccess();
          } else {
            setDrawerOpen(false);
          }
        }}
        placement="bottom"
        height="auto"
        title={
          checkoutStep === 'success'
            ? 'Pedido enviado'
            : checkoutStep === 'pay'
              ? 'Pagamento'
              : checkoutStep === 'checkout'
                ? 'Finalizar pedido'
                : 'Seu pedido'
        }
        styles={{
          body: { paddingBottom: 24 },
          wrapper: { maxWidth: 720, margin: '0 auto' },
        }}
      >
        {checkoutStep === 'cart' ? (
          <div>
            {cart.length === 0 ? (
              <Empty description="Carrinho vazio" />
            ) : (
              <>
                {cart.map((line) => (
                  <div
                    key={line.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom: '1px solid var(--sf-border)',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{line.name}</div>
                      {line.notes ? (
                        <div style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>
                          {line.notes}
                        </div>
                      ) : null}
                      <div style={{ color: 'var(--sf-coral)', fontWeight: 600, marginTop: 4 }}>
                        {formatCurrency(line.unitPrice * line.quantity)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Button
                        size="small"
                        icon={<Minus size={14} />}
                        onClick={() => updateLineQty(line.key, line.quantity - 1)}
                      />
                      <InputNumber
                        size="small"
                        min={1}
                        value={line.quantity}
                        onChange={(v) => updateLineQty(line.key, Number(v) || 1)}
                        style={{ width: 52 }}
                      />
                      <Button
                        size="small"
                        icon={<Plus size={14} />}
                        onClick={() => updateLineQty(line.key, line.quantity + 1)}
                      />
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 16,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  <span>Total</span>
                  <span style={{ color: 'var(--sf-coral)' }}>{formatCurrency(cartTotal)}</span>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ marginTop: 16 }}
                  onClick={() => setCheckoutStep('checkout')}
                >
                  Continuar
                </Button>
              </>
            )}
          </div>
        ) : null}

        {checkoutStep === 'checkout' ? (
          <div>
            {tableCtx ? (
              <Tag style={{ marginBottom: 12 }}>Mesa {tableCtx.table.number}</Tag>
            ) : null}
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Seu nome (opcional)
            </Typography.Text>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Como te chamamos?"
              style={{ marginTop: 6, marginBottom: 14 }}
              maxLength={60}
            />
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Observações do pedido
            </Typography.Text>
            <Input.TextArea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={3}
              placeholder="Alergias, preferências..."
              style={{ marginTop: 6, marginBottom: 16 }}
              maxLength={200}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 16,
                fontWeight: 700,
              }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--sf-coral)' }}>{formatCurrency(cartTotal)}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button style={{ flex: 1 }} onClick={() => setCheckoutStep('cart')}>
                Voltar
              </Button>
              <Button
                type="primary"
                style={{ flex: 2 }}
                size="large"
                loading={submitting}
                onClick={() => void submitOrder()}
              >
                Confirmar pedido
              </Button>
            </div>
          </div>
        ) : null}

        {checkoutStep === 'pay' && pendingOrder ? (
          <div>
            <Typography.Paragraph>
              Pedido <strong>{pendingOrder.code}</strong> ·{' '}
              {formatCurrency(pendingOrder.total)}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary">
              Escolha a forma de pagamento (simulado — sem cobrança real).
            </Typography.Paragraph>
            <div style={{ display: 'grid', gap: 10 }}>
              <Button
                size="large"
                loading={submitting}
                icon={<Banknote size={18} />}
                onClick={() => void payOrder('PIX')}
                style={{ height: 52, justifyContent: 'flex-start' }}
              >
                PIX
              </Button>
              <Button
                size="large"
                loading={submitting}
                icon={<CreditCard size={18} />}
                onClick={() => void payOrder('CARD')}
                style={{ height: 52, justifyContent: 'flex-start' }}
              >
                Cartão
              </Button>
              <Button
                size="large"
                loading={submitting}
                icon={<Banknote size={18} />}
                onClick={() => void payOrder('CASH')}
                style={{ height: 52, justifyContent: 'flex-start' }}
              >
                Dinheiro
              </Button>
            </div>
          </div>
        ) : null}

        {checkoutStep === 'success' && paidOrder ? (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{ color: 'var(--sf-coral)', marginBottom: 8 }}>
              <CheckCircle2 size={48} />
            </div>
            <h3 className="sf-display" style={{ fontSize: 26, marginBottom: 8 }}>
              Pedido confirmado!
            </h3>
            <Typography.Paragraph>
              Código <strong>{paidOrder.code}</strong>
              {paidOrder.tableNumber != null ? ` · Mesa ${paidOrder.tableNumber}` : ''}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary">
              Seu pedido entrou na fila da cozinha. Acompanhe o status com a equipe do salão.
            </Typography.Paragraph>
            <Button type="primary" size="large" block onClick={resetAfterSuccess}>
              Continuar no cardápio
            </Button>
          </div>
        ) : null}
      </Drawer>

      <SiteFooter />
    </div>
  );
}

function QtyStepper({
  quantity,
  onAdd,
  onRemove,
  emphasizeEmpty = false,
}: {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  emphasizeEmpty?: boolean;
}) {
  if (quantity <= 0) {
    return (
      <button
        type="button"
        className={`sf-qty-add ${emphasizeEmpty ? 'sf-qty-add--pulse' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        aria-label="Adicionar"
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <div className="sf-qty" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="sf-qty__btn"
        onClick={onRemove}
        aria-label="Remover"
      >
        <Minus size={18} strokeWidth={2.5} />
      </button>
      <span className="sf-qty__value">{quantity}</span>
      <button
        type="button"
        className="sf-qty__btn sf-qty__btn--plus"
        onClick={onAdd}
        aria-label="Adicionar mais"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function DietaryTags({ item, large }: { item: MenuItem; large?: boolean }) {
  const tags: Array<{ key: string; label: string; icon: ReactNode; color: string }> = [];
  if (item.isFeatured) {
    tags.push({ key: 'f', label: 'Destaque', icon: <Star size={12} />, color: 'orange' });
  }
  if (item.isVegetarian) {
    tags.push({ key: 'veg', label: 'Vegetariano', icon: <Leaf size={12} />, color: 'green' });
  }
  if (item.isVegan) {
    tags.push({ key: 'vegan', label: 'Vegano', icon: <Leaf size={12} />, color: 'success' });
  }
  if (item.isGlutenFree) {
    tags.push({ key: 'gf', label: 'Sem glúten', icon: <WheatOff size={12} />, color: 'blue' });
  }
  item.tags?.slice(0, 3).forEach((t) => {
    tags.push({ key: t, label: t, icon: null, color: 'default' });
  });

  if (!tags.length) return null;

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tags.map((tag) => (
        <Tag
          key={tag.key}
          color={tag.color}
          style={{
            marginInlineEnd: 0,
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {tag.icon}
          <span style={{ fontSize: large ? 13 : 12 }}>{tag.label}</span>
        </Tag>
      ))}
    </div>
  );
}
