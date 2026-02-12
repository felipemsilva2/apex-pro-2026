import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * CrashScreen — Global Error Boundary
 * 
 * Catches ANY unhandled JS error in the React tree and shows a
 * bright red diagnostic screen with the full error message + stack trace.
 * 
 * This replaces the default SIGABRT crash with a visible, screenshot-able screen.
 */
export class CrashScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });
        console.error('[CrashScreen] Caught fatal error:', error.message);
        console.error('[CrashScreen] Component stack:', errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            const { error, errorInfo } = this.state;
            return (
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.emoji}>⚠️</Text>
                        <Text style={styles.title}>CRASH DETECTADO</Text>
                        <Text style={styles.subtitle}>Tire um print desta tela e envie para o dev</Text>
                    </View>

                    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                        {/* Error Name */}
                        <View style={styles.section}>
                            <Text style={styles.label}>ERRO:</Text>
                            <Text style={styles.errorName}>{error?.name || 'Unknown'}</Text>
                        </View>

                        {/* Error Message */}
                        <View style={styles.section}>
                            <Text style={styles.label}>MENSAGEM:</Text>
                            <Text style={styles.errorMessage}>{error?.message || 'Sem mensagem'}</Text>
                        </View>

                        {/* Stack Trace */}
                        <View style={styles.section}>
                            <Text style={styles.label}>STACK TRACE:</Text>
                            <Text style={styles.stack}>{error?.stack || 'Sem stack trace'}</Text>
                        </View>

                        {/* Component Stack */}
                        {errorInfo?.componentStack && (
                            <View style={styles.section}>
                                <Text style={styles.label}>COMPONENT STACK:</Text>
                                <Text style={styles.stack}>{errorInfo.componentStack}</Text>
                            </View>
                        )}

                        {/* Platform Info */}
                        <View style={styles.section}>
                            <Text style={styles.label}>PLATAFORMA:</Text>
                            <Text style={styles.meta}>
                                {Platform.OS} {Platform.Version}
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>TIMESTAMP:</Text>
                            <Text style={styles.meta}>{new Date().toISOString()}</Text>
                        </View>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A0000',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#FF3B30',
    },
    emoji: {
        fontSize: 48,
        marginBottom: 10,
    },
    title: {
        color: '#FF3B30',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        marginTop: 6,
        fontWeight: '600',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },
    section: {
        marginBottom: 20,
        backgroundColor: 'rgba(255, 59, 48, 0.08)',
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.2)',
    },
    label: {
        color: '#FF6B6B',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    errorName: {
        color: '#FF3B30',
        fontSize: 18,
        fontWeight: '800',
    },
    errorMessage: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 22,
    },
    stack: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        lineHeight: 16,
    },
    meta: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: '600',
    },
});
