import React, { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

const COLORS = [
  "#f6e58d", "#ff7979", "#badc58", "#e056fd", "#7ed6df",
  "#f9ca24", "#6ab04c", "#c7ecee", "#eb4d4b", "#686de0",
];

interface ConfettiPieceProps {
  color: string;
  startX: number;
  startY: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

function ConfettiPiece({ color, startX, startY, delay, duration, size, rotation }: ConfettiPieceProps) {
  const translateY = useSharedValue(-size);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(rotation);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(H + size, { duration, easing: Easing.linear })
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(duration - 400, withTiming(0, { duration: 300 }))
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(rotation + 360, { duration: 800, easing: Easing.linear }),
        -1
      )
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + 20, { duration: 400 }),
          withTiming(startX - 20, { duration: 400 })
        ),
        -1
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size * 0.5,
          borderRadius: 2,
          backgroundColor: color,
          left: 0,
          top: startY,
        },
        style,
      ]}
    />
  );
}

interface ConfettiEffectProps {
  active: boolean;
}

const PIECES_DATA = Array.from({ length: 40 }, (_, i) => {
  const seeds = [3, 7, 11, 17, 23, 29, 37, 41, 53, 59, 67, 71, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227];
  const seed = seeds[i];
  const rng = (n: number) => ((seed * (i + 1) * (n + 1)) % 100) / 100;
  return {
    color: COLORS[i % COLORS.length],
    startX: rng(1) * W,
    startY: -(rng(2) * 200 + 50),
    delay: rng(3) * 1200,
    duration: 2000 + rng(4) * 2000,
    size: 8 + rng(5) * 14,
    rotation: rng(6) * 360,
  };
});

export function ConfettiEffect({ active }: ConfettiEffectProps) {
  if (!active) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PIECES_DATA.map((piece, i) => (
        <ConfettiPiece key={i} {...piece} />
      ))}
    </View>
  );
}
