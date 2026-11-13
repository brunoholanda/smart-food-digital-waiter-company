import { Button, Modal, Slider, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import {
  cropImageToCanvas,
  formatBytes,
  normalizeCanvasToWebpFile,
} from '../utils/imageNormalize';

export type ImageAspectPreset = 'logo' | 'banner' | 'menu' | 'free';

const ASPECT_BY_PRESET: Record<ImageAspectPreset, number | undefined> = {
  logo: 1,
  banner: 16 / 9,
  menu: 4 / 3,
  free: undefined,
};

const PRESET_HINT: Record<ImageAspectPreset, string> = {
  logo: 'Logo quadrada (1:1)',
  banner: 'Banner widescreen (16:9)',
  menu: 'Foto do cardápio (4:3)',
  free: 'Recorte livre',
};

interface ImageEditorModalProps {
  open: boolean;
  file: File | null;
  aspectPreset?: ImageAspectPreset;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void> | void;
}

export function ImageEditorModal({
  open,
  file,
  aspectPreset = 'menu',
  onCancel,
  onConfirm,
}: ImageEditorModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!file || !open) {
      setImageSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    return () => URL.revokeObjectURL(url);
  }, [file, open]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !file) {
      message.error('Selecione uma imagem antes de salvar');
      return;
    }
    if (!croppedAreaPixels) {
      message.error('Aguarde o enquadramento carregar e tente novamente');
      return;
    }

    setSaving(true);
    try {
      const canvas = await cropImageToCanvas(imageSrc, croppedAreaPixels);
      const normalized = await normalizeCanvasToWebpFile(
        canvas,
        file.name,
        100 * 1024,
      );
      await onConfirm(normalized.file);
      message.success(`Imagem salva (${formatBytes(normalized.bytes)})`);
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : 'Falha ao processar a imagem',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Ajustar imagem"
      onCancel={saving ? undefined : onCancel}
      destroyOnHidden
      maskClosable={!saving}
      keyboard={!saving}
      width={Math.min(720, typeof window !== 'undefined' ? window.innerWidth - 32 : 720)}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={saving}
          onClick={() => void handleSave()}
        >
          Salvar
        </Button>,
      ]}
    >
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        {PRESET_HINT[aspectPreset]}. Use o zoom e arraste para enquadrar.
      </Typography.Paragraph>

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 360,
          background: '#1c1917',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {imageSrc ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT_BY_PRESET[aspectPreset]}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid
          />
        ) : null}
      </div>

      <div style={{ marginTop: 16 }}>
        <Typography.Text strong>Zoom</Typography.Text>
        <Slider
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={setZoom}
          tooltip={{ formatter: (v) => `${Number(v ?? 1).toFixed(2)}x` }}
        />
      </div>
    </Modal>
  );
}
