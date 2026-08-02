import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.primarySoft}
      tintColor={colors.primary}
      labelStyle={{ selected: { color: colors.primary } }}>
      <NativeTabs.Trigger name="index">
        <Label>Swipe</Label>
        <Icon sf={{ default: 'hand.draw', selected: 'hand.draw.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="plan">
        <Label>Plan</Label>
        <Icon sf={{ default: 'list.bullet', selected: 'list.bullet.rectangle.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chat">
        <Label>Ask</Label>
        <Icon sf={{ default: 'bubble.left', selected: 'bubble.left.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
