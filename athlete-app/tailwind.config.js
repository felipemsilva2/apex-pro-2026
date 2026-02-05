/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#D4FF00",
                background: "#0A0A0B",
                card: "#121214",
                muted: "#808080",
            },
            fontFamily: {
                display: ["Syne_800ExtraBold"],
                sans: ["PlusJakartaSans_400Regular"],
            },
        },
    },
    plugins: [],
};
