import { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { UserRole } from '@/types/user';
import { getRoleGradient } from '@/types/user';

interface UserAvatarProps {
  role: UserRole;
  initials: string;
  size?: number;
}

function UserAvatarBase({ role, initials, size = 44 }: UserAvatarProps) {
  const [from, to] = getRoleGradient(role);
  const gradientId = `av-${role}-${size}`;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { width: size, height: size },
        inner: {
          ...StyleSheet.absoluteFillObject,
          alignItems: 'center',
          justifyContent: 'center',
        },
        initials: {
          fontSize: Math.round(size * 0.36),
          fontWeight: '800',
          color: '#fff',
          letterSpacing: 0.3,
        },
      }),
    [size],
  );

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={size}
          height={size}
          rx={size * 0.3}
          ry={size * 0.3}
          fill={`url(#${gradientId})`}
        />
      </Svg>
      <View style={styles.inner}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
    </View>
  );
}

export const UserAvatar = memo(UserAvatarBase);
UserAvatar.displayName = 'UserAvatar';
