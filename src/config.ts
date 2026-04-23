import configData from '../config.json';

interface AppConfig {
  reallyDeleteFiles: boolean;
}

export const config: AppConfig = configData;
