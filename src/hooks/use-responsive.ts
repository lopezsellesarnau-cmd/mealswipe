import { useWindowDimensions } from 'react-native';

/** true en escritorio/web ancho — a partir de aquí dejamos de forzar el
 *  layout de una sola columna centrada (pensado para móvil) y usamos el
 *  ancho real en vez de dejar franjas en blanco a los lados. */
export function useIsWide() {
  const { width } = useWindowDimensions();
  return width >= 900;
}
