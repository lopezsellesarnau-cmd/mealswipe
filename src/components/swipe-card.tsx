import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Recipe } from '@/constants/recipes';
import { useTheme } from '@/hooks/use-theme';

const SWIPE_THRESHOLD = 120;

// Iconos genéricos para las miniaturas de ingrediente — no tenemos fotos
// reales de producto, así que un set pequeño y consistente da la misma
// sensación de "aquí van los ingredientes" que la fila de Mealia, sin fingir
// que son fotos de verdad.
const INGREDIENT_ICONS = ['🥕', '🧄', '🍅', '🧀', '🌿', '🧂'];

/** Hash numérico estable de un string — para fijar siempre la misma foto por
 *  receta (si no, LoremFlickr devuelve una distinta en cada carga). */
function hashLock(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 10000;
}

/** Foto de comida real por receta, buscada por palabras clave (LoremFlickr —
 *  fotos de Flickr con licencia CC, sin necesitar API key). `lock` fija
 *  siempre la misma foto para la misma receta, en vez de una aleatoria en
 *  cada carga. Si falla (sin red, servicio caído), se cae al degradado +
 *  emoji — la tarjeta nunca se queda rota. */
function foodPhotoUrl(recipe: Recipe) {
  return `https://loremflickr.com/500/560/${recipe.photoQuery}/all?lock=${hashLock(recipe.id)}`;
}

export function SwipeCard({
  recipe,
  onSwipeLeft,
  onSwipeRight,
  size = 350,
}: {
  recipe: Recipe;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Ancho de la tarjeta — más grande en escritorio, donde sobra sitio. */
  size?: number;
}) {
  const theme = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(500, {}, () => runOnJS(onSwipeRight)());
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-500, {}, () => runOnJS(onSwipeLeft)());
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-300, 300], [-15, 15])}deg` },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, SWIPE_THRESHOLD], [0, 1]),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -20], [1, 0]),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, { width: size, height: size * 1.44 }, cardStyle]}>
        <LinearGradient
          colors={recipe.photo}
          style={[styles.photo, { height: size * 1.06 }]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}>
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
              {/* Tinte del color de marca sobre la foto — mantiene la paleta
                  rosa/coral aunque la imagen de prueba no lo sea. */}
              <LinearGradient
                colors={['rgba(255,62,127,0.16)', 'rgba(255,122,89,0.16)']}
                style={StyleSheet.absoluteFill}
              />
            </>
          )}

          {/* Botones circulares translúcidos, mismo lenguaje que la ficha de receta de Mealia. */}
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <ThemedText style={{ fontSize: 16 }}>🤍</ThemedText>
            </View>
          </View>

          <View style={styles.perServing}>
            <ThemedText style={{ fontSize: 11, fontWeight: '700' }}>
              £{(recipe.estimatedCostGBP / recipe.servings).toFixed(2)} per serving
            </ThemedText>
          </View>

          <View style={styles.ingredientRow}>
            {recipe.ingredients.slice(0, 4).map((ing, i) => (
              <View key={ing} style={[styles.ingredientDot, i > 0 && { marginLeft: -10 }]}>
                <ThemedText style={{ fontSize: 14 }}>{INGREDIENT_ICONS[i % INGREDIENT_ICONS.length]}</ThemedText>
              </View>
            ))}
          </View>

          <Animated.View style={[styles.badge, styles.likeBadge, likeStyle]}>
            <ThemedText style={{ color: '#2E9E5B', fontWeight: '800' }}>LIKE</ThemedText>
          </Animated.View>
          <Animated.View style={[styles.badge, styles.nopeBadge, nopeStyle]}>
            <ThemedText style={{ color: theme.danger, fontWeight: '800' }}>NOPE</ThemedText>
          </Animated.View>
        </LinearGradient>

        <View style={[styles.info, { backgroundColor: theme.background }]}>
          <ThemedText style={styles.title}>{recipe.title}</ThemedText>
          <View style={styles.metaRow}>
            <Chip label={`£${recipe.estimatedCostGBP}`} />
            <Chip label={`👥 ${recipe.servings}`} />
            <Chip label={`⏱ ${recipe.minutes}m`} />
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function Chip({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText style={{ fontSize: 12, fontWeight: '600' }}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  photo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 110 },
  iconRow: { position: 'absolute', top: 16, right: 16 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perServing: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ingredientRow: { position: 'absolute', left: 16, bottom: 16, flexDirection: 'row' },
  ingredientDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, padding: 18, gap: 10 },
  title: { fontSize: 20, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badge: {
    position: 'absolute',
    top: 24,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  likeBadge: { left: 20, transform: [{ rotate: '-15deg' }] },
  nopeBadge: { right: 20, transform: [{ rotate: '15deg' }] },
});
