import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { TpBackground } from "@/components/TpBackground";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, stats, resetStats } = useSettings();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleReset = () => setConfirmingReset(true);

  const confirmReset = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await resetStats();
    setConfirmingReset(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TpBackground />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            testID="back-btn"
          >
            <Text style={{ fontSize: 24, color: colors.foreground, fontWeight: "bold" }}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {settings.username}'s Stats
          </Text>
        </View>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.bigCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={{ fontSize: 36, textAlign: "center" }}>🏆</Text>
          <Text style={[styles.bigCardLabel, { color: colors.mutedForeground }]}>
            High Score
          </Text>
          <Text style={[styles.bigCardNum, { color: colors.primary }]}>
            {stats.highScore}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.bigCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={{ fontSize: 36, textAlign: "center" }}>🧻</Text>
          <Text style={[styles.bigCardLabel, { color: colors.mutedForeground }]}>
            Tissues per Wipe Avg
          </Text>
          <Text style={[styles.bigCardNum, { color: colors.accent }]}>
            {Math.round(stats.lastTissueAverage)}
          </Text>
          <Text style={[styles.bigCardSub, { color: colors.mutedForeground }]}>
            squares per wipe (lowest ever)
          </Text>
        </Animated.View>

        {confirmingReset ? (
          <View style={styles.confirmRow}>
            <Text style={[styles.confirmQuestion, { color: colors.foreground }]}>
              Reset all stats?
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity
                style={[styles.confirmNo, { borderColor: colors.border }]}
                onPress={() => setConfirmingReset(false)}
              >
                <Text style={[styles.confirmNoText, { color: colors.foreground }]}>Not yet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmYes, { backgroundColor: colors.destructive }]}
                onPress={confirmReset}
                testID="confirm-reset-btn"
              >
                <Text style={styles.confirmYesText}>Yes, reset!</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.resetBtn, { borderColor: colors.destructive }]}
            onPress={handleReset}
            testID="reset-stats-btn"
          >
            <Text style={{ fontSize: 16 }}>🗑️</Text>
            <Text style={[styles.resetText, { color: colors.destructive }]}>
              Reset Stats
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  bigCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  bigCardLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  bigCardNum: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    lineHeight: 64,
  },
  bigCardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  resetBtn: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  resetText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  confirmRow: {
    gap: 12,
    alignItems: "center",
    marginTop: 8,
  },
  confirmQuestion: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  confirmBtns: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmNo: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmNoText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  confirmYes: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmYesText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
