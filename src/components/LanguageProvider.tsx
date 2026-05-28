'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'zh';
export type Theme = 'light' | 'dark';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    appTitle: 'Cloud Uploader',
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
    pleaseConfigure: 'Please configure your Object Storage (S3/R2/OSS/COS) credentials to continue.',
    checkConfig: 'Check Configuration',
    storageSettings: 'Storage Settings',
    accessKeyId: 'Access Key ID',
    secretAccessKey: 'Secret Access Key',
    bucketName: 'Bucket Name',
    region: 'Region',
    endpoint: 'Endpoint',
    publicDomain: 'Public Domain / CDN (Optional)',
    continue: 'Continue',
    back: 'Back',
    saveConfig: 'Save Configuration',
    confirmDelete: 'Are you sure you want to delete this file?',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    failedDelete: 'Failed to delete file',
    failedRename: 'Failed to rename file',
    failedDownload: 'Failed to get download URL',
    emptyFileError: 'Folders or 0-byte files are not supported',
    connecting: 'Connecting...',
    connectionFailed: 'Connection failed',
    paused: ' (Paused)',
    waitingForFile: ' (Waiting for file)',
    uploadingCount: ' uploading...',
    viewDetails: 'View',
    selectToResume: 'Select file to resume',
    cancel: 'Cancel',
    resume: 'Resume',
    pause: 'Pause',
  },
  zh: {
    appTitle: '云存储上传工具',
    connectedTo: '已连接至',
    notConnected: '未连接',
    settings: '设置',
    upload: '上传',
    uploadQueue: '上传队列',
    dragDrop: '将文件拖拽到此处',
    supportsLarge: '支持大文件上传，支持拖拽文件夹',
    browseFiles: '选择文件',
    noFiles: '存储桶中没有文件。',
    name: '名称',
    size: '大小',
    lastModified: '最后修改时间',
    actions: '操作',
    pleaseConfigure: '请先配置您的对象存储 (S3/R2/OSS/COS 等) 凭据以继续。',
    checkConfig: '检查配置',
    storageSettings: '存储设置',
    accessKeyId: 'Access Key ID (访问密钥ID)',
    secretAccessKey: 'Secret Access Key (秘密访问密钥)',
    bucketName: 'Bucket Name (存储桶名称)',
    region: 'Region (存储区域)',
    endpoint: 'Endpoint (节点URL)',
    publicDomain: '公开访问域名 / CDN (可选)',
    continue: '继续',
    back: '返回',
    saveConfig: '保存配置',
    confirmDelete: '确定要删除这个文件吗？',
    copyLink: '复制链接',
    copied: '已复制！',
    failedDelete: '删除文件失败',
    failedRename: '重命名文件失败',
    failedDownload: '获取下载链接失败',
    emptyFileError: '不支持上传文件夹或 0 字节的空文件',
    connecting: '连接中...',
    connectionFailed: '连接失败',
    paused: ' (已暂停)',
    waitingForFile: ' (等待选中文件)',
    uploadingCount: ' 个文件上传中...',
    viewDetails: '查看',
    selectToResume: '选择文件继续',
    cancel: '取消',
    resume: '继续',
    pause: '暂停',
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('r2_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
      setLang(savedLang);
    } else {
      const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
      setLang(browserLang);
    }

    const savedTheme = localStorage.getItem('r2_theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setThemeState(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
    
    setMounted(true);
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('r2_lang', newLang);
  };

  const handleSetTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('r2_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const t = (key: string): string => {
    return (translations[lang] as any)[key] || key;
  };

  // Remove the early return that causes context to be undefined during SSR
  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, theme, setTheme: handleSetTheme, t }}>
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
