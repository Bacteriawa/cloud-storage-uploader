export interface R2Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
  region?: string;
  publicDomain?: string;
  sitePassword?: string;
}

const STORAGE_KEY = 'r2_uploader_config';

export function saveConfig(config: R2Config) {
  const jsonStr = JSON.stringify(config);
  localStorage.setItem(STORAGE_KEY, jsonStr);
  if (config.sitePassword) {
    localStorage.setItem('r2_site_password', config.sitePassword);
  }
}

export function loadConfig(): R2Config | null {
  const jsonStr = localStorage.getItem(STORAGE_KEY);
  if (!jsonStr) return null;

  try {
    return JSON.parse(jsonStr) as R2Config;
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
