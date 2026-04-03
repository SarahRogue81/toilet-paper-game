import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
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

  const handleReset = () => {
    Alert.alert(
      "Reset Stats",
      "This will clear your high score and tissue average. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await resetStats();
          },
        },
      ]
    );
  };

  const hasStats = stats.highScore > 0 || stats.bestTissueAverage > 0;

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
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {settings.username}'s Stats
          </Text>
        </View>

        {!hasStats ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyState}>
            <MaterialCommunityIcons
              name="trophy-outline"
              size={72}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No Stats Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Complete a game session to see your stats here.
            </Text>
          </Animated.View>
        ) : (
          <>
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={[styles.bigCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons
                name="trophy"
                size={40}
                color={colors.primary}
                style={{ alignSelf: "center" }}
              />
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
              <MaterialCommunityIcons
                name="hand-wash"
                size={40}
                color={colors.accent}
                style={{ alignSelf: "center" }}
              />
              <Text style={[styles.bigCardLabel, { color: colors.mutedForeground }]}>
                Best Tissue Average per Wipe
              </Text>
              <Text style={[styles.bigCardNum, { color: colors.accent }]}>
                {stats.bestTissueAverage}
              </Text>
              <Text style={[styles.bigCardSub, { color: colors.mutedForeground }]}>
                squares per wipe (lower is better)
              </Text>
            </Animated.View>

            <TouchableOpacity
              style={[styles.resetBtn, { borderColor: colors.destructive }]}
              onPress={handleReset}
              testID="reset-stats-btn"
            >
              <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              <Text style={[styles.resetText, { color: colors.destructive }]}>
                Reset Stats
              </Text>
            </TouchableOpacity>
          </>
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
});
