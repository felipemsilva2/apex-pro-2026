import React, { memo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { DEFAULT_INITIAL_COLORS } from "./const";
import type { IAnimatedMeshGradient } from "./types";

export const AnimatedMeshGradient: React.FC<IAnimatedMeshGradient> = memo(({
    colors = DEFAULT_INITIAL_COLORS,
    style,
    width: paramsWidth,
    height: paramsHeight,
}) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const width = paramsWidth ?? screenWidth;
    const height = paramsHeight ?? screenHeight;

    // Convert mesh gradient colors to linear gradient format
    const gradientColors = [
        `rgba(${colors[0].r * 255}, ${colors[0].g * 255}, ${colors[0].b * 255}, 1)`,
        `rgba(${colors[3].r * 255}, ${colors[3].g * 255}, ${colors[3].b * 255}, 1)`
    ];

    return (
        <View style={[styles.container, style, { width, height }]}>
            <LinearGradient
                colors={gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
        backgroundColor: "#000",
    },
});

export default AnimatedMeshGradient;
