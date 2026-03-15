// Theme definitions for Quiz-Host Live
// Each theme is applied via CSS custom properties on :root

export const themes = {
    dark_galaxy: {
        id: 'dark_galaxy',
        name: 'Dark Galaxy',
        description: 'Deep space dark blue with red accent — premium feel',
        colors: {
            bgPrimary: '#1A1A2E',
            bgSecondary: '#16213E',
            bgTertiary: '#0F3460',
            bgCard: 'rgba(255, 255, 255, 0.05)',
            bgCardHover: 'rgba(255, 255, 255, 0.08)',
            accent: '#E94560',
            accentLight: '#FF6B81',
            accentDark: '#C23152',
            textPrimary: '#FFFFFF',
            textSecondary: '#B0B0C8',
            textMuted: '#6B6B8D',
            success: '#27AE60',
            error: '#E74C3C',
            warning: '#F39C12',
            border: 'rgba(255, 255, 255, 0.1)',
            overlay: 'rgba(0, 0, 0, 0.7)',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
    },
    midnight_teal: {
        id: 'midnight_teal',
        name: 'Midnight Teal',
        description: 'Dark navy with teal highlights — calm, professional',
        colors: {
            bgPrimary: '#0D2137',
            bgSecondary: '#112D4E',
            bgTertiary: '#1A4B6E',
            bgCard: 'rgba(0, 191, 166, 0.05)',
            bgCardHover: 'rgba(0, 191, 166, 0.08)',
            accent: '#00BFA6',
            accentLight: '#33CFBA',
            accentDark: '#009688',
            textPrimary: '#FFFFFF',
            textSecondary: '#A8C6D8',
            textMuted: '#5B8CA0',
            success: '#27AE60',
            error: '#E74C3C',
            warning: '#F39C12',
            border: 'rgba(0, 191, 166, 0.15)',
            overlay: 'rgba(0, 0, 0, 0.7)',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
    },
    royal_purple: {
        id: 'royal_purple',
        name: 'Royal Purple',
        description: 'Deep purple with violet glow — regal, dramatic',
        colors: {
            bgPrimary: '#1A0A2E',
            bgSecondary: '#2D1B4E',
            bgTertiary: '#3E2664',
            bgCard: 'rgba(155, 89, 182, 0.06)',
            bgCardHover: 'rgba(155, 89, 182, 0.1)',
            accent: '#9B59B6',
            accentLight: '#B07CC6',
            accentDark: '#7D3C98',
            textPrimary: '#FFFFFF',
            textSecondary: '#C8A8E0',
            textMuted: '#7B5B99',
            success: '#27AE60',
            error: '#E74C3C',
            warning: '#F39C12',
            border: 'rgba(155, 89, 182, 0.15)',
            overlay: 'rgba(0, 0, 0, 0.7)',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
    },
    solar_gold: {
        id: 'solar_gold',
        name: 'Solar Gold',
        description: 'Near-black warm tone with gold — prestige championship feel',
        colors: {
            bgPrimary: '#1C1400',
            bgSecondary: '#2A2000',
            bgTertiary: '#3D3000',
            bgCard: 'rgba(243, 156, 18, 0.05)',
            bgCardHover: 'rgba(243, 156, 18, 0.08)',
            accent: '#F39C12',
            accentLight: '#F5B041',
            accentDark: '#D4860E',
            textPrimary: '#FFFFFF',
            textSecondary: '#D4C090',
            textMuted: '#8C7B50',
            success: '#27AE60',
            error: '#E74C3C',
            warning: '#E67E22',
            border: 'rgba(243, 156, 18, 0.15)',
            overlay: 'rgba(0, 0, 0, 0.7)',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
    },
    electric_blue: {
        id: 'electric_blue',
        name: 'Electric Blue',
        description: 'Deep dark with electric cyan — futuristic tech vibe',
        colors: {
            bgPrimary: '#050A20',
            bgSecondary: '#0A1530',
            bgTertiary: '#102040',
            bgCard: 'rgba(0, 212, 255, 0.05)',
            bgCardHover: 'rgba(0, 212, 255, 0.08)',
            accent: '#00D4FF',
            accentLight: '#33DDFF',
            accentDark: '#00A8CC',
            textPrimary: '#FFFFFF',
            textSecondary: '#90C8E0',
            textMuted: '#4080A0',
            success: '#27AE60',
            error: '#E74C3C',
            warning: '#F39C12',
            border: 'rgba(0, 212, 255, 0.15)',
            overlay: 'rgba(0, 0, 0, 0.7)',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
    },
    emerald_night: {
        id: 'emerald_night',
        name: 'Emerald Night',
        description: 'Dark forest green — nature/eco vibes',
        colors: {
            bgPrimary: '#071A10',
            bgSecondary: '#0D2818',
            bgTertiary: '#153D25',
            bgCard: 'rgba(39, 174, 96, 0.05)',
            bgCardHover: 'rgba(39, 174, 96, 0.08)',
            accent: '#27AE60',
            accentLight: '#4BC878',
            accentDark: '#1E8449',
            textPrimary: '#FFFFFF',
            textSecondary: '#A0D8B0',
            textMuted: '#508060',
            success: '#2ECC71',
            error: '#E74C3C',
            warning: '#F39C12',
            border: 'rgba(39, 174, 96, 0.15)',
            overlay: 'rgba(0, 0, 0, 0.7)',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
    },
    crimson_dark: {
        id: 'crimson_dark',
        name: 'Crimson Dark',
        description: 'Dark red background — high tension, sports arena',
        colors: {
            bgPrimary: '#1A0505',
            bgSecondary: '#2A0A0A',
            bgTertiary: '#3D1010',
            bgCard: 'rgba(231, 76, 60, 0.05)',
            bgCardHover: 'rgba(231, 76, 60, 0.08)',
            accent: '#E74C3C',
            accentLight: '#EC7063',
            accentDark: '#C0392B',
            textPrimary: '#FFFFFF',
            textSecondary: '#D8A0A0',
            textMuted: '#8C5050',
            success: '#27AE60',
            error: '#FF4444',
            warning: '#F39C12',
            border: 'rgba(231, 76, 60, 0.15)',
            overlay: 'rgba(0, 0, 0, 0.7)',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
    },
    ice_white: {
        id: 'ice_white',
        name: 'Ice White',
        description: 'Light theme for well-lit stages — high contrast on projector',
        colors: {
            bgPrimary: '#F0F4FF',
            bgSecondary: '#E0E8F5',
            bgTertiary: '#D0D8E8',
            bgCard: 'rgba(0, 102, 204, 0.05)',
            bgCardHover: 'rgba(0, 102, 204, 0.08)',
            accent: '#0066CC',
            accentLight: '#3388DD',
            accentDark: '#004499',
            textPrimary: '#1A1A2E',
            textSecondary: '#4A4A6A',
            textMuted: '#8A8AAA',
            success: '#27AE60',
            error: '#E74C3C',
            warning: '#F39C12',
            border: 'rgba(0, 102, 204, 0.15)',
            overlay: 'rgba(0, 0, 0, 0.5)',
            shadow: 'rgba(0, 0, 0, 0.1)',
        },
    },
};

/**
 * Apply a theme by setting CSS custom properties on :root
 */
export function applyTheme(themeId) {
    const theme = themes[themeId];
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case: bgPrimary → --bg-primary
        const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVar, value);
    });
}

/**
 * Get theme list for the selector UI
 */
export function getThemeList() {
    return Object.values(themes).map(({ id, name, description, colors }) => ({
        id,
        name,
        description,
        preview: {
            bg: colors.bgPrimary,
            accent: colors.accent,
            text: colors.textPrimary,
        },
    }));
}

export default themes;
