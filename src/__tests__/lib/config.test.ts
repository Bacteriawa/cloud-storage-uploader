import {
  R2Config,
  saveConfig,
  loadConfig,
  loadAllConfigs,
  saveAllConfigs,
  hasConfig,
  clearConfig,
  getSitePassword,
} from '@/lib/config';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(global, 'window', { value: {}, writable: true });
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

const sampleConfig: R2Config = {
  id: 'test-1',
  label: 'Test Profile',
  provider: 'r2',
  accessKeyId: 'ak123',
  secretAccessKey: 'sk456',
  bucket: 'my-bucket',
  endpoint: 'https://example.r2.cloudflarestorage.com',
  region: 'auto',
  publicDomain: 'https://cdn.example.com',
};

describe('config.ts', () => {
  describe('saveConfig / loadConfig', () => {
    it('saves and loads a config', () => {
      saveConfig(sampleConfig);
      const loaded = loadConfig();
      expect(loaded).not.toBeNull();
      expect(loaded!.accessKeyId).toBe('ak123');
      expect(loaded!.bucket).toBe('my-bucket');
    });

    it('auto-generates id if missing', () => {
      const noId: R2Config = { ...sampleConfig, id: undefined };
      saveConfig(noId);
      const loaded = loadConfig();
      expect(loaded!.id).toBeDefined();
      expect(loaded!.id!.length).toBeGreaterThan(0);
    });

    it('auto-generates label if missing', () => {
      const noLabel: R2Config = { ...sampleConfig, label: undefined };
      saveConfig(noLabel);
      const loaded = loadConfig();
      expect(loaded!.label).toBe('my-bucket'); // falls back to bucket name
    });

    it('saves sitePassword separately', () => {
      saveConfig({ ...sampleConfig, sitePassword: 'secret123' });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('cloud_storage_site_password', 'secret123');
    });
  });

  describe('loadConfig', () => {
    it('returns null when no config exists', () => {
      expect(loadConfig()).toBeNull();
    });

    it('returns null for corrupt JSON', () => {
      localStorageMock.setItem('cloud_storage_uploader_config', 'not-json{{{');
      expect(loadConfig()).toBeNull();
    });
  });

  describe('hasConfig', () => {
    it('returns false when no config', () => {
      expect(hasConfig()).toBe(false);
    });

    it('returns true when config exists', () => {
      saveConfig(sampleConfig);
      expect(hasConfig()).toBe(true);
    });
  });

  describe('clearConfig', () => {
    it('removes config and site password', () => {
      saveConfig({ ...sampleConfig, sitePassword: 'pwd' });
      clearConfig();
      expect(loadConfig()).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cloud_storage_uploader_config');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cloud_storage_site_password');
    });
  });

  describe('loadAllConfigs / saveAllConfigs', () => {
    it('returns empty array when nothing saved', () => {
      expect(loadAllConfigs()).toEqual([]);
    });

    it('migrates single config to list on first call', () => {
      // Save via saveConfig (single mode) but don't save to list
      localStorageMock.setItem('cloud_storage_uploader_config', JSON.stringify(sampleConfig));
      const configs = loadAllConfigs();
      expect(configs.length).toBe(1);
      expect(configs[0].id).toBe('default');
      expect(configs[0].label).toBe('Default Profile');
    });

    it('returns stored list', () => {
      const configs = [sampleConfig, { ...sampleConfig, id: 'test-2', bucket: 'other-bucket' }];
      saveAllConfigs(configs);
      const loaded = loadAllConfigs();
      expect(loaded.length).toBe(2);
      expect(loaded[1].bucket).toBe('other-bucket');
    });

    it('handles corrupt JSON gracefully', () => {
      localStorageMock.setItem('cloud_storage_uploader_configs_list', 'broken!!!');
      expect(loadAllConfigs()).toEqual([]);
    });
  });

  describe('saveConfig updates profile list', () => {
    it('adds new profile to list', () => {
      saveConfig(sampleConfig);
      const all = loadAllConfigs();
      expect(all.some(c => c.id === sampleConfig.id)).toBe(true);
    });

    it('updates existing profile in list', () => {
      saveConfig(sampleConfig);
      saveConfig({ ...sampleConfig, bucket: 'updated-bucket' });
      const all = loadAllConfigs();
      const match = all.find(c => c.id === sampleConfig.id);
      expect(match!.bucket).toBe('updated-bucket');
    });
  });

  describe('getSitePassword', () => {
    it('returns empty string when not set', () => {
      expect(getSitePassword()).toBe('');
    });

    it('returns saved password', () => {
      localStorageMock.setItem('cloud_storage_site_password', 'mypass');
      expect(getSitePassword()).toBe('mypass');
    });
  });

  describe('encryption handling', () => {
    it('does not crash or double encrypt when keys are empty', () => {
      const emptyConfig = { ...sampleConfig, accessKeyId: '', secretAccessKey: '' };
      saveConfig(emptyConfig);
      const loaded = loadConfig();
      expect(loaded?.accessKeyId).toBe('');
    });

    it('handles legacy plaintext keys without decrypting them', () => {
      // Simulate old plaintext config
      localStorageMock.setItem('cloud_storage_uploader_config', JSON.stringify(sampleConfig));
      const loaded = loadConfig();
      // Should read plaintext normally
      expect(loaded?.accessKeyId).toBe('ak123');
    });

    it('handles corrupted encryption gracefully', () => {
      const corrupted = { ...sampleConfig, accessKeyId: 'U2FsdGVkX1-CORRUPT-DATA' };
      localStorageMock.setItem('cloud_storage_uploader_config', JSON.stringify(corrupted));
      const loaded = loadConfig();
      // Should fallback to returning the corrupted string if it fails to parse
      expect(loaded?.accessKeyId).toBe('U2FsdGVkX1-CORRUPT-DATA');
    });
  });
});
