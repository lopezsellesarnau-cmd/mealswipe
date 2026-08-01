import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/gradient-button';
import { ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Recipe } from '@/constants/recipes';
import { BottomTabInset, Spacing, WideContentWidth } from '@/constants/theme';
import { useIsWide } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import { useMealPlan } from '@/state/meal-plan';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4001';

export default function PlanScreen() {
  const theme = useTheme();
  const isWide = useIsWide();
  const { liked, household, setHousehold, plan, setPlan } = useMealPlan();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyBudgetSwap() {
    if (!plan?.budgetTip) return;
    const { day, from, to, savingsGBP } = plan.budgetTip;
    setPlan({
      ...plan,
      days: plan.days.map((d) => (d.day === day && d.recipeTitle === from ? { ...d, recipeTitle: to } : d)),
      totalEstimatedCostGBP: plan.totalEstimatedCostGBP - savingsGBP,
      budgetTip: null,
    });
  }

  async function generate() {
    if (liked.length === 0) {
      setError('Swipe right on at least one recipe first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked, household }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the plan server.');
    } finally {
      setLoading(false);
    }
  }

  const left = (
    <View style={{ flex: 1, gap: Spacing.three }}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          HOUSEHOLD
        </ThemedText>
        <Field label="Servings">
          <TextInput
            keyboardType="number-pad"
            value={String(household.servings)}
            onChangeText={(t) => setHousehold({ ...household, servings: Number(t) || 0 })}
            style={[styles.input, { color: theme.text, borderColor: theme.primarySoft }]}
          />
        </Field>
        <Field label="Weekly budget (£)">
          <TextInput
            keyboardType="number-pad"
            value={String(household.budgetGBP)}
            onChangeText={(t) => setHousehold({ ...household, budgetGBP: Number(t) || 0 })}
            style={[styles.input, { color: theme.text, borderColor: theme.primarySoft }]}
          />
        </Field>
        <Field label="Diet">
          <View style={styles.dietRow}>
            {(['none', 'vegetarian', 'vegan'] as const).map((d) => (
              <Pressable
                key={d}
                onPress={() => setHousehold({ ...household, diet: d })}
                style={[
                  styles.dietChip,
                  { backgroundColor: household.diet === d ? theme.primary : theme.backgroundSelected },
                ]}>
                <ThemedText style={{ color: household.diet === d ? theme.background : theme.text }}>{d}</ThemedText>
              </Pressable>
            ))}
          </View>
        </Field>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          LIKED RECIPES ({liked.length})
        </ThemedText>
        {liked.map((r) => (
          <LikedRecipeRow key={r.id} recipe={r} />
        ))}
      </ThemedView>

      <GradientButton
        label={loading ? 'Generating…' : 'Generate weekly plan'}
        onPress={generate}
        disabled={loading}
      />

      {error && <ThemedText style={{ color: theme.danger }}>{error}</ThemedText>}
    </View>
  );

  const right = plan && (
    <View style={{ flex: 1, gap: Spacing.three }}>
      {plan.budgetTip && (
        <View style={styles.tipCard}>
          <ThemedText type="smallBold" style={{ color: '#fff' }}>
            💡 Budget coach
          </ThemedText>
          <ThemedText style={{ color: '#fff' }}>{plan.budgetTip.message}</ThemedText>
          <Pressable onPress={applyBudgetSwap} style={styles.tipButton}>
            <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>
              Apply swap — save £{plan.budgetTip.savingsGBP}
            </ThemedText>
          </Pressable>
        </View>
      )}

      <ThemedView type="primarySoft" style={styles.card}>
        <ThemedText type="smallBold">Plan</ThemedText>
        <ThemedText>{plan.summary}</ThemedText>
        {plan.days.map((d) => (
          <ThemedText key={d.day}>
            {d.day}: {d.recipeTitle}
          </ThemedText>
        ))}
        <ThemedText type="smallBold" style={{ marginTop: Spacing.two }}>
          Estimated total: £{plan.totalEstimatedCostGBP}
          {household.budgetGBP > 0 && plan.totalEstimatedCostGBP <= household.budgetGBP ? ' ✓ within budget' : ''}
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          SHOPPING LIST
        </ThemedText>
        {plan.shoppingList.map((item, i) => (
          <ThemedText key={i}>• {item}</ThemedText>
        ))}
      </ThemedView>
    </View>
  );

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={[styles.safe, isWide && styles.safeWide]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="subtitle">Your weekly plan</ThemedText>

          {isWide ? (
            <View style={styles.columns}>
              {left}
              {right || <View style={{ flex: 1 }} />}
            </View>
          ) : (
            <>
              {left}
              {right}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
      {children}
    </View>
  );
}

/** Fila de receta al estilo "Meal Plan" de Mealia: miniatura + metadatos. */
function LikedRecipeRow({ recipe }: { recipe: Recipe }) {
  const theme = useTheme();
  return (
    <View style={styles.recipeRow}>
      <LinearGradient colors={recipe.photo} style={styles.thumb}>
        <ThemedText style={{ fontSize: 22 }}>{recipe.emoji}</ThemedText>
      </LinearGradient>
      <View style={{ flex: 1, gap: 3 }}>
        <ThemedText type="smallBold">{recipe.title}</ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={{ fontSize: 12 }} themeColor="textSecondary">
            £{recipe.estimatedCostGBP}
          </ThemedText>
          <ThemedText style={{ fontSize: 12 }} themeColor="textSecondary">
            👥 {recipe.servings}
          </ThemedText>
          <ThemedText style={{ fontSize: 12 }} themeColor="textSecondary">
            ⏱ {recipe.minutes}m
          </ThemedText>
        </View>
      </View>
      <ThemedText style={{ color: theme.primary, fontSize: 18 }}>♥</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: 600 },
  safeWide: { maxWidth: WideContentWidth },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.select({ web: Spacing.six, default: Spacing.three }),
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  columns: { flexDirection: 'row', gap: Spacing.four, alignItems: 'flex-start' },
  card: { borderRadius: Spacing.four, padding: Spacing.three, gap: Spacing.two },
  field: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: 60, textAlign: 'right' },
  dietRow: { flexDirection: 'row', gap: Spacing.two },
  dietChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  recipeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  thumb: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', gap: Spacing.two },
  tipCard: { borderRadius: Spacing.four, padding: Spacing.three, gap: Spacing.two, backgroundColor: '#FF3E7F' },
  tipButton: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 10, alignItems: 'center', marginTop: Spacing.one },
});
