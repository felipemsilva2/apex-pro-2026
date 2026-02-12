import { View, Text, ViewProps, StyleSheet } from 'react-native';

interface HUDCardProps extends ViewProps {
    title?: string;
    subtitle?: string;
    label?: string;
    children?: React.ReactNode;
}

export function HUDCard({ title, subtitle, label, children, style, ...props }: HUDCardProps) {
    return (
        <View
            style={[styles.card, style] as any}
            {...props}
        >
            {/* Kinetic Accent */}
            <View style={styles.accent} />

            <View style={styles.header}>
                <View>
                    {label && (
                        <Text style={styles.label}>
                            {label}
                        </Text>
                    )}
                    {title && (
                        <Text style={styles.title}>
                            {title}
                        </Text>
                    )}
                    {subtitle && (
                        <Text style={styles.subtitle}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#121214',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: 20,
        transform: [{ skewX: '-2deg' }],
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    accent: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 2,
        backgroundColor: '#D4FF00',
        opacity: 0.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    label: {
        color: '#D4FF00',
        fontSize: 10,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4,
    },
    title: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    content: {
        transform: [{ skewX: '2deg' }],
    }
});
