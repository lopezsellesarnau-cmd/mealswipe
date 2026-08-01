import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useGradients } from '@/hooks/use-theme';

/** Botón píldora con degradado — mismo lenguaje que "Ask Mealia" / "Browse". */
export function GradientButton({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const gradients = useGradients();
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[{ opacity: disabled ? 0.6 : 1 }, style]}>
      <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.pill}>
        <ThemedText style={styles.label}>{label}</ThemedText>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 28,
    paddingVertical: 15,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
