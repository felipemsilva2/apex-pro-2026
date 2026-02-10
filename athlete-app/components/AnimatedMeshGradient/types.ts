import type { StyleProp, ViewStyle } from "react-native";

export interface IMeshGradientColor {
    r: number;
    g: number;
    b: number;
}

export interface IAnimatedMeshGradient {
    colors?: IMeshGradientColor[];
    speed?: number;
    noise?: number;
    blur?: number;
    contrast?: number;
    animated?: boolean;
    style?: StyleProp<ViewStyle>;
    width?: number;
    height?: number;
}
