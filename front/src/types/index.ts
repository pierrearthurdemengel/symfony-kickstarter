import type { ReactNode } from 'react';

// Types pour l'objet media
export interface MediaObject {
  id: string;
  filePath: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

// Types pour l'entite User
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  avatar: MediaObject | null;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

// Statistiques avancees du dashboard admin
export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  verificationRate: number;
  registrationsByMonth: RegistrationsByMonth[];
  roleDistribution: Record<string, number>;
  auditCounts: AuditActionCount[];
}

// Inscriptions par mois (graphique)
export interface RegistrationsByMonth {
  month: string;
  count: number;
}

// Comptage des actions d'audit
export interface AuditActionCount {
  action: string;
  total: number;
}

// Entree du journal d'audit
export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: Record<string, unknown>;
  performedBy: string | null;
  ipAddress: string | null;
  createdAt: string;
}

// Reponse paginee du journal d'audit
export interface AuditLogResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refresh_token?: string;
  requires2fa?: boolean;
}

// Types pour le reset de mot de passe
export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  password: string;
}

// Types pour la mise a jour du profil
export interface UpdateProfileData {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Types pour la vue de pagination Hydra
export interface HydraView {
  '@id': string;
  '@type': string;
  'hydra:first'?: string;
  'hydra:last'?: string;
  'hydra:next'?: string;
  'hydra:previous'?: string;
}

// Types pour les reponses API Platform (Hydra)
export interface HydraCollection<T> {
  '@context': string;
  '@id': string;
  '@type': string;
  'hydra:totalItems': number;
  'hydra:member': T[];
  'hydra:view'?: HydraView;
}

// Types pour les erreurs API
export interface ApiError {
  message: string;
  status: number;
}

// Types pour la pagination
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Types pour les colonnes de DataTable
export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

// Types pour les notifications in-app
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

// Reponse paginee des notifications
export interface NotificationResponse {
  items: Notification[];
  total: number;
  unread: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour les toasts
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// Types pour les permissions RBAC
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface PermissionCategory {
  category: string;
  permissions: Permission[];
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
}

// Types pour le 2FA
export interface TwoFactorEnableResponse {
  secret: string;
  otpauthUri: string;
}

export interface TwoFactorConfirmResponse {
  message: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyResponse {
  token: string;
  backupCodeUsed: boolean;
}

// Types pour OAuth
export interface OAuthUrlResponse {
  url: string;
}

// Types pour l'impersonation
export interface ImpersonateResponse {
  token: string;
  impersonatedUser: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}
