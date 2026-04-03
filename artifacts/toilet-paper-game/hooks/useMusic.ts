import { Audio } from "expo-av";
import { Asset } from "expo-asset";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

const MUSIC_MODULE = require("../assets/audio/background_music.mp3");

export function useMusic(playing: boolean) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadedRef = useRef(false);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
    if (!loadedRef.current || !soundRef.current) return;
    if (playing) {
      soundRef.current.playAsync().catch((e) => console.warn("[music] play error:", e));
    } else {
      soundRef.current.pauseAsync().catch((e) => console.warn("[music] pause error:", e));
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

        // Download asset to local filesystem so ExoPlayer gets a file:// URI
        const asset = Asset.fromModule(MUSIC_MODULE);
        await asset.downloadAsync();
        if (!active) return;

        const { sound } = await Audio.Sound.createAsync(
          { uri: asset.localUri! },
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
      } catch (e) {
        console.warn("[music] load error:", e);
      }
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
