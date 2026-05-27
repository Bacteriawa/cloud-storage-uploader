'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'zh';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    appTitle: 'R2 Uploader',
    connectedTo: 'Connected to',
    notConnected: 'Not connected',
    settings: 'Settings',
    upload: 'Upload',
    uploadQueue: 'Upload Queue',
    dragDrop: 'Drag & drop your files here',
    supportsLarge: 'Supports large files with automatic chunking',
    browseFiles: 'Browse Files',
    noFiles: 'No files found in this bucket.',
    name: 'Name',
    size: 'Size',
    lastModified: 'Last Modified',
    actions: 'Actions',
    pleaseConfigure: 'Please configure your Cloudflare R2 credentials to continue.',
    checkConfig: 'Check Configuration',
    unlockConfig: 'Unlock Configuration',
    r2Settings: 'R2 Settings',
    masterPassword: 'Master Password',
    passwordDesc: 'Enter your encryption password. If this is your first time, this password will be used to encrypt your R2 credentials locally and authenticate with the server.',
    accessKeyId: 'Access Key ID',
    secretAccessKey: 'Secret Access Key',
    bucketName: 'Bucket Name',
    endpoint: 'Endpoint',
    continue: 'Continue',
    back: 'Back',
    saveConfig: 'Save Configuration',
    confirmDelete: 'Are you sure you want to delete this file?',
    failedDelete: 'Failed to delete file',
    failedRename: 'Failed to rename file',
    failedDownload: 'Failed to get download URL',
  },
  zh: {
    appTitle: 'R2 上传工具',
    connectedTo: '已连接至',
    notConnected: '未连接',
    settings: '设置',
    upload: '上传',
    uploadQueue: '上传队列',
    dragDrop: '将文件拖拽至此处',
    supportsLarge: '支持大文件，自动分片上传',
    browseFiles: '浏览文件',
    noFiles: '存储桶中没有文件。',
    name: '名称',
    size: '大小',
    lastModified: '最后修改时间',
    actions: '操作',
    pleaseConfigure: '请先配置您的 Cloudflare R2 凭据以继续。',
    checkConfig: '检查配置',
    unlockConfig: '解锁配置',
    r2Settings: 'R2 设置',
    masterPassword: '主密码',
    passwordDesc: '请输入您的加密密码。如果是首次使用，该密码将用于本地加密您的 R2 凭据并向服务器进行身份验证。',
    accessKeyId: 'Access Key ID (访问密钥ID)',
    secretAccessKey: 'Secret Access Key (秘密访问密钥)',
    bucketName: 'Bucket Name (存储桶名称)',
    endpoint: 'Endpoint (节点URL)',
    continue: '继续',
    back: '返回',
    saveConfig: '保存配置',
    confirmDelete: '确定要删除这个文件吗？',
    failedDelete: '删除文件失败',
    failedRename: '重命名文件失败',
    failedDownload: '获取下载链接失败',
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('r2_lang') as Language;
    if (saved && (saved === 'en' || saved === 'zh')) {
      setLang(saved);
    } else {
      const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
      setLang(browserLang);
    }
    setMounted(true);
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('r2_lang', newLang);
  };

  const t = (key: string): string => {
    return (translations[lang] as any)[key] || key;
  };

  // Remove the early return that causes context to be undefined during SSR
  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
