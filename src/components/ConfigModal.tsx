'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Lock, Cloud, Key, Shield, X } from 'lucide-react';
import { R2Config, saveConfig, loadConfig } from '@/lib/config';
import { useTranslation } from './LanguageProvider';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: R2Config) => void;
}

export default function ConfigModal({ isOpen, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<Partial<R2Config>>({
    accessKeyId: '',
    secretAccessKey: '',
    bucket: '',
    endpoint: ''
  });

  useEffect(() => {
    if (isOpen) {
      const existing = loadConfig();
      if (existing) {
        setConfig(existing);
      }
    }
  }, [isOpen]);

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.accessKeyId || !config.secretAccessKey || !config.bucket || !config.endpoint) return;
    
    const finalConfig = {
      ...config
    } as R2Config;
    
    saveConfig(finalConfig);
    onSave(finalConfig);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="modal-content glass-panel"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: 'var(--accent)' }}>
                  <Settings size={24} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>
                  {t('r2Settings')}
                </h2>
              </div>
              <button type="button" onClick={onClose} className="btn-outline" style={{ border: 'none', padding: '8px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfigSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <Key size={14} /> {t('accessKeyId')}
                  </label>
                  <input
                    type="text"
                    required
                    value={config.accessKeyId}
                    onChange={e => setConfig(prev => ({ ...prev, accessKeyId: e.target.value }))}
                    className="input-field"
                    placeholder="e.g. 1234567890abcdef"
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <Shield size={14} /> {t('secretAccessKey')}
                  </label>
                  <input
                    type="password"
                    required
                    value={config.secretAccessKey}
                    onChange={e => setConfig(prev => ({ ...prev, secretAccessKey: e.target.value }))}
                    className="input-field"
                    placeholder="Enter secret key..."
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <Cloud size={14} /> {t('bucketName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={config.bucket}
                    onChange={e => setConfig(prev => ({ ...prev, bucket: e.target.value }))}
                    className="input-field"
                    placeholder="my-bucket"
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <Cloud size={14} /> {t('endpoint')}
                  </label>
                  <input
                    type="text"
                    required
                    value={config.endpoint}
                    onChange={e => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                    className="input-field"
                    placeholder="https://<account_id>.r2.cloudflarestorage.com"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  {t('saveConfig')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
