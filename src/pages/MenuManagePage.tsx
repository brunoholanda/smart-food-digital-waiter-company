import {
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Tag,
  Typography,
  message,
  Popconfirm,
} from 'antd';
import { Pencil, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as menuApi from '../api/menu';
import { ImageUpload, SectionTitle } from '../components/ImageUpload';
import { LoadingScreen } from '../components/LoadingScreen';
import { PendingApproval } from '../components/PendingApproval';
import { StatusBanner } from '../components/StatusBanner';
import { useRestaurant } from '../hooks/useRestaurant';
import type {
  CreateItemPayload,
  MenuCategory,
  MenuItem,
  PriceType,
} from '../types';
import { formatCurrency, getApiErrorMessage, toNumber } from '../utils/format';
import { resolveImageUrl } from '../utils/images';

const PRICE_TYPES: Array<{ value: PriceType; label: string }> = [
  { value: 'FIXED', label: 'Preço fixo' },
  { value: 'FROM', label: 'A partir de' },
  { value: 'VARIABLE', label: 'Variável' },
];

const CATEGORY_SUGGESTIONS: Array<{ name: string; description: string }> = [
  { name: 'Entradas', description: 'Para começar bem a refeição' },
  { name: 'Pratos principais', description: 'Os clássicos da casa' },
  { name: 'Executivos', description: 'Opções rápidas para o almoço' },
  { name: 'Massas', description: 'Massas frescas e molhos especiais' },
  { name: 'Carnes e grelhados', description: 'Cortes e preparos na brasa' },
  { name: 'Peixes e frutos do mar', description: 'Frescos e bem temperados' },
  { name: 'Burgers', description: 'Hambúrgueres artesanais' },
  { name: 'Pizzas', description: 'Tradicionais e especiais' },
  { name: 'Porções', description: 'Para compartilhar na mesa' },
  { name: 'Saladas', description: 'Leves e frescas' },
  { name: 'Kids', description: 'Cardápio infantil' },
  { name: 'Bebidas', description: 'Sucos, refrigerantes e água' },
  { name: 'Cervejas', description: 'Garrafa, lata e chopp' },
  { name: 'Drinks', description: 'Coquetéis e drinks da casa' },
  { name: 'Vinhos', description: 'Seleção para harmonizar' },
  { name: 'Cafés e chás', description: 'Quentes e especiais' },
  { name: 'Sobremesas', description: 'Doces para fechar com chave de ouro' },
  { name: 'Promoções', description: 'Ofertas e combos do momento' },
];

export function MenuManagePage() {
  const { restaurant, loading, refresh, setRestaurant } = useRestaurant();
  const [categoryModal, setCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [itemDrawer, setItemDrawer] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>();
  const [categoryForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const categories = restaurant?.categories ?? [];

  useEffect(() => {
    if (!activeCategoryId && categories[0]) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) ?? categories[0],
    [categories, activeCategoryId],
  );

  if (loading && !restaurant) return <LoadingScreen />;
  if (!restaurant) return <Typography.Text>Restaurante não encontrado</Typography.Text>;

  const approved = restaurant.status === 'APPROVED';

  const openCategoryModal = (category?: MenuCategory) => {
    setEditingCategory(category ?? null);
    categoryForm.setFieldsValue(
      category
        ? {
            name: category.name,
            description: category.description ?? undefined,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
          }
        : { name: '', description: '', sortOrder: categories.length, isActive: true },
    );
    setCategoryModal(true);
  };

  const saveCategory = async () => {
    const values = await categoryForm.validateFields();
    setSaving(true);
    try {
      if (editingCategory) {
        await menuApi.updateCategory(editingCategory.id, values);
        message.success('Categoria atualizada');
      } else {
        await menuApi.createCategory(values);
        message.success('Categoria criada');
      }
      setCategoryModal(false);
      const data = await refresh();
      if (data) setRestaurant(data);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Erro ao salvar categoria'));
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await menuApi.deleteCategory(id);
      message.success('Categoria removida');
      const data = await refresh();
      if (data) {
        setRestaurant(data);
        setActiveCategoryId(data.categories?.[0]?.id);
      }
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Erro ao remover categoria'));
    }
  };

  const clearItemImageDraft = () => {
    setItemImageFile(null);
    setItemImagePreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const openItemDrawer = (item?: MenuItem) => {
    clearItemImageDraft();
    setEditingItem(item ?? null);
    itemForm.setFieldsValue(
      item
        ? {
            categoryId: item.categoryId,
            name: item.name,
            description: item.description ?? undefined,
            basePrice: toNumber(item.basePrice),
            promotionalPrice: item.promotionalPrice
              ? toNumber(item.promotionalPrice)
              : undefined,
            priceType: item.priceType,
            isAvailable: item.isAvailable,
            isFeatured: item.isFeatured,
            sortOrder: item.sortOrder,
            prepTimeMin: item.prepTimeMin ?? undefined,
            calories: item.calories ?? undefined,
            servesPeople: item.servesPeople ?? undefined,
            spicyLevel: item.spicyLevel,
            isVegetarian: item.isVegetarian,
            isVegan: item.isVegan,
            isGlutenFree: item.isGlutenFree,
            allergens: item.allergens?.join(', ') ?? '',
            tags: item.tags?.join(', ') ?? '',
          }
        : {
            categoryId: activeCategory?.id,
            name: '',
            basePrice: 0,
            priceType: 'FIXED',
            isAvailable: true,
            isFeatured: false,
            spicyLevel: 0,
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: false,
            allergens: '',
            tags: '',
          },
    );
    setItemDrawer(true);
  };

  const saveItem = async () => {
    const values = await itemForm.validateFields();
    const payload: CreateItemPayload = {
      categoryId: values.categoryId,
      name: values.name,
      description: values.description,
      basePrice: Number(values.basePrice),
      promotionalPrice:
        values.promotionalPrice != null && values.promotionalPrice !== ''
          ? Number(values.promotionalPrice)
          : undefined,
      priceType: values.priceType,
      isAvailable: values.isAvailable,
      isFeatured: values.isFeatured,
      sortOrder: values.sortOrder,
      prepTimeMin: values.prepTimeMin,
      calories: values.calories,
      servesPeople: values.servesPeople,
      spicyLevel: values.spicyLevel ?? 0,
      isVegetarian: values.isVegetarian,
      isVegan: values.isVegan,
      isGlutenFree: values.isGlutenFree,
      allergens: String(values.allergens || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
      tags: String(values.tags || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
    };

    setSaving(true);
    try {
      if (editingItem) {
        await menuApi.updateItem(editingItem.id, payload);
        if (itemImageFile) {
          await menuApi.uploadItemImage(editingItem.id, itemImageFile);
        }
        message.success('Item atualizado');
      } else {
        const created = await menuApi.createItem(payload);
        if (itemImageFile) {
          await menuApi.uploadItemImage(created.id, itemImageFile);
        }
        message.success('Item criado');
      }
      clearItemImageDraft();
      setItemDrawer(false);
      const data = await refresh();
      if (data) setRestaurant(data);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Erro ao salvar item'));
    } finally {
      setSaving(false);
    }
  };

  const handleItemImageSelect = async (file: File) => {
    if (editingItem) {
      await uploadItemImage(editingItem.id, file);
      return;
    }

    setItemImagePreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setItemImageFile(file);
  };

  const removeItem = async (id: string) => {
    try {
      await menuApi.deleteItem(id);
      message.success('Item removido');
      const data = await refresh();
      if (data) setRestaurant(data);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Erro ao remover item'));
    }
  };

  const uploadItemImage = async (itemId: string, file: File) => {
    const updated = await menuApi.uploadItemImage(itemId, file);
    setEditingItem((prev) =>
      prev && prev.id === itemId ? { ...prev, imageUrl: updated.imageUrl } : prev,
    );
    const data = await refresh();
    if (data) setRestaurant(data);
  };

  const uploadCategoryImage = async (categoryId: string, file: File) => {
    await menuApi.uploadCategoryImage(categoryId, file);
    const data = await refresh();
    if (data) setRestaurant(data);
  };

  return (
    <div className="sf-fade-in">
      <SectionTitle
        title="Cardápio"
        subtitle="Organize categorias, fotos e itens do menu digital."
        action={
          approved ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button icon={<Plus size={16} />} onClick={() => openCategoryModal()}>
                Categoria
              </Button>
              <Button
                type="primary"
                icon={<Plus size={16} />}
                disabled={!categories.length}
                onClick={() => openItemDrawer()}
              >
                Item
              </Button>
            </div>
          ) : null
        }
      />

      <StatusBanner status={restaurant.status} rejectionReason={restaurant.rejectionReason} />

      {!approved ? (
        <PendingApproval />
      ) : (
        <>
          <div className="sf-chip-scroll" style={{ marginBottom: 8 }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`sf-chip ${activeCategory?.id === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategoryId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {!categories.length ? (
            <div className="sf-surface" style={{ padding: 24 }}>
              <Empty description="Crie a primeira categoria para começar" />
            </div>
          ) : (
            <div className="sf-surface" style={{ padding: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 16,
                }}
              >
                <div>
                  <h3 className="sf-display" style={{ fontSize: 22, margin: 0 }}>
                    {activeCategory?.name}
                  </h3>
                  <Typography.Text type="secondary">
                    {activeCategory?.description || 'Sem descrição'}
                  </Typography.Text>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    icon={<Pencil size={16} />}
                    onClick={() => activeCategory && openCategoryModal(activeCategory)}
                  >
                    Editar
                  </Button>
                  <Popconfirm
                    title="Remover categoria e seus itens?"
                    onConfirm={() => activeCategory && void removeCategory(activeCategory.id)}
                  >
                    <Button danger icon={<Trash2 size={16} />} />
                  </Popconfirm>
                </div>
              </div>

              <div style={{ maxWidth: 220, marginBottom: 20 }}>
                <ImageUpload
                  value={activeCategory?.imageUrl}
                  height={100}
                  label="Foto da categoria"
                  aspectPreset="menu"
                  aspectHint="4:3 · WebP ≤100KB"
                  onFileSelect={(file) =>
                    activeCategory && uploadCategoryImage(activeCategory.id, file)
                  }
                />
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {(activeCategory?.items ?? []).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '72px 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 14,
                      background: 'rgba(245,230,220,0.35)',
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 12,
                        background: item.imageUrl
                          ? `center/cover no-repeat url(${resolveImageUrl(item.imageUrl)})`
                          : 'linear-gradient(145deg,#fff7f2,#f5e6dc)',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'var(--sf-text-muted)',
                      }}
                    >
                      {!item.imageUrl ? <ImageIcon size={20} /> : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ color: 'var(--sf-text-muted)', fontSize: 13 }}>
                        {formatCurrency(item.basePrice)}
                        {item.isFeatured ? (
                          <Tag color="orange" style={{ marginLeft: 8 }}>
                            Destaque
                          </Tag>
                        ) : null}
                        {!item.isAvailable ? (
                          <Tag style={{ marginLeft: 8 }}>Indisponível</Tag>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button
                        size="small"
                        icon={<Pencil size={14} />}
                        onClick={() => openItemDrawer(item)}
                      />
                      <Popconfirm
                        title="Remover item?"
                        onConfirm={() => void removeItem(item.id)}
                      >
                        <Button size="small" danger icon={<Trash2 size={14} />} />
                      </Popconfirm>
                    </div>
                  </div>
                ))}
                {!activeCategory?.items?.length ? (
                  <Empty description="Nenhum item nesta categoria" />
                ) : null}
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={categoryModal}
        title={editingCategory ? 'Editar categoria' : 'Nova categoria'}
        onCancel={() => setCategoryModal(false)}
        onOk={() => void saveCategory()}
        confirmLoading={saving}
        okText="Salvar"
        cancelText="Cancelar"
        destroyOnHidden
      >
        <Form form={categoryForm} layout="vertical" requiredMark={false}>
          {!editingCategory ? (
            <div style={{ marginBottom: 16 }}>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                Sugestões comuns em restaurantes
              </Typography.Text>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 8,
                  maxHeight: 148,
                  overflowY: 'auto',
                  paddingRight: 4,
                }}
              >
                {CATEGORY_SUGGESTIONS.filter(
                  (suggestion) =>
                    !categories.some(
                      (cat) =>
                        cat.name.trim().toLowerCase() ===
                        suggestion.name.trim().toLowerCase(),
                    ),
                ).map((suggestion) => (
                  <Tag
                    key={suggestion.name}
                    style={{
                      cursor: 'pointer',
                      marginInlineEnd: 0,
                      padding: '4px 10px',
                      borderRadius: 999,
                      borderColor: 'var(--sf-border)',
                      background: '#fff',
                    }}
                    onClick={() =>
                      categoryForm.setFieldsValue({
                        name: suggestion.name,
                        description: suggestion.description,
                      })
                    }
                  >
                    {suggestion.name}
                  </Tag>
                ))}
              </div>
            </div>
          ) : null}
          <Form.Item name="name" label="Nome" rules={[{ required: true, min: 2 }]}>
            <Input placeholder="Ex.: Entradas, Bebidas, Sobremesas" />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={2} placeholder="Opcional" />
          </Form.Item>
          <Form.Item name="sortOrder" label="Ordem">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          {editingCategory ? (
            <Form.Item name="isActive" label="Ativa" valuePropName="checked">
              <Switch />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>

      <Drawer
        open={itemDrawer}
        onClose={() => {
          clearItemImageDraft();
          setItemDrawer(false);
        }}
        title={editingItem ? 'Editar item' : 'Novo item'}
        width={480}
        destroyOnHidden
        extra={
          <Button type="primary" loading={saving} onClick={() => void saveItem()}>
            Salvar
          </Button>
        }
      >
        <Form form={itemForm} layout="vertical" requiredMark={false}>
          <Form.Item label="Foto do produto" style={{ marginBottom: 20 }}>
            <ImageUpload
              value={itemImagePreview || editingItem?.imageUrl}
              height={180}
              label="Adicionar foto do produto"
              aspectPreset="menu"
              aspectHint="Toque para incluir ou alterar"
              onFileSelect={handleItemImageSelect}
            />
          </Form.Item>

          <Form.Item name="categoryId" label="Categoria" rules={[{ required: true }]}>
            <Select
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="name" label="Nome" rules={[{ required: true, min: 2 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="basePrice" label="Preço" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} step={0.5} />
            </Form.Item>
            <Form.Item name="promotionalPrice" label="Preço promo">
              <InputNumber style={{ width: '100%' }} min={0} step={0.5} />
            </Form.Item>
          </div>
          <Form.Item name="priceType" label="Tipo de preço">
            <Select options={PRICE_TYPES} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="prepTimeMin" label="Preparo (min)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="spicyLevel" label="Picância (0-5)">
              <InputNumber style={{ width: '100%' }} min={0} max={5} />
            </Form.Item>
            <Form.Item name="calories" label="Calorias">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="servesPeople" label="Serve (pessoas)">
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </div>
          <Form.Item name="allergens" label="Alérgenos (separados por vírgula)">
            <Input placeholder="leite, glúten" />
          </Form.Item>
          <Form.Item name="tags" label="Tags (separadas por vírgula)">
            <Input placeholder="novo, chef" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Form.Item name="isAvailable" label="Disponível" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isFeatured" label="Destaque" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isVegetarian" label="Vegetariano" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isVegan" label="Vegano" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isGlutenFree" label="Sem glúten" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

        </Form>
      </Drawer>
    </div>
  );
}
