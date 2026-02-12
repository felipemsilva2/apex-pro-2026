
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configuração de como as notificações aparecem quando o app está aberto
try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
} catch (e) {
    console.warn('[Notifications] setNotificationHandler failed:', e);
}

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'web') return null;

    if (Device.isDevice) {
        console.log('[Notifications] Checking permissions...');
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            console.log('[Notifications] Requesting permissions...');
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        console.log('[Notifications] Final permission status:', finalStatus);

        if (finalStatus !== 'granted') {
            console.warn('Falha ao obter permissão para notificações push!');
            return null;
        }

        try {
            console.log('[Notifications] Fetching Expo Push Token...');
            // O projectId é necessário para o EAS
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            console.log('[Notifications] Project ID used for token:', projectId);

            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;
            console.log('[Notifications] Token gerado com sucesso:', token);
        } catch (e) {
            console.error('[Notifications] Erro crítico ao obter token:', e);
        }
    } else {
        console.warn('Notificações push só funcionam em dispositivos físicos!');
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#D4FF00',
        });
    }

    return token;
}
