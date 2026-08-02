import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** true en escritorio/web ancho — a partir de aquí dejamos de forzar el
 *  layout de una sola columna centrada (pensado para móvil) y usamos el
 *  ancho real en vez de dejar franjas en blanco a los lados. */
export function useIsWide() {
  const { width } = useWindowDimensions();
  return width >= 900;
}

/**
 * Espacio real que hay que dejar libre por encima de la tab bar flotante de
 * iOS (el diseño en píldora de NativeTabs) para que el contenido no quede
 * tapado detrás — la tab bar flota SOBRE el contenido, no reserva su propio
 * hueco como una barra normal. En vez de adivinar una altura fija (lo que
 * causó overlaps reales en dispositivos con distinto safe-area-inset),
 * calculamos con la spec de Apple: 49pt de alto + 8pt de margen sobre el
 * safe area inferior. En Android/web se mantiene el hueco fijo anterior.
 */
export function useTabBarClearance() {
  const insets = useSafeAreaInsets();
  if (Platform.OS === 'ios') return insets.bottom + 57;
  if (Platform.OS === 'android') return 80;
  return 0;
}
