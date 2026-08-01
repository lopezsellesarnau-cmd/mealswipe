/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, Gradients } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();

  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}

export function useGradients() {
  const scheme = useColorScheme();

  return Gradients[scheme === 'dark' ? 'dark' : 'light'];
}
