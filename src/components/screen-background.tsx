import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { useGradients } from '@/hooks/use-theme';

/** Fondo de pantalla — degradado rosa→melocotón concentrado en la parte de
 *  abajo, igual que el "wash" que aparece en (casi) todas las capturas de
 *  Mealia. La mitad superior queda plana para no restar legibilidad al texto. */
export function ScreenBackground({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const gradients = useGradients();
  return (
    <LinearGradient
      colors={gradients.wash}
      locations={[0, 0.55, 1]}
      style={[styles.fill, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
