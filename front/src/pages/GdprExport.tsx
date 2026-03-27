import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { get, post } from '@/services/api';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import type { ApiError } from '@/types';

/**
 * Page RGPD : export de donnees et suppression de compte.
 */
export default function GdprExport() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  // Export des donnees personnelles
  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await get<Record<string, unknown>>('/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donnees-personnelles-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('success', 'Export telecharge.');
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || "Erreur lors de l'export.");
    } finally {
      setExporting(false);
    }
  };

  // Suppression du compte
  const handleDelete = async () => {
    if (!deletePassword) return;
    setDeleting(true);
    try {
      await post('/me/delete', { password: deletePassword });
      addToast('success', 'Compte supprime.');
      logout();
      navigate('/');
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-secondary-900 dark:text-white">
        Mes donnees personnelles
      </h1>

      {/* Export */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-md dark:bg-gray-800 sm:p-8">
        <h2 className="mb-4 text-xl font-semibold text-secondary-900 dark:text-white">
          Exporter mes donnees
        </h2>
        <p className="mb-4 text-sm text-secondary-600 dark:text-gray-400">
          Telechargez une copie de toutes vos donnees personnelles au format JSON (droit
          d&apos;acces RGPD, Article 15).
        </p>
        <Button onClick={handleExport} isLoading={exporting}>
          Telecharger mes donnees
        </Button>
      </div>

      {/* Suppression */}
      <div className="rounded-xl border-2 border-danger-200 bg-white p-6 shadow-md dark:border-danger-800 dark:bg-gray-800 sm:p-8">
        <h2 className="mb-4 text-xl font-semibold text-danger-600 dark:text-danger-400">
          Supprimer mon compte
        </h2>
        <p className="mb-4 text-sm text-secondary-600 dark:text-gray-400">
          Cette action est irreversible. Toutes vos donnees seront supprimees (droit a
          l&apos;effacement RGPD, Article 17).
        </p>

        {!showDelete ? (
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            Supprimer mon compte
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-danger-50 p-4 text-sm text-danger-700 dark:bg-danger-900/20 dark:text-danger-400">
              Confirmez en entrant votre mot de passe. Cette action est definitive.
            </div>
            <Input
              label="Mot de passe"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Votre mot de passe actuel"
            />
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={deleting}
                disabled={!deletePassword}
              >
                Confirmer la suppression
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDelete(false);
                  setDeletePassword('');
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
