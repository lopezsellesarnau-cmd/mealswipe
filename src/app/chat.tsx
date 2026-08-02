import { useEffect, useState } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/gradient-button';
import { ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing, WideContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useMealPlan } from '@/state/meal-plan';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4001';

type Message = { role: 'user' | 'assistant'; content: string };

const STARTER: Message = {
  role: 'assistant',
  content: "Hi! Ask me for a substitution, a quick recipe idea, or a cooking tip.",
};

export default function ChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { liked } = useMealPlan();
  const [messages, setMessages] = useState<Message[]>([STARTER]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Cuando el teclado está abierto, subimos el input justo lo que ocupa el
  // teclado (menos el inset ya reservado por la safe area). Cuando está
  // cerrado, lo dejamos por encima de la barra de pestañas. Así nunca se
  // solapan, sea cual sea la altura real del teclado o de la tab bar.
  const bottomOffset = keyboardHeight > 0 ? keyboardHeight - insets.bottom : BottomTabInset;

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text } as Message];
    setMessages(next);
    setInput('');
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, liked }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setMessages([...next, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the assistant.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ThemedText type="subtitle" style={styles.title}>
          Ask MealSwipe
        </ThemedText>

        <ScrollView contentContainerStyle={styles.scroll}>
          {messages.map((m, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                m.role === 'user'
                  ? { backgroundColor: theme.primary, alignSelf: 'flex-end' }
                  : { backgroundColor: theme.backgroundElement, alignSelf: 'flex-start' },
              ]}>
              <ThemedText style={m.role === 'user' ? { color: '#fff' } : undefined}>{m.content}</ThemedText>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubble, { backgroundColor: theme.backgroundElement, alignSelf: 'flex-start' }]}>
              <ThemedText themeColor="textSecondary">Thinking…</ThemedText>
            </View>
          )}
          {error && <ThemedText style={{ color: theme.danger }}>{error}</ThemedText>}
        </ScrollView>

        <ThemedView type="backgroundElement" style={[styles.inputRow, { marginBottom: bottomOffset + Spacing.three }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="e.g. what can I swap for coconut milk?"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text }]}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <GradientButton label={loading ? '…' : 'Send'} onPress={send} disabled={loading || !input.trim()} />
        </ThemedView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: WideContentWidth },
  title: { paddingHorizontal: Spacing.four, paddingTop: Platform.select({ web: Spacing.six, default: Spacing.three }) },
  scroll: { padding: Spacing.four, gap: Spacing.two, flexGrow: 1 },
  bubble: { borderRadius: Spacing.four, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, maxWidth: '80%' },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    padding: Spacing.three,
    marginHorizontal: Spacing.four,
    borderRadius: Spacing.five,
  },
  input: { flex: 1, fontSize: 15 },
});
