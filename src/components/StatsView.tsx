'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, File as FileIcon, Clock, TrendingUp, ChevronLeft, ArrowUpRight, ArrowDown } from 'lucide-react';
import { R2File } from './FileList';
import { useTranslation } from './LanguageProvider';

interface Props {
  files: R2File[];
  onBack: () => void;
}

export default function StatsView({ files, onBack }: Props) {
  const { t } = useTranslation();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = useMemo(() => {
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const sortedBySize = [...files].sort((a, b) => b.size - a.size);
    const largestFile = sortedBySize[0];
    
    // Group by extension
    const extMap: Record<string, { count: number, size: number }> = {};
    files.forEach(f => {
      const ext = f.key.split('.').pop()?.toLowerCase() || 'unknown';
      if (!extMap[ext]) extMap[ext] = { count: 0, size: 0 };
      extMap[ext].count++;
      extMap[ext].size += f.size;
    });

    const exts = Object.entries(extMap)
      .map(([ext, data]) => ({ ext, ...data }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 5); // top 5 extensions by size

    return { totalSize, largestFile, exts };
  }, [files]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-panel" 
      style={{ padding: '32px', minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{t('storageDashboard') || 'Storage Dashboard'}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>{t('storageOverview') || 'Overview of your cloud storage footprint'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', color: 'var(--accent)' }}>
            <HardDrive size={32} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('storageUsed') || 'Storage Used'}</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '32px', fontWeight: 700 }}>{formatSize(stats.totalSize)}</h3>
          </div>
        </div>

        <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', color: 'var(--success)' }}>
            <FileIcon size={32} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('totalFiles') || 'Total Files'}</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '32px', fontWeight: 700 }}>{files.length}</h3>
          </div>
        </div>

        <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '16px', color: '#f59e0b' }}>
            <TrendingUp size={32} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('largestFile') || 'Largest File'}</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {stats.largestFile ? stats.largestFile.key : 'N/A'}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--accent)' }}>
              {stats.largestFile ? formatSize(stats.largestFile.size) : ''}
            </p>
          </div>
        </div>
      </div>

      {stats.exts.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpRight size={20} color="var(--accent)" /> {t('spaceByType') || 'Space by File Type'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {stats.exts.map(ext => (
              <div key={ext.ext} style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 600, fontSize: '16px', textTransform: 'uppercase' }}>.{ext.ext}</span>
                  <span style={{ fontSize: '12px', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-secondary)' }}>
                    {ext.count} {t('filesCount') || 'files'}
                  </span>
                </div>
                <div style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 700 }}>
                  {formatSize(ext.size)}
                </div>
                <div className="progress-bar-bg" style={{ height: '4px', margin: 0 }}>
                  <div className="progress-bar-fill" style={{ width: `${(ext.size / stats.totalSize) * 100}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
