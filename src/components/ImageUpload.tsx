import { Upload, message } from 'antd';
import { ImagePlus, Pencil } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { resolveImageUrl } from '../utils/images';
import {
  ImageEditorModal,
  type ImageAspectPreset,
} from './ImageEditorModal';

interface ImageUploadProps {
  value?: string | null;
  onFileSelect: (file: File) => Promise<void> | void;
  label?: string;
  aspectHint?: string;
  disabled?: boolean;
  shape?: 'rect' | 'circle';
  height?: number;
  aspectPreset?: ImageAspectPreset;
}

const ASPECT_RATIO: Record<ImageAspectPreset, string | undefined> = {
  logo: '1 / 1',
  banner: '16 / 9',
  menu: '4 / 3',
  free: undefined,
};

export function ImageUpload({
  value,
  onFileSelect,
  label = 'Enviar imagem',
  aspectHint,
  disabled,
  shape = 'rect',
  height = 140,
  aspectPreset = 'menu',
}: ImageUploadProps) {
  const preview = resolveImageUrl(value);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const frameStyle = useMemo(() => {
    if (shape === 'circle') {
      return {
        width: height,
        height,
        borderRadius: '50%',
        aspectRatio: undefined as string | undefined,
      };
    }

    const ratio = ASPECT_RATIO[aspectPreset];
    return {
      width: '100%',
      height: ratio ? undefined : height,
      minHeight: ratio ? undefined : height,
      aspectRatio: ratio,
      borderRadius: 16,
    };
  }, [aspectPreset, height, shape]);

  const closeEditor = () => {
    if (uploading) return;
    setEditorOpen(false);
    setPendingFile(null);
  };

  return (
    <div className="sf-image-upload" style={{ width: '100%', display: 'block' }}>
      <Upload
        accept="image/*"
        showUploadList={false}
        disabled={disabled || uploading}
        className="sf-image-upload-trigger"
        style={{ width: '100%', display: 'block' }}
        beforeUpload={(file) => {
          if (!file.type.startsWith('image/')) {
            message.error('Envie apenas imagens');
            return Upload.LIST_IGNORE;
          }
          if (file.size > 12 * 1024 * 1024) {
            message.error('Imagem deve ter no máximo 12MB');
            return Upload.LIST_IGNORE;
          }
          setPendingFile(file);
          setEditorOpen(true);
          return false;
        }}
      >
        <div
          style={{
            ...frameStyle,
            maxWidth: '100%',
            border: preview
              ? '1px solid var(--sf-border)'
              : '1.5px dashed var(--sf-border)',
            background: preview
              ? '#f5f5f4'
              : 'linear-gradient(145deg, #fff7f2, #f5e6dc)',
            display: 'grid',
            placeItems: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            overflow: 'hidden',
            position: 'relative',
            opacity: uploading ? 0.7 : 1,
            boxSizing: 'border-box',
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--sf-text-muted)', padding: 16 }}>
              <ImagePlus size={28} style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
              {aspectHint ? (
                <div style={{ fontSize: 12, marginTop: 4 }}>{aspectHint}</div>
              ) : null}
            </div>
          )}

          {preview ? (
            <div
              style={{
                position: 'absolute',
                right: 10,
                bottom: 10,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(28,25,23,0.82)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              }}
            >
              <Pencil size={16} />
            </div>
          ) : null}

          {uploading ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(28,25,23,0.45)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Enviando...
            </div>
          ) : null}
        </div>
      </Upload>

      <ImageEditorModal
        open={editorOpen}
        file={pendingFile}
        aspectPreset={aspectPreset}
        onCancel={closeEditor}
        onConfirm={async (normalized) => {
          setUploading(true);
          try {
            await onFileSelect(normalized);
            setEditorOpen(false);
            setPendingFile(null);
          } catch (err) {
            throw err instanceof Error
              ? err
              : new Error('Falha ao enviar a imagem');
          } finally {
            setUploading(false);
          }
        }}
      />
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'flex-start',
        marginBottom: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h2 className="sf-display" style={{ fontSize: 24 }}>
          {title}
        </h2>
        {subtitle ? (
          <p style={{ margin: '4px 0 0', color: 'var(--sf-text-muted)' }}>{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
