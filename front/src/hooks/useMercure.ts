import { useEffect, useRef, useCallback } from 'react';

// URL du hub Mercure, configurable via variable d'environnement
const MERCURE_HUB_URL = import.meta.env.VITE_MERCURE_URL || 'http://localhost:3001/.well-known/mercure';

interface UseMercureOptions<T> {
  topic: string;
  onMessage: (data: T) => void;
  enabled?: boolean;
}

/**
 * Hook pour s'abonner a un topic Mercure via SSE.
 * Se reconnecte automatiquement en cas de deconnexion.
 */
export function useMercure<T>({ topic, onMessage, enabled = true }: UseMercureOptions<T>) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!enabled || !topic) return;

    const url = new URL(MERCURE_HUB_URL);
    url.searchParams.append('topic', topic);

    const eventSource = new EventSource(url.toString());
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T;
        onMessageRef.current(data);
      } catch {
        // Donnees non JSON, on ignore
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Reconnexion apres 3 secondes
      setTimeout(connect, 3000);
    };
  }, [topic, enabled]);

  useEffect(() => {
    connect();

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [connect]);
}
