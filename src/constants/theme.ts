/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * Paleta calcada de las capturas reales de Mealia (App Store, ago 2026):
 * fondo casi blanco con degradado rosa→melocotón abajo, acento en gradiente
 * magenta→coral para los CTA principales, tarjetas grises muy claras con
 * esquinas grandes. `gradient` es el par de colores del degradado del CTA.
 */
export const Colors = {
  light: {
    text: '#221420',
    background: '#FFFFFF',
    backgroundElement: '#F6F3F4',
    backgroundSelected: '#FBE9EF',
    textSecondary: '#8A7A85',
    primary: '#FF3E7F',
    primarySoft: '#FFE1EC',
    danger: '#C7473F',
    dangerSoft: '#F7DEDC',
  },
  dark: {
    text: '#FBEEF3',
    background: '#1A1015',
    backgroundElement: '#26161F',
    backgroundSelected: '#3A1E2C',
    textSecondary: '#C9A8BB',
    primary: '#FF5C93',
    primarySoft: '#3A1E2C',
    danger: '#F0857D',
    dangerSoft: '#3A1E1C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Degradados (tuplas) aparte de `Colors` — un `Text`/`View` de RN no acepta
 *  un array como `color`/`backgroundColor`, así que no pueden vivir en el
 *  mismo objeto que usa `ThemedText`/`ThemedView` para sus props de color. */
export const Gradients = {
  light: {
    primary: ['#FF3E7F', '#FF7A59'] as const,
    wash: ['#FFFFFF', '#FFE9EE', '#FFD9CE'] as const,
  },
  dark: {
    primary: ['#FF3E7F', '#FF7A59'] as const,
    wash: ['#1A1015', '#2A1620', '#331B1A'] as const,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
/** Ancho de contenido en escritorio/web ancho — la web no debe quedarse con
 *  la misma columna estrecha de móvil rodeada de blanco. */
export const WideContentWidth = 1100;
