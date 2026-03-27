import { useState, useCallback, useEffect, useRef } from 'react';
import { get, post, patch, del } from '@/services/api';
import type { NotificationResponse, Notification } from '@/types';

// Intervalle de polling pour les nouvelles notifications (30 secondes)
const POLL_INTERVAL = 30_000;

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

/**
 * Hook de gestion des notifications utilisateur.
 * Inclut un polling automatique pour le compteur non lu.
 */
export function useNotifications(enablePolling = false): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Recupere la liste paginee des notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true);
    try {
      const response = await get<NotificationResponse>(
        `/notifications?page=${page}&limit=${limit}`,
      );
      setNotifications(response.items);
      setUnreadCount(response.unread);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recupere uniquement le compteur non lu (leger, pour le polling)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await get<{ count: number }>('/notifications/unread-count');
      setUnreadCount(response.count);
    } catch {
      // Silencieux en cas d'erreur de polling
    }
  }, []);

  // Marque une notification comme lue
  const markAsRead = useCallback(async (id: string) => {
    await patch(`/notifications/${id}/read`, {});
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Marque toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    await post('/notifications/mark-all-read', {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  // Supprime une notification
  const deleteNotification = useCallback(async (id: string) => {
    await del(`/notifications/${id}`);
    setNotifications((prev) => {
      const removed = prev.find((n) => n.id === id);
      if (removed && !removed.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  // Polling du compteur non lu
  useEffect(() => {
    if (!enablePolling) return;

    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enablePolling, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    total,
    totalPages,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
