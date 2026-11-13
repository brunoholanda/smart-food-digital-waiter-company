import type { ThemeConfig } from 'antd';

export const kitchenBrand = {
  charcoal: '#141210',
  charcoalSoft: '#1C1917',
  charcoalPanel: '#221F1C',
  charcoalMuted: '#3F3A36',
  amber: '#F59E0B',
  amberHot: '#F97316',
  amberSoft: '#FBBF24',
  cream: '#FAFAF9',
  textMuted: '#A8A29E',
  success: '#22C55E',
  danger: '#EF4444',
  border: '#3F3A36',
  white: '#FFFFFF',
} as const;

export const kitchenAntdTheme: ThemeConfig = {
  token: {
    colorPrimary: kitchenBrand.amber,
    colorInfo: kitchenBrand.amber,
    colorSuccess: kitchenBrand.success,
    colorWarning: kitchenBrand.amberHot,
    colorError: kitchenBrand.danger,
    colorTextBase: kitchenBrand.cream,
    colorBgBase: kitchenBrand.charcoal,
    colorBgContainer: kitchenBrand.charcoalPanel,
    colorBgElevated: kitchenBrand.charcoalSoft,
    colorBorder: kitchenBrand.border,
    colorBorderSecondary: kitchenBrand.charcoalMuted,
    colorLink: kitchenBrand.amberSoft,
    borderRadius: 14,
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
    fontSize: 15,
    controlHeight: 48,
    controlHeightLG: 56,
    wireframe: false,
  },
  components: {
    Button: {
      primaryShadow: '0 10px 24px rgba(245, 158, 11, 0.28)',
      fontWeight: 600,
      borderRadius: 14,
      controlHeight: 48,
      controlHeightLG: 56,
    },
    Input: {
      borderRadius: 14,
      colorBgContainer: kitchenBrand.charcoalSoft,
      activeBorderColor: kitchenBrand.amber,
      hoverBorderColor: kitchenBrand.amberSoft,
    },
    Card: {
      borderRadiusLG: 18,
      colorBgContainer: kitchenBrand.charcoalPanel,
    },
    Modal: {
      borderRadiusLG: 18,
      contentBg: kitchenBrand.charcoalSoft,
      headerBg: kitchenBrand.charcoalSoft,
    },
    Layout: {
      bodyBg: kitchenBrand.charcoal,
      headerBg: kitchenBrand.charcoalSoft,
      siderBg: kitchenBrand.charcoalSoft,
    },
    Tag: {
      borderRadiusSM: 8,
    },
    Table: {
      colorBgContainer: kitchenBrand.charcoalPanel,
      headerBg: kitchenBrand.charcoalSoft,
      rowHoverBg: 'rgba(245, 158, 11, 0.08)',
    },
    Spin: {
      colorPrimary: kitchenBrand.amber,
    },
  },
};
