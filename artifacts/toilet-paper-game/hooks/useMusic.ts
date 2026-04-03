import { Audio } from "expo-av";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

const MUSIC_ASSET = require("../assets/audio/background_music.mp3");

export function useMusic(playing: boolean) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadedRef = useRef(false);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
    if (!loadedRef.current || !soundRef.current) return;
    if (playing) {
      soundRef.current.playAsync().catch(() => {});
    } else {
      soundRef.current.pauseAsync().catch(() => {});
    }
  }, [playing]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    let active = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        const { sound } = await Audio.Sound.createAsync(
          MUSIC_ASSET,
          { isLooping: true, volume: 0.3, shouldPlay: false }
        );
        if (!active) {
          sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
        loadedRef.current = true;
        if (playingRef.current) {
          await sound.playAsync();
        }
      } catch (_) {}
    })();

    return () => {
      active = false;
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
        loadedRef.current = false;
      }
    };
  }, []);
}
