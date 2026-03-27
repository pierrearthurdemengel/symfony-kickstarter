import { useEffect, useState, useCallback } from 'react';
import { get, post, put, del } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import AdminLayout from '@/components/Layout/AdminLayout';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import type { PermissionGroup, PermissionCategory, Permission, ApiError } from '@/types';

/**
 * Page d'administration des groupes de permissions RBAC.
 * Permet de creer, modifier et supprimer des groupes avec leurs permissions.
 */
export default function PermissionGroups() {
  const { addToast } = useToast();

  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de creation/edition
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PermissionGroup | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [groupsData, permissionsData] = await Promise.all([
        get<PermissionGroup[]>('/admin/permission-groups'),
        get<PermissionCategory[]>('/admin/permissions'),
      ]);
      setGroups(groupsData);
      setCategories(permissionsData);
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditingGroup(null);
    setFormName('');
    setFormDescription('');
    setFormPermissions([]);
    setShowModal(true);
  };

  const openEdit = (group: PermissionGroup) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormDescription(group.description);
    setFormPermissions(group.permissions.map((p) => p.id));
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingGroup) {
        await put(`/admin/permission-groups/${editingGroup.id}`, {
          name: formName,
          description: formDescription,
          permissions: formPermissions,
        });
        addToast('success', 'Groupe mis a jour.');
      } else {
        await post('/admin/permission-groups', {
          name: formName,
          description: formDescription,
          permissions: formPermissions,
        });
        addToast('success', 'Groupe cree.');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group: PermissionGroup) => {
    if (!confirm(`Supprimer le groupe "${group.name}" ?`)) return;
    try {
      await del(`/admin/permission-groups/${group.id}`);
      addToast('success', 'Groupe supprime.');
      loadData();
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors de la suppression.');
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Permissions">
        <div className="flex items-center justify-center py-12">
          <svg className="h-8 w-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Groupes de permissions">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-secondary-600 dark:text-gray-400">
          {groups.length} groupe(s) de permissions
        </p>
        <Button onClick={openCreate} size="sm">
          Nouveau groupe
        </Button>
      </div>

      {/* Liste des groupes */}
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  {group.name}
                </h3>
                <p className="mt-1 text-sm text-secondary-600 dark:text-gray-400">
                  {group.description}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(group)}
                  className="rounded-lg p-2 text-secondary-500 hover:bg-secondary-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  title="Modifier"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(group)}
                  className="rounded-lg p-2 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                  title="Supprimer"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {/* Tags des permissions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {group.permissions.map((perm) => (
                <span
                  key={perm.id}
                  className="inline-flex rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                >
                  {perm.name}
                </span>
              ))}
              {group.permissions.length === 0 && (
                <span className="text-xs text-secondary-400 dark:text-gray-500">
                  Aucune permission
                </span>
              )}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="py-12 text-center text-secondary-500 dark:text-gray-400">
            Aucun groupe de permissions. Commencez par en creer un.
          </div>
        )}
      </div>

      {/* Modal de creation/edition */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-bold text-secondary-900 dark:text-white">
              {editingGroup ? 'Modifier le groupe' : 'Nouveau groupe'}
            </h3>

            <Input
              label="Nom"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: Moderateur"
            />
            <Input
              label="Description"
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Description du groupe"
            />

            {/* Selection des permissions par categorie */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-gray-300">
                Permissions
              </label>
              {categories.map((cat) => (
                <div key={cat.category} className="mb-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-gray-400">
                    {cat.category}
                  </p>
                  <div className="space-y-1">
                    {cat.permissions.map((perm: Permission) => (
                      <label
                        key={perm.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary-50 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={formPermissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-secondary-900 dark:text-white">
                            {perm.name}
                          </span>
                          <span className="ml-2 text-xs text-secondary-500 dark:text-gray-400">
                            {perm.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} isLoading={saving} disabled={!formName.trim()}>
                {editingGroup ? 'Mettre a jour' : 'Creer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
