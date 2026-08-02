import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  active?: boolean;
  accentColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, active, accentColor }) => {
  return (
    <View
      style={[
        styles.card,
        active && {
          borderColor: accentColor || '#6366F1',
          borderWidth: 1.5,
          backgroundColor: '#1E2030',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161824',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#26293D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
