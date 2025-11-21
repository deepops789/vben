import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    accessMode: 'backend',
    enableCheckUpdates: false,
    layout: 'header-sidebar-nav',
  },
  breadcrumb: {
    showHome: true,
    styleType: 'background',
  },
  copyright: {
    companyName: 'AutoMan',
    date: '2025',
  },
  footer: {
    enable: true,
  },
  sidebar: {
    width: 220,
  },
  tabbar: {
    styleType: 'plain',
  },
  theme: {
    mode: 'auto',
    builtinType: 'default',
    radius: '1',
    colorPrimary: 'hsl(212 100% 45%)',
  },
});
