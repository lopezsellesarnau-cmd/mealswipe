import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/gradient-button';
import { RecipeGrid } from '@/components/recipe-grid';
import { ScreenBackground } from '@/components/screen-background';
import { SwipeCard } from '@/components/swipe-card';
import { ThemedText } from '@/components/themed-text';
import { RECIPES } from '@/constants/recipes';
import { Spacing, WideContentWidth } from '@/constants/theme';
import { useTabBarClearance } from '@/hooks/use-responsive';
import { useMealPlan } from '@/state/meal-plan';

export default function SwipeScreen() {
  return Platform.OS === 'web' ? <WebBrowse /> : <MobileSwipe />;
}

/**
 * Web: rejilla — se ve todo de golpe y el corazón marca/desmarca. El gesto de
 * arrastrar no es nativo del ratón/teclado (y en las pruebas de esta sesión
 * un "drag" de un solo salto ni siquiera disparaba el gesture-handler), así
 * que en vez de forzar el mismo mecanismo táctil, la web usa el patrón que
 * de verdad se espera en un sitio: una rejilla de tarjetas.
 */
function WebBrowse() {
  const router = useRouter();
  const { liked, toggleLike } = useMealPlan();

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={[styles.safe, styles.safeWide]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.webScroll}>
          <View style={styles.webHeaderRow}>
            <View>
              <ThemedText type="subtitle">MealSwipe</ThemedText>
              <ThemedText themeColor="textSecondary">Tap the heart on what you fancy this week.</ThemedText>
            </View>
            {liked.length > 0 && (
              <GradientButton label={`Build plan (${liked.length}) →`} onPress={() => router.push('/plan')} />
            )}
          </View>

          <RecipeGrid recipes={RECIPES} liked={liked} onToggle={toggleLike} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

/** Móvil: el swipe de una en una — el gesto táctil de verdad tiene sentido
 *  aquí, y ya está probado en el simulador con gestos reales. Sin cambios. */
function MobileSwipe() {
  const router = useRouter();
  const { liked, toggleLike } = useMealPlan();
  const [index, setIndex] = useState(0);
  const tabBarClearance = useTabBarClearance();

  const current = RECIPES[index];
  const done = index >= RECIPES.length;

  function next() {
    setIndex((i) => i + 1);
  }

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">MealSwipe</ThemedText>
          <ThemedText themeColor="textSecondary">Swipe recipes you like — then build your weekly plan.</ThemedText>
        </View>

        <View style={[styles.deck, { paddingBottom: tabBarClearance + Spacing.four }]}>
          {done ? (
            <View style={styles.emptyState}>
              <ThemedText type="title" style={{ fontSize: 40 }}>
                🎉
              </ThemedText>
              <ThemedText type="smallBold" style={{ textAlign: 'center', marginTop: Spacing.three }}>
                {liked.length} recipes liked
              </ThemedText>
              <GradientButton label="Build my weekly plan →" onPress={() => router.push('/plan')} style={styles.cta} />
            </View>
          ) : (
            <SwipeCard
              key={current.id}
              recipe={current}
              onSwipeLeft={next}
              onSwipeRight={() => {
                toggleLike(current);
                next();
              }}
            />
          )}
          {!done && (
            <ThemedText themeColor="textSecondary" style={{ textAlign: 'center', marginTop: Spacing.three }}>
              {liked.length} liked · {RECIPES.length - index} left
            </ThemedText>
          )}
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, gap: Spacing.three, alignSelf: 'center', width: '100%' },
  safeWide: { maxWidth: WideContentWidth },
  header: { paddingHorizontal: Spacing.four, gap: Spacing.one },
  webScroll: { padding: Spacing.four, gap: Spacing.four },
  webHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: Spacing.three },
  deck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  emptyState: { alignItems: 'center', paddingHorizontal: Spacing.four, marginTop: Spacing.six },
  cta: { marginTop: Spacing.four },
});
