'use client';

import { useState, useMemo } from 'react';
import { File as FileIcon, Trash2, Edit2, Download, Link as LinkIcon, Check, Search, X, Folder, ArrowLeft, ChevronRight } from 'lucide-react';
import { R2Config } from '@/lib/config';
import { deleteFile, renameFile, getDownloadUrl } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from './LanguageProvider';
import { useToast } from './Toast';
import { ConfirmModal } from './common/ConfirmModal';

export interface R2File {
  key: string;
  size: number;
  lastModified: string;
}

interface Props {
  files: R2File[];
  config: R2Config;
  currentPrefix: string;
  setCurrentPrefix: (prefix: string) => void;
  onRefresh: () => void;
  onPreview: (key: string) => void;
}

export default function FileList({ files, config, currentPrefix, setCurrentPrefix, onRefresh, onPreview }: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [renamingKey, setRenamingKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const filteredFiles = useMemo(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      return files.filter(f => f.key.toLowerCase().includes(lowerQuery));
    }

    const items = new Map<string, R2File>();

    for (const f of files) {
      if (!f.key.startsWith(currentPrefix)) continue;
      
      const relativePath = f.key.substring(currentPrefix.length);
      if (relativePath === '') continue; // self folder marker

      const slashIndex = relativePath.indexOf('/');
      if (slashIndex === -1) {
        items.set(f.key, f);
      } else {
        const folderName = relativePath.substring(0, slashIndex + 1);
        const folderKey = currentPrefix + folderName;
        if (!items.has(folderKey)) {
          items.set(folderKey, {
            key: folderKey,
            size: 0,
            lastModified: f.lastModified
          });
        }
      }
    }

    return Array.from(items.values()).sort((a, b) => {
      const aIsFolder = a.key.endsWith('/');
      const bIsFolder = b.key.endsWith('/');
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      return a.key.localeCompare(b.key);
    });
  }, [files, searchQuery, currentPrefix]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const executeDelete = async () => {
    if (!fileToDelete) return;
    const key = fileToDelete;
    setFileToDelete(null);
    try {
      setLoading(key);
      await deleteFile(config, key);
      onRefresh();
      showToast(t('deleteSuccess') || 'File deleted successfully', 'success');
      if (selectedKeys.has(key)) {
        const newSet = new Set(selectedKeys);
        newSet.delete(key);
        setSelectedKeys(newSet);
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t('failedDelete'), 'error');
    } finally {
      setLoading(null);
    }
  };

  const executeBatchDelete = async () => {
    setShowBatchConfirm(false);
    setIsBatchDeleting(true);
    let successCount = 0;
    try {
      const keys = Array.from(selectedKeys);
      await Promise.all(
        keys.map(async (key) => {
          await deleteFile(config, key);
          successCount++;
        })
      );
      onRefresh();
      showToast(t('batchDeleteSuccess') || `Batch deletion successful (${successCount})`, 'success');
      setSelectedKeys(new Set());
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t('failedDelete'), 'error');
      onRefresh();
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const handleRename = async (oldKey: string) => {
    if (!newKey || newKey === oldKey) {
      setRenamingKey(null);
      return;
    }
    try {
      setLoading(oldKey);
      await renameFile(config, oldKey, newKey);
      setRenamingKey(null);
      onRefresh();
      showToast(t('renameSuccess') || 'File renamed successfully', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t('failedRename'), 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async (key: string) => {
    try {
      setLoading(key);
      const url = await getDownloadUrl(config, key);
      const a = document.createElement('a');
      a.href = url;
      a.download = key;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t('failedDownload'), 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleCopyLink = async (key: string) => {
    if (!config.publicDomain) return;
    
    // ensure domain ends without slash
    const domain = config.publicDomain.endsWith('/') 
      ? config.publicDomain.slice(0, -1) 
      : config.publicDomain;
      
    // ensure domain starts with http
    const fullDomain = domain.startsWith('http') ? domain : `https://${domain}`;
    
    const url = `${fullDomain}/${encodeURIComponent(key)}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      showToast(t('copied'), 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      showToast(t('copyError') || 'Failed to copy to clipboard', 'error');
      console.error('Failed to copy', e);
    }
  };

  if (files.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px', color: 'var(--text-secondary)' }}>
        <FileIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
        <p>{t('noFiles')}</p>
      </div>
    );
  }

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {files.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '40px', paddingRight: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
              placeholder={t('searchFiles') || 'Search files...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedKeys.size > 0 ? (
              <>
                <span style={{ color: 'var(--accent)' }}>{selectedKeys.size} {t('selectedFiles')}</span>
                <button className="btn-outline action-icon" onClick={() => setSelectedKeys(new Set())} title={t('cancelSelection')} style={{ padding: '4px', border: 'none' }}><X size={14} /></button>
                <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setShowBatchConfirm(true)} disabled={isBatchDeleting}>
                  <Trash2 size={14} /> {isBatchDeleting ? '...' : t('batchDelete')}
                </button>
              </>
            ) : (
              <>{filteredFiles.length} {t('filesCount') || 'files'}</>
            )}
          </div>
        </div>
      )}

      {currentPrefix && !searchQuery && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', margin: '0 8px', border: '1px solid var(--glass-border)' }}>
          <button className="btn-outline action-icon" onClick={() => {
            const parts = currentPrefix.split('/').filter(Boolean);
            parts.pop();
            setCurrentPrefix(parts.length ? parts.join('/') + '/' : '');
          }} style={{ padding: '6px', border: 'none', background: 'var(--bg-primary)' }}>
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Folder size={14} color="var(--accent)" />
            /{currentPrefix}
          </span>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
          <tr>
            <th style={{ width: '40px', textAlign: 'center' }}>
              <input 
                type="checkbox" 
                checked={filteredFiles.length > 0 && selectedKeys.size === filteredFiles.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKeys(new Set(filteredFiles.map(f => f.key)));
                  } else {
                    setSelectedKeys(new Set());
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </th>
            <th>{t('name')}</th>
            <th>{t('size')}</th>
            <th>{t('lastModified')}</th>
            <th style={{ textAlign: 'right' }}>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {filteredFiles.map(file => (
              <motion.tr 
                key={file.key}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <td style={{ textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedKeys.has(file.key)}
                    onChange={(e) => {
                      const newSet = new Set(selectedKeys);
                      if (e.target.checked) newSet.add(file.key);
                      else newSet.delete(file.key);
                      setSelectedKeys(newSet);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td data-label={t('name') || 'Name'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {file.key.endsWith('/') ? <Folder size={18} color="var(--accent)" /> : <FileIcon size={18} color="var(--accent)" />}
                    {renamingKey === file.key && !file.key.endsWith('/') ? (
                      <input
                        autoFocus
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        onBlur={() => handleRename(file.key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(file.key);
                          if (e.key === 'Escape') setRenamingKey(null);
                        }}
                        className="input-field"
                        style={{ padding: '6px 10px', width: '200px' }}
                      />
                    ) : (
                      <span 
                        onClick={() => {
                          if (file.key.endsWith('/')) {
                            setCurrentPrefix(file.key);
                            setSearchQuery('');
                          } else {
                            onPreview(file.key);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                        className={file.key.endsWith('/') ? "filename-link folder" : "filename-link"}
                        title={file.key.endsWith('/') ? (t('enterFolder') || 'Enter folder') : (t('preview') || 'Click to preview')}
                      >
                        {searchQuery ? file.key : file.key.substring(currentPrefix.length)}
                      </span>
                    )}
                  </div>
                </td>
                <td data-label={t('size') || 'Size'} style={{ color: 'var(--text-secondary)' }}>{formatSize(file.size)}</td>
                <td data-label={t('lastModified') || 'Last Modified'} style={{ color: 'var(--text-secondary)' }}>{formatDate(file.lastModified)}</td>
                <td data-label={t('actions') || 'Actions'}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', opacity: loading === file.key ? 0.5 : 1, pointerEvents: loading === file.key ? 'none' : 'auto' }}>
                    {!file.key.endsWith('/') && (
                      <>
                        {config.publicDomain && (
                          <button 
                            className="btn-outline action-icon"
                            style={{ border: 'none' }}
                            onClick={() => handleCopyLink(file.key)}
                            title={copiedKey === file.key ? t('copied') : t('copyLink')}
                          >
                            {copiedKey === file.key ? <Check size={16} color="var(--success)" /> : <LinkIcon size={16} />}
                          </button>
                        )}
                        <button 
                          className="btn-outline action-icon"
                          style={{ border: 'none' }}
                          onClick={() => handleDownload(file.key)}
                          title={t('download') || 'Download'}
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          className="btn-outline action-icon"
                          style={{ border: 'none' }}
                          onClick={() => {
                            setRenamingKey(file.key);
                            setNewKey(file.key);
                          }}
                          title={t('rename') || 'Rename'}
                        >
                          <Edit2 size={16} />
                        </button>
                      </>
                    )}
                    <button 
                      className="btn-outline action-icon delete"
                      style={{ border: 'none' }}
                      onClick={() => setFileToDelete(file.key)}
                      title={t('delete') || 'Delete'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filteredFiles.length === 0 && searchQuery && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  {t('noSearchResults') || 'No files match your search.'}
                </td>
              </tr>
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
    </div>
    <ConfirmModal
      isOpen={!!fileToDelete}
      message={t('confirmDelete') || 'Are you sure you want to delete this file?'}
      onConfirm={executeDelete}
      onCancel={() => setFileToDelete(null)}
    />
    <ConfirmModal
      isOpen={showBatchConfirm}
      message={t('batchDeleteConfirm') || 'Are you sure you want to delete the selected files?'}
      onConfirm={executeBatchDelete}
      onCancel={() => setShowBatchConfirm(false)}
    />
    </>
  );
}
