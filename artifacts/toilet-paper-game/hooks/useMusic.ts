import { useAudioPlayer } from "expo-audio";
import { useEffect } from "react";
import { Platform } from "react-native";

const MUSIC_MODULE = require("../assets/audio/background_music.mp3");

export function useMusic(playing: boolean) {
  const player = useAudioPlayer(Platform.OS === "web" ? null : MUSIC_MODULE);

  useEffect(() => {
    if (Platform.OS === "web" || !player) return;
    player.loop = true;
    player.volume = 0.3;
  }, [player]);

  useEffect(() => {
    if (Platform.OS === "web" || !player) return;
    try {
      if (playing) {
        player.play();
      } else {
        player.pause();
      }
    } catch (e) {
      console.warn("[music] play/pause error:", e);
    }
  }, [playing, player]);
}
