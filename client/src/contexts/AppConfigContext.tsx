import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AppConfig {
  appName: string;
  [key: string]: any;
}

interface AppConfigContextType {
  config: AppConfig;
  refresh: () => Promise<void>;
  updateAppName: (name: string) => void;
}

const DEFAULT_APP_NAME = '飞达智能HR';

const AppConfigContext = createContext<AppConfigContextType>({
  config: { appName: DEFAULT_APP_NAME },
  refresh: async () => {},
  updateAppName: () => {},
});

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(() => {
    // 从 localStorage 缓存读取，避免闪屏
    try {
      const cached = localStorage.getItem('appConfig');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.appName) return parsed;
      }
    } catch {}
    return { appName: DEFAULT_APP_NAME };
  });

  // 初始化时同步 document.title（避免闪屏）
  useEffect(() => {
    document.title = config.appName + '系统';
  }, [config.appName]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/system_config/app_settings');
      if (res.ok) {
        const data = await res.json();
        if (data?.value) {
          const settings = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          const appName = settings.appName || DEFAULT_APP_NAME;
          const newConfig = { ...settings, appName };
          setConfig(newConfig);
          localStorage.setItem('appConfig', JSON.stringify(newConfig));
        }
      }
    } catch (e) {
      console.warn('Failed to load app config:', e);
    }
  }, []);

  const updateAppName = useCallback((name: string) => {
    setConfig(prev => {
      const newConfig = { ...prev, appName: name };
      localStorage.setItem('appConfig', JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AppConfigContext.Provider value={{ config, refresh, updateAppName }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);
export default useAppConfig;
