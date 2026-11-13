import { Tag, Typography, Upload, message } from 'antd';
import { Pencil } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import * as restaurantsApi from '../api/restaurants';
import type { Restaurant } from '../types';
import { cuisineLabel } from '../utils/cuisine';
import { getApiErrorMessage } from '../utils/format';
import { resolveImageUrl } from '../utils/images';
import {
  ImageEditorModal,
  type ImageAspectPreset,
} from './ImageEditorModal';

type EditTarget = 'logo' | 'banner';

interface RestaurantCoverCardProps {
  restaurant: Restaurant;
  onUpdated: (restaurant: Restaurant) => void;
  showMeta?: boolean;
  footerNote?: ReactNode;
}

export function RestaurantCoverCard({
  restaurant,
  onUpdated,
  showMeta = true,
  footerNote,
}: RestaurantCoverCardProps) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const approved = restaurant.status === 'APPROVED';
  const aspectPreset: ImageAspectPreset =
    editTarget === 'banner' ? 'banner' : 'logo';

  const openEditorFor = (target: EditTarget, file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('Envie apenas imagens');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      message.error('Imagem deve ter no máximo 12MB');
      return;
    }
    setEditTarget(target);
    setPendingFile(file);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setPendingFile(null);
    setEditTarget(null);
  };

  const uploadImage = async (kind: EditTarget, file: File) => {
    const updated = await restaurantsApi.uploadRestaurantImages({ [kind]: file });
    onUpdated({ ...restaurant, ...updated });
  };

  const EditPencil = ({ target }: { target: EditTarget }) => (
    <Upload
      accept="image/*"
      showUploadList={false}
      beforeUpload={(file) => {
        openEditorFor(target, file);
        return false;
      }}
    >
      <button
        type="button"
        aria-label={target === 'logo' ? 'Editar logo' : 'Editar banner'}
        title={target === 'logo' ? 'Editar logo' : 'Editar banner'}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: 'none',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          background: 'rgba(28, 25, 23, 0.78)',
          color: '#fff',
          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
          padding: 0,
        }}
      >
        <Pencil size={16} />
      </button>
    </Upload>
  );

  return (
    <>
      <div
        className="sf-surface"
        style={{
          padding: 0,
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            height: 140,
            position: 'relative',
            background: restaurant.bannerUrl
              ? `center/cover no-repeat url(${resolveImageUrl(restaurant.bannerUrl)})`
              : 'linear-gradient(135deg, #1c1917, #ff6b35)',
          }}
        >
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <EditPencil target="banner" />
          </div>
        </div>
        <div style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              width: 72,
              height: 72,
              marginTop: -48,
              borderRadius: 18,
              border: '3px solid #fff',
              background: restaurant.logoUrl
                ? `center/cover no-repeat url(${resolveImageUrl(restaurant.logoUrl)})`
                : 'linear-gradient(145deg, #f5e6dc, #ffb086)',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', right: -6, bottom: -6 }}>
              <EditPencil target="logo" />
            </div>
          </div>
          {showMeta ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <h2 className="sf-display" style={{ fontSize: 26, margin: 0 }}>
                  {restaurant.tradeName}
                </h2>
                <Tag color={approved ? 'success' : 'processing'}>
                  {approved ? 'Aprovado' : restaurant.status}
                </Tag>
              </div>
              <div style={{ color: 'var(--sf-text-muted)' }}>
                {cuisineLabel(restaurant.cuisineType)}
                {restaurant.city ? ` · ${restaurant.city}/${restaurant.state || ''}` : ''}
              </div>
              {footerNote}
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text type="secondary">
                Toque no lápis para alterar banner ou logo
              </Typography.Text>
              {footerNote}
            </div>
          )}
        </div>
      </div>

      <ImageEditorModal
        open={editorOpen}
        file={pendingFile}
        aspectPreset={aspectPreset}
        onCancel={closeEditor}
        onConfirm={async (normalized) => {
          if (!editTarget) return;
          try {
            await uploadImage(editTarget, normalized);
            closeEditor();
          } catch (err) {
            message.error(getApiErrorMessage(err, 'Falha no upload'));
          }
        }}
      />
    </>
  );
}
