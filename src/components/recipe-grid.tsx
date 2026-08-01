import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Recipe } from '@/constants/recipes';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Hash numérico estable — misma foto siempre para la misma receta. */
function hashLock(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 10000;
}
function foodPhotoUrl(recipe: Recipe) {
  return `https://loremflickr.com/500/560/${recipe.photoQuery}/all?lock=${hashLock(recipe.id)}`;
}

/**
 * Versión web del descubrimiento de recetas: en vez del swipe de una en una
 * (pensado para gesto táctil), una rejilla donde se ve todo de golpe y el
 * corazón marca/desmarca — el patrón real de cualquier sitio de recetas, y
 * usa el ancho de la pantalla con sentido en vez de dejarlo vacío al lado de
 * una sola tarjeta centrada.
 */
export function RecipeGrid({
  recipes,
  liked,
  onToggle,
}: {
  recipes: Recipe[];
  liked: Recipe[];
  onToggle: (recipe: Recipe) => void;
}) {
  const likedIds = new Set(liked.map((r) => r.id));
  return (
    <View style={styles.grid}>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} isLiked={likedIds.has(recipe.id)} onToggle={onToggle} />
      ))}
    </View>
  );
}

function RecipeCard({
  recipe,
  isLiked,
  onToggle,
}: {
  recipe: Recipe;
  isLiked: boolean;
  onToggle: (recipe: Recipe) => void;
}) {
  const theme = useTheme();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: theme.background }]}>
      <LinearGradient colors={recipe.photo} style={styles.photo} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}>
        {imageFailed ? (
          <ThemedText style={styles.emoji}>{recipe.emoji}</ThemedText>
        ) : (
          <>
            <Image
              source={{ uri: foodPhotoUrl(recipe) }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              onError={() => setImageFailed(true)}
            />
            <LinearGradient
              colors={['rgba(255,62,127,0.16)', 'rgba(255,122,89,0.16)']}
              style={StyleSheet.absoluteFill}
            />
          </>
        )}

        <View style={styles.perServing}>
          <ThemedText style={{ fontSize: 11, fontWeight: '700' }}>
            £{(recipe.estimatedCostGBP / recipe.servings).toFixed(2)} per serving
          </ThemedText>
        </View>

        <Pressable onPress={() => onToggle(recipe)} style={styles.heartCircle}>
          <ThemedText style={{ fontSize: 16 }}>{isLiked ? '❤️' : '🤍'}</ThemedText>
        </Pressable>
      </LinearGradient>

      <View style={styles.info}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {recipe.title}
        </ThemedText>
        <View style={styles.metaRow}>
          <Chip label={`£${recipe.estimatedCostGBP}`} />
          <Chip label={`👥 ${recipe.servings}`} />
          <Chip label={`⏱ ${recipe.minutes}m`} />
        </View>
        <Pressable
          onPress={() => onToggle(recipe)}
          style={[styles.likeButton, { backgroundColor: isLiked ? theme.primary : theme.backgroundElement }]}>
          <ThemedText style={{ color: isLiked ? '#fff' : theme.text, fontWeight: '700', fontSize: 12 }}>
            {isLiked ? 'Added to plan ✓' : 'Add to plan'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText style={{ fontSize: 11, fontWeight: '600' }}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  card: {
    width: 240,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  photo: { height: 180, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64 },
  perServing: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heartCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { padding: 12, gap: 8 },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  likeButton: { marginTop: 4, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
});
