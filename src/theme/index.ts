import type { ThemeConfig } from 'antd';

export const brand = {
  charcoal: '#1C1917',
  charcoalSoft: '#292524',
  charcoalMuted: '#44403C',
  coral: '#FF6B35',
  coralHover: '#F97316',
  coralSoft: '#FFB086',
  cream: '#FFF7F2',
  sand: '#F5E6DC',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  text: '#1C1917',
  textMuted: '#78716C',
  border: '#E7E5E4',
  white: '#FFFFFF',
} as const;

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: brand.coral,
    colorInfo: brand.coral,
    colorSuccess: brand.success,
    colorWarning: brand.warning,
    colorError: brand.danger,
    colorTextBase: brand.text,
    colorBgBase: brand.white,
    colorLink: brand.coral,
    borderRadius: 12,
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
    fontSize: 15,
    controlHeight: 44,
    wireframe: false,
  },
  components: {
    Button: {
      primaryShadow: '0 8px 20px rgba(255, 107, 53, 0.28)',
      fontWeight: 600,
      borderRadius: 12,
    },
    Input: {
      borderRadius: 12,
      activeBorderColor: brand.coral,
      hoverBorderColor: brand.coralSoft,
    },
    Select: {
      borderRadius: 12,
    },
    Card: {
      borderRadiusLG: 20,
    },
    Modal: {
      borderRadiusLG: 20,
    },
    Drawer: {
      borderRadiusLG: 20,
    },
    Tag: {
      borderRadiusSM: 999,
    },
    Menu: {
      itemBorderRadius: 10,
      itemSelectedBg: 'rgba(255, 107, 53, 0.12)',
      itemSelectedColor: brand.coral,
    },
  },
};
