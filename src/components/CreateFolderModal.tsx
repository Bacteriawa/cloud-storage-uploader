import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, X } from 'lucide-react';
import { R2Config } from '@/lib/config';
import { createFolder } from '@/lib/api';
import { useTranslation } from './LanguageProvider';
import { useToast } from './Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: R2Config;
  currentPrefix: string;
  onSuccess: () => void;
}

export default function CreateFolderModal({ isOpen, onClose, config, currentPrefix, onSuccess }: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [folderNameToCreate, setFolderNameToCreate] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const handleCreateFolder = async () => {
    if (!folderNameToCreate.trim()) return;
    setIsCreatingFolder(true);
    try {
      const fullPath = currentPrefix + folderNameToCreate.trim();
      await createFolder(config, fullPath);
      showToast(t('createFolderSuccess') || 'Folder created successfully', 'success');
      setFolderNameToCreate('');
      onSuccess();
      onClose();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to create folder', 'error');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ zIndex: 1050 }}
        >
          <motion.div
            className="modal-content glass-panel"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            style={{ padding: '24px', maxWidth: '400px', width: '90%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={20} color="var(--accent)" />
                {t('createFolder') || 'Create Folder'}
              </h3>
              <button className="action-icon" onClick={onClose} style={{ border: 'none', background: 'transparent' }}>
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              className="input-field"
              placeholder={t('folderName') || 'Folder Name'}
              value={folderNameToCreate}
              onChange={e => setFolderNameToCreate(e.target.value)}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') onClose();
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-outline" onClick={onClose} disabled={isCreatingFolder}>
                {t('cancel') || 'Cancel'}
              </button>
              <button className="btn btn-primary" onClick={handleCreateFolder} disabled={!folderNameToCreate.trim() || isCreatingFolder}>
                {isCreatingFolder ? '...' : (t('createFolder') || 'Create Folder')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
