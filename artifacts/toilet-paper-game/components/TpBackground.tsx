import React, { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Ellipse, G } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface RollProps {
  x: number;
  y: number;
  size: number;
  angle: number;
  opacity: number;
  rollColor: string;
  coreColor: string;
}

function TpRoll({ x, y, size, angle, opacity, rollColor, coreColor }: RollProps) {
  const r = size / 2;
  const coreR = r * 0.35;
  const holeR = r * 0.22;
  return (
    <G
      transform={`translate(${x}, ${y}) rotate(${angle}, 0, 0)`}
      opacity={opacity}
    >
      <Ellipse cx={0} cy={0} rx={r} ry={r * 0.55} fill={rollColor} />
      <Ellipse cx={0} cy={0} rx={coreR} ry={coreR * 0.55} fill={coreColor} />
      <Ellipse cx={0} cy={0} rx={holeR} ry={holeR * 0.55} fill="rgba(180,130,70,0.4)" />
    </G>
  );
}

export function TpBackground() {
  const colors = useColors();

  const rolls = useMemo(() => {
    const items: RollProps[] = [];
    const seed = [7, 13, 19, 31, 43, 57, 71, 89, 97, 113, 127, 149, 163, 181, 197, 211];
    let idx = 0;
    const rand = () => {
      const v = seed[idx % seed.length];
      idx++;
      return (v % 100) / 100;
    };

    const count = 18;
    for (let i = 0; i < count; i++) {
      const size = 40 + rand() * 80;
      const x = rand() * SCREEN_WIDTH;
      const y = rand() * SCREEN_HEIGHT;
      const angle = rand() * 360;
      const opacity = 0.08 + rand() * 0.12;
      items.push({
        x, y, size, angle, opacity,
        rollColor: (colors as Record<string, string>).tpRoll ?? "#d4b483",
        coreColor: (colors as Record<string, string>).tpCore ?? "#b8936a",
      });
    }
    return items;
  }, [(colors as Record<string, string>).tpRoll, (colors as Record<string, string>).tpCore]);

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
        {rolls.map((roll, i) => (
          <TpRoll key={i} {...roll} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
});
