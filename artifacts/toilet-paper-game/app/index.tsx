import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TpBackground } from "@/components/TpBackground";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { useGame } from "@/context/GameContext";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { useMusic } from "@/hooks/useMusic";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { game, startGame, recordWipe, endGame, resetGame } = useGame();
  const { settings, stats, updateStats } = useSettings();
  const [inputValue, setInputValue] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isPlaying = game.phase === "playing";
  const isEnded = game.phase === "ended";
  const isIdle = game.phase === "idle";

  useMusic(isPlaying);

  const buttonScale = useSharedValue(1);
  const scoreScale = useSharedValue(1);

  const animButton = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animScore = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const handleStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(withSpring(0.93), withSpring(1));
    startGame(settings.constant, settings.bonusEnabled);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [settings, startGame]);

  const handleResume = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleWipe = useCallback(() => {
    const sq = parseInt(inputValue, 10);
    if (isNaN(sq) || sq < 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid Input", "Please enter a valid number of squares (0 or more).");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scoreScale.value = withSequence(withTiming(1.15, { duration: 120 }), withSpring(1));
    recordWipe(sq, settings.constant);
    setInputValue("");
    inputRef.current?.clear();
  }, [inputValue, settings.constant, recordWipe]);

  const handleEndGame = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfirmingEnd(true);
  }, []);

  const handleConfirmEnd = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmingEnd(false);
    endGame();
  }, [endGame]);

  const handleCancelEnd = useCallback(() => {
    setConfirmingEnd(false);
  }, []);

  const handleNewGame = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowConfetti(false);
    resetGame();
    setInputValue("");
  }, [resetGame]);

  useEffect(() => {
    if (isEnded && game.finalScore !== null) {
      setShowConfetti(true);
      const wipeCount = game.wipes.length;
      const tissueAvg =
        wipeCount > 0 ? game.totalSquares / wipeCount : 0;
      updateStats(game.finalScore, tissueAvg);
    }
  }, [isEnded]);

  const lastWipe = game.wipes[game.wipes.length - 1];
  const wipeCount = game.wipes.length;
  const tissueAvg =
    wipeCount > 0 ? game.totalSquares / wipeCount : 0;
  const tissueAvgDisplay = tissueAvg > 0 ? String(Math.round(tissueAvg)) : "—";

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TpBackground />
      <ConfettiEffect active={showConfetti} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topInset + 16, paddingBottom: bottomInset + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>
              The Toilet Paper Game
            </Text>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              Hey {settings.username}!
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/stats")}
                testID="stats-btn"
              >
                <Ionicons name="trophy-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border, opacity: isPlaying ? 0.4 : 1 }]}
                onPress={() => { if (!isPlaying) router.push("/settings"); }}
                disabled={isPlaying}
                testID="settings-btn"
              >
                <Ionicons name="settings-outline" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          {isIdle && (
            <Animated.View entering={FadeInDown.springify()} style={styles.idleSection}>
              <MaterialCommunityIcons
                name="toilet"
                size={96}
                color={colors.primary}
                style={{ alignSelf: "center", marginBottom: 16 }}
              />
              <Text style={[styles.idleText, { color: colors.foreground }]}>
                Sit down and start tracking your wipes to play!
              </Text>
              {stats.highScore > 0 && (
                <Text style={[styles.idleSubtext, { color: colors.mutedForeground }]}>
                  Your best score: {stats.highScore}
                </Text>
              )}
              <Animated.View style={animButton}>
                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: colors.primary }]}
                  onPress={handleStart}
                  testID="start-btn"
                >
                  <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
                    Start Session
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          )}

          {isPlaying && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.playSection}>
              <View style={styles.scoreRow}>
                <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Animated.Text style={[styles.scoreNum, { color: colors.primary }, animScore]}>
                    {game.score}
                  </Animated.Text>
                  <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Score</Text>
                </View>
                {settings.bonusEnabled && (
                  <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.scoreNum, { color: colors.accent }]}>
                      {game.bonus}
                    </Text>
                    <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Bonus</Text>
                  </View>
                )}
                <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.scoreNum, { color: colors.foreground }]}>
                    {wipeCount}
                  </Text>
                  <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Wipes</Text>
                </View>
              </View>

              {lastWipe && (
                <Animated.View entering={FadeInUp.duration(200)} style={[styles.lastWipeBanner, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.lastWipeText, { color: colors.secondaryForeground }]}>
                    Last wipe: {lastWipe.squares} sq  •  {lastWipe.scoreDelta >= 0 ? "+" : ""}{lastWipe.scoreDelta} pts
                  </Text>
                </Animated.View>
              )}

              <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                  How many squares for this wipe?
                </Text>
                <Text style={[styles.inputHint, { color: colors.mutedForeground }]}>
                  Target: {settings.constant} squares or fewer
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    ref={inputRef}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.input,
                        color: colors.foreground,
                      },
                    ]}
                    keyboardType="number-pad"
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder="e.g. 3"
                    placeholderTextColor={colors.mutedForeground}
                    returnKeyType="done"
                    onSubmitEditing={handleWipe}
                    maxLength={3}
                    testID="wipe-input"
                  />
                  <TouchableOpacity
                    style={[styles.wipeBtn, { backgroundColor: colors.primary }]}
                    onPress={handleWipe}
                    testID="submit-wipe-btn"
                  >
                    <Ionicons name="checkmark" size={26} color={colors.primaryForeground} />
                  </TouchableOpacity>
                </View>
              </View>

              {confirmingEnd ? (
                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmQuestion, { color: colors.foreground }]}>
                    End session?
                  </Text>
                  <View style={styles.confirmButtons}>
                    <TouchableOpacity
                      style={[styles.confirmBtn, { backgroundColor: colors.secondary }]}
                      onPress={handleCancelEnd}
                      testID="cancel-end-btn"
                    >
                      <Text style={[styles.confirmBtnText, { color: colors.foreground }]}>
                        Not yet
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.confirmBtn, { backgroundColor: colors.accent }]}
                      onPress={handleConfirmEnd}
                      testID="confirm-end-btn"
                    >
                      <Text style={[styles.confirmBtnText, { color: colors.accentForeground }]}>
                        Yes, done!
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.endBtn, { backgroundColor: colors.accent }]}
                  onPress={handleEndGame}
                  testID="end-game-btn"
                >
                  <Text style={[styles.endBtnText, { color: colors.accentForeground }]}>
                    Done Wiping
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          {isEnded && (
            <Animated.View entering={FadeInDown.springify()} style={styles.endSection}>
              <Text style={[styles.endTitle, { color: colors.primary }]}>
                Great Job!
              </Text>
              <Text style={[styles.endYay, { color: colors.foreground }]}>
                Session Complete!
              </Text>

              <View style={[styles.finalScoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.finalScoreLabel, { color: colors.mutedForeground }]}>
                  Final Score
                </Text>
                <Text style={[styles.finalScoreNum, { color: colors.primary }]}>
                  {game.finalScore}
                </Text>
                {settings.bonusEnabled && (
                  <Text style={[styles.finalScoreBreak, { color: colors.mutedForeground }]}>
                    Score {game.score} + Bonus {game.bonus}
                  </Text>
                )}
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statPill, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.statPillLabel, { color: colors.mutedForeground }]}>Wipes</Text>
                  <Text style={[styles.statPillValue, { color: colors.foreground }]}>{wipeCount}</Text>
                </View>
                <View style={[styles.statPill, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.statPillLabel, { color: colors.mutedForeground }]}>Tissues/Wipe Avg</Text>
                  <Text style={[styles.statPillValue, { color: colors.foreground }]}>{tissueAvgDisplay}</Text>
                </View>
                <View style={[styles.statPill, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.statPillLabel, { color: colors.mutedForeground }]}>Squares</Text>
                  <Text style={[styles.statPillValue, { color: colors.foreground }]}>{game.totalSquares}</Text>
                </View>
              </View>

              {stats.highScore === game.finalScore && game.finalScore > 0 && (
                <Text style={[styles.newRecord, { color: colors.accent }]}>
                  New High Score!
                </Text>
              )}

              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={handleNewGame}
                testID="new-game-btn"
              >
                <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
                  Play Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statsLink]}
                onPress={() => router.push("/stats")}
              >
                <Text style={[styles.statsLinkText, { color: colors.primary }]}>
                  View All Stats
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {isPlaying && game.wipes.length > 0 && (
            <View style={[styles.wiperLog, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.logTitle, { color: colors.foreground }]}>Wipe Log</Text>
              {[...game.wipes].reverse().slice(0, 8).map((w, i) => (
                <View key={i} style={[styles.logRow, { borderColor: colors.border }]}>
                  <Text style={[styles.logText, { color: colors.mutedForeground }]}>
                    #{game.wipes.length - i}
                  </Text>
                  <Text style={[styles.logText, { color: colors.foreground }]}>
                    {w.squares} sq
                  </Text>
                  <Text style={[styles.logDelta, { color: w.scoreDelta >= 0 ? colors.success : colors.destructive }]}>
                    {w.scoreDelta >= 0 ? "+" : ""}{w.scoreDelta}
                  </Text>
                  <Text style={[styles.logText, { color: colors.mutedForeground }]}>
                    → {w.scoreAfter}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    width: "100%",
    marginTop: -6,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  idleSection: {
    gap: 16,
    paddingTop: 24,
  },
  idleText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 26,
  },
  idleSubtext: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  startBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  startBtnText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  playSection: {
    gap: 14,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 10,
  },
  scoreCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  scoreNum: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  lastWipeBanner: {
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  lastWipeText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  inputCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  inputLabel: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  inputHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: -6,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  wipeBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  endBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  endBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  confirmRow: {
    gap: 10,
  },
  confirmQuestion: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  endSection: {
    gap: 16,
    alignItems: "center",
  },
  endTitle: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  endYay: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  finalScoreCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  finalScoreLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  finalScoreNum: {
    fontSize: 64,
    fontFamily: "Inter_700Bold",
    lineHeight: 72,
  },
  finalScoreBreak: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  statPill: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statPillLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  statPillValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  newRecord: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statsLink: {
    padding: 8,
  },
  statsLinkText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  wiperLog: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  logTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
    textAlign: "center",
  },
  logDelta: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    textAlign: "center",
  },
  secondaryForeground: {
    color: "#2c1a0e",
  },
});
