import { useState, useCallback } from 'react';
import { get, del, patch } from '@/services/api';
import type { User, HydraCollection } from '@/types';

// Direction de tri
type SortOrder = 'asc' | 'desc';

// Donnees partielles pour la mise a jour
interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

interface UseUsersReturn {
  users: User[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  search: string;
  sortBy: string;
  sortOrder: SortOrder;
  isLoading: boolean;
  setSearch: (value: string) => void;
  setSortBy: (value: string) => void;
  setSortOrder: (value: SortOrder) => void;
  fetchUsers: (page?: number, searchTerm?: string, sort?: string, order?: SortOrder) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (id: string, data: UserUpdateData) => Promise<User>;
}

// Nombre d'elements par page
const ITEMS_PER_PAGE = 10;

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isLoading, setIsLoading] = useState(false);

  // Construction des parametres de requete pour les filtres API Platform
  const buildQueryParams = useCallback(
    (page: number, searchTerm: string, sort: string, order: SortOrder): string => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('itemsPerPage', String(ITEMS_PER_PAGE));

      if (searchTerm) {
        params.set('search', searchTerm);
      }

      if (sort) {
        params.set(`order[${sort}]`, order);
      }

      return params.toString();
    },
    [],
  );

  // Extraction du nombre total de pages a partir de la vue Hydra
  const extractTotalPages = useCallback((collection: HydraCollection<User>): number => {
    const total = collection['hydra:totalItems'];
    return Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  }, []);

  // Recuperation de la liste des utilisateurs
  const fetchUsers = useCallback(
    async (
      page: number = currentPage,
      searchTerm: string = search,
      sort: string = sortBy,
      order: SortOrder = sortOrder,
    ) => {
      setIsLoading(true);
      try {
        const query = buildQueryParams(page, searchTerm, sort, order);
        const response = await get<HydraCollection<User>>(`/users?${query}`);

        setUsers(response['hydra:member']);
        setTotalItems(response['hydra:totalItems']);
        setCurrentPage(page);
        setTotalPages(extractTotalPages(response));
      } catch {
        setUsers([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, search, sortBy, sortOrder, buildQueryParams, extractTotalPages],
  );

  // Suppression d'un utilisateur
  const deleteUser = useCallback(
    async (id: string) => {
      await del(`/users/${id}`);
      // Rafraichissement de la liste apres suppression
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setTotalItems((prev) => prev - 1);
    },
    [],
  );

  // Mise a jour d'un utilisateur
  const updateUser = useCallback(async (id: string, data: UserUpdateData): Promise<User> => {
    const updated = await patch<User>(`/users/${id}`, data);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  }, []);

  return {
    users,
    totalItems,
    currentPage,
    totalPages,
    search,
    sortBy,
    sortOrder,
    isLoading,
    setSearch,
    setSortBy,
    setSortOrder,
    fetchUsers,
    deleteUser,
    updateUser,
  };
}
