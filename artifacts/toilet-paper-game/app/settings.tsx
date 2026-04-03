import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TpBackground } from "@/components/TpBackground";
import { useGame } from "@/context/GameContext";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const { game } = useGame();
  const isPlaying = game.phase === "playing";

  const [username, setUsername] = useState(settings.username);

  if (isPlaying) {
    return (
      <View style={[styles.blockedContainer, { backgroundColor: colors.background }]}>
        <TpBackground />
        <Text style={[styles.blockedTitle, { color: colors.text }]}>Settings Locked</Text>
        <Text style={[styles.blockedSubtext, { color: colors.subtext }]}>
          Finish or end your current game to change settings.
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSaveUsername = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      Alert.alert("Invalid name", "Please enter a username.");
      return;
    }
    updateSettings({ username: trimmed });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const setConstant = (val: number) => {
    Haptics.selectionAsync();
    updateSettings({ constant: val });
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TpBackground />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
              <Text style={{ fontSize: 20, color: colors.foreground }}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
          </View>

          {isPlaying && (
            <View style={[styles.warnBanner, { backgroundColor: colors.accent + "22", borderColor: colors.accent }]}>
              <Text style={{ fontSize: 15 }}>⚠️</Text>
              <Text style={[styles.warnText, { color: colors.accent }]}>
                Some settings cannot be changed during a game.
              </Text>
            </View>
          )}

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Player</Text>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Username</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground },
                ]}
                value={username}
                onChangeText={setUsername}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="done"
                onSubmitEditing={handleSaveUsername}
                maxLength={24}
                testID="username-input"
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveUsername}
                testID="save-username-btn"
              >
                <Text style={{ fontSize: 18, color: colors.primaryForeground }}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: isPlaying ? 0.6 : 1 }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Game Options</Text>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Bonus Mode</Text>
                <Text style={[styles.fieldSub, { color: colors.mutedForeground }]}>
                  Start with a bonus and grow it as your score climbs
                </Text>
              </View>
              <Switch
                value={settings.bonusEnabled}
                onValueChange={(v) => {
                  if (isPlaying) return;
                  Haptics.selectionAsync();
                  updateSettings({ bonusEnabled: v });
                }}
                disabled={isPlaying}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor={colors.primaryForeground}
                testID="bonus-toggle"
              />
            </View>

            <Text style={[styles.fieldLabel, { color: colors.foreground, marginTop: 16 }]}>
              Square Constant: {settings.constant}
            </Text>
            <Text style={[styles.fieldSub, { color: colors.mutedForeground }]}>
              The target squares per wipe (1–6). Default is 4.
            </Text>
            <View style={styles.constantRow}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.constBtn,
                    {
                      backgroundColor: settings.constant === n ? colors.primary : colors.secondary,
                      borderColor: settings.constant === n ? colors.primary : colors.border,
                      opacity: isPlaying ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => { if (!isPlaying) setConstant(n); }}
                  disabled={isPlaying}
                  testID={`constant-${n}`}
                >
                  <Text style={[styles.constBtnText, { color: settings.constant === n ? colors.primaryForeground : colors.foreground }]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How It Works</Text>
            <Text style={[styles.howText, { color: colors.mutedForeground }]}>
              {"• Each wipe, enter how many squares you used.\n"}
              {"• score += " + settings.constant + " − squares used\n"}
              {"• If score goes negative: bonus absorbs it, score resets to 0\n"}
              {"• Bonus grows when score crosses multiples of " + (settings.constant * 2) + "\n"}
              {"• Final score = score + bonus"}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  warnBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  warnText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  fieldSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  constantRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  constBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  constBtnText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  howText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  blockedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  blockedTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
    textAlign: "center",
  },
  blockedSubtext: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
