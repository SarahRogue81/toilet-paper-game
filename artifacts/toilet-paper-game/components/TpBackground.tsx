import React from "react";
import { Image, StyleSheet } from "react-native";

export function TpBackground() {
  return (
    <Image
      source={require("../assets/images/background.png")}
      style={styles.image}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
  },
});
