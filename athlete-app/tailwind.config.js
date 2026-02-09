/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#D4FF00",
                background: "#050505",
                card: "rgba(255, 255, 255, 0.03)",
                muted: "#666666",
                border: "rgba(255, 255, 255, 0.05)",
            },
            fontFamily: {
                display: ["Syne_800ExtraBold"],
                sans: ["PlusJakartaSans_400Regular"],
            },
            borderRadius: {
                '2xl': '24px',
                '3xl': '32px',
            },
        },
    },
    plugins: [],
};
