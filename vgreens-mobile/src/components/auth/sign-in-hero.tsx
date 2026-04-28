import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useAppTheme } from '@/lib/theme-preference';
import { heroStyles as s } from './sign-in-hero.styles';

export function SignInHero() {
  const { colors, resolvedScheme } = useAppTheme();
  const dark = resolvedScheme === 'dark';
  const primary = colors.primary;

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.55);
  const glowScale = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(10);
  const blob1Scale = useSharedValue(1);
  const blob2Scale = useSharedValue(0.85);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 13, stiffness: 130 });
    const t = setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 500 });
      textY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    }, 280);
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    blob1Scale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.88, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    blob2Scale.value = withRepeat(
      withSequence(
        withTiming(0.72, { duration: 3100, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.12, { duration: 3100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    return () => clearTimeout(t);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowScale.value, [1, 1.6], [0.28, 0.04]),
    transform: [{ scale: glowScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const blob1Style = useAnimatedStyle(() => ({ transform: [{ scale: blob1Scale.value }] }));
  const blob2Style = useAnimatedStyle(() => ({ transform: [{ scale: blob2Scale.value }] }));

  const bg = dark ? '#0a1419' : '#ecfdf5';
  const dotFill = dark ? 'rgba(1,111,124,0.22)' : 'rgba(1,111,124,0.13)';

  return (
    <View style={[s.wrap, { backgroundColor: bg }]}>
      <Animated.View style={[s.blob1, { backgroundColor: primary }, blob1Style]} />
      <Animated.View style={[s.blob2, { backgroundColor: primary }, blob2Style]} />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {Array.from({ length: 88 }).map((_, i) => (
          <Circle key={i} cx={(i % 11) * 36 + 8} cy={Math.floor(i / 11) * 36 + 8} r="1.4" fill={dotFill} />
        ))}
      </Svg>
      <View style={s.logoOuter}>
        <Animated.View style={[s.glowRing, { backgroundColor: primary }, glowStyle]} />
        <Animated.View style={[s.logoCircle, { backgroundColor: primary }, logoStyle]}>
          <Svg width={40} height={50} viewBox="0 0 79 99">
            <Path
              fillRule="evenodd" clipRule="evenodd"
              d="M14.6998 23.3868H64.5239C64.5239 23.3868 70.6135 29.21 75.5772 33.9634C79.2835 37.5093 80.0715 43.1335 77.4912 47.5614C69.844 60.6366 54.4934 86.912 49.511 95.4469C48.5164 97.1471 46.6961 98.1923 44.7256 98.1923C41.7699 98.1923 37.3974 98.1923 34.4512 98.1923C32.4901 98.1923 30.6698 97.1536 29.6751 95.4609C24.6646 86.9543 9.23881 60.7258 1.53532 47.6223C-1.09194 43.1682 -0.284884 37.4943 3.47772 33.9456C5.53261 31.9996 7.29655 30.3369 7.29655 30.3369C7.29655 30.3369 31.8145 71.4581 38.1199 82.046C38.4295 82.563 38.9926 82.8801 39.5932 82.8792C40.1937 82.8792 40.7472 82.5621 41.0569 82.045C45.7015 74.244 60.0012 50.2271 63.7356 43.9461C64.2611 43.0594 64.111 41.925 63.3603 41.2109C61.7089 39.629 59.0348 37.0702 59.0348 37.0702H22.6848L14.6998 23.3868Z"
              fill="white"
            />
            <Path
              fillRule="evenodd" clipRule="evenodd"
              d="M23.9168 17.9241L55.8643 17.5823L69.072 1.91525L47.857 11.7594L42.5608 2.73599L33.5752 11.2752L12.585 0L23.9168 17.9241Z"
              fill="white"
            />
          </Svg>
        </Animated.View>
      </View>
      <Animated.View style={[s.textBlock, textStyle]}>
        <Text style={[s.title, { color: dark ? '#e8f0f2' : '#0d1f24' }]}>vGreens</Text>
        <Text style={[s.tagline, { color: dark ? '#8ba5ad' : '#4d7a82' }]}>
          Welcome back — let&apos;s get growing
        </Text>
      </Animated.View>
    </View>
  );
}
