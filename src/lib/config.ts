import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

export interface R2Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
  sitePassword?: string;
}

const STORAGE_KEY = 'r2_uploader_config';

export function saveConfig(config: R2Config, encryptionKey: string) {
  const jsonStr = JSON.stringify(config);
  const encrypted = AES.encrypt(jsonStr, encryptionKey).toString();
  localStorage.setItem(STORAGE_KEY, encrypted);
  localStorage.setItem('r2_site_password', config.sitePassword || '');
}

export function loadConfig(decryptionKey: string): R2Config | null {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;

  try {
    const decryptedBytes = AES.decrypt(encrypted, decryptionKey);
    const decryptedStr = decryptedBytes.toString(encUtf8);
    if (!decryptedStr) return null;
    
    return JSON.parse(decryptedStr) as R2Config;
  } catch (e) {
    return null;
  }
}

export function getSitePassword(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('r2_site_password') || '';
  }
  return '';
}

export function hasConfig(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(STORAGE_KEY);
  }
  return false;
}

export function clearConfig() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('r2_site_password');
}
