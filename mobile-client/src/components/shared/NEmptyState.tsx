// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — NEmptyState
// Estado vacío con ícono Lucide centrado.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors }     from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { NButton }    from './NButton';

interface NEmptyStateProps {
  icon:        React.ReactNode;
  title:       string;
  subtitle?:   string;
  action?:     { label: string; onPress: () => void };
}

export function NEmptyState({ icon, title, subtitle, action }: NEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && (
        <NButton
          label={action.label}
          onPress={action.onPress}
          variant="ghost"
          size="sm"
          style={styles.btn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    gap:            Spacing.sm,
  },
  iconWrap: {
    width:           72,
    height:          72,
    borderRadius:    Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent:  'center',
    alignItems:      'center',
    marginBottom:    Spacing.sm,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.08)',
  },
  title: {
    ...Typography.headlineSm,
    color:     Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMd,
    color:      Colors.onSurfaceVariant,
    textAlign:  'center',
    lineHeight: 22,
  },
  btn: {
    marginTop: Spacing.sm,
  },
});
