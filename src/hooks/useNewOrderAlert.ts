import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  getSoundEnabled,
  isAudioReady,
  playNewOrderAlert,
  setSoundEnabled,
  subscribeSoundState,
  unlockOrderAlertAudio,
} from '../utils/orderAlertSound';

function useSoundStore() {
  const soundEnabled = useSyncExternalStore(
    subscribeSoundState,
    getSoundEnabled,
    getSoundEnabled,
  );
  const audioReady = useSyncExternalStore(
    subscribeSoundState,
    isAudioReady,
    () => false,
  );
  return { soundEnabled, audioReady };
}

export function useNewOrderAlert() {
  const permissionAsked = useRef(false);
  const { soundEnabled, audioReady } = useSoundStore();
  const [, bump] = useState(0);

  useEffect(() => {
    const unlock = () => {
      void unlockOrderAlertAudio();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeSoundState(() => bump((n) => n + 1));
    return () => {
      unsubscribe();
    };
  }, []);

  const unlockAudio = useCallback(async () => {
    return unlockOrderAlertAudio();
  }, []);

  const toggleSound = useCallback(async () => {
    const next = !getSoundEnabled();
    setSoundEnabled(next);
    if (next) {
      await unlockOrderAlertAudio();
      await playNewOrderAlert();
    }
  }, []);

  const notifyNewQueued = useCallback((count: number) => {
    void playNewOrderAlert();

    if (typeof Notification === 'undefined') return;

    const title =
      count === 1 ? 'Novo pedido na fila' : `${count} novos pedidos na fila`;
    const body = 'Abra a cozinha SmartFood para ver os detalhes.';

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, { body, silent: true });
      } catch {
        // ignore
      }
      return;
    }

    if (Notification.permission === 'default' && !permissionAsked.current) {
      permissionAsked.current = true;
      void Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          try {
            new Notification(title, { body, silent: true });
          } catch {
            // ignore
          }
        }
      });
    }
  }, []);

  return {
    notifyNewQueued,
    soundEnabled,
    audioReady,
    toggleSound,
    unlockAudio,
  };
}
