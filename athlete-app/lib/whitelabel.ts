import { supabase } from '../lib/supabase';

export type Tenant = {
    id: string;
    subdomain: string;
    custom_domain: string | null;
    logo_url: string | null;
    terminology?: Record<string, string>;
    landing_page_config?: any;
    favicon_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    font_family: string | null;
    business_name: string;
    tagline: string | null;
    contact_email: string | null;
    plan_tier: 'free' | 'pro' | 'elite' | null;
    created_at: string;
    updated_at: string;
};

// Default branding for ApexPRO
export const DEFAULT_BRANDING = {
    business_name: 'ApexPRO Athlete' as const,
    primary_color: '#D4FF00', // Neon green
    secondary_color: '#0A0A0B', // Dark background
    logo_url: null,
};

/**
 * Fetches tenant branding configuration from the database
 */
export async function getTenantBranding(tenantId: string): Promise<Tenant | null> {
    try {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .maybeSingle();

        if (error) {
            console.error('[Whitelabel] Error fetching tenant:', error);
            return null;
        }

        if (!data) {
            console.warn('[Whitelabel] Tenant not found:', tenantId);
            return null;
        }

        const tenantData = data as any;

        console.log('[Whitelabel] Loaded tenant branding:', {
            business_name: tenantData.business_name,
            primary_color: tenantData.primary_color,
            logo_url: tenantData.logo_url,
        });

        return tenantData as Tenant;
    } catch (error) {
        console.error('[Whitelabel] Exception fetching tenant:', error);
        return null;
    }
}

/**
 * Gets the effective colors for the current tenant
 * Falls back to defaults if tenant doesn't have custom colors
 */
export function getEffectiveColors(tenant: Tenant | null) {
    return {
        primary: tenant?.primary_color || DEFAULT_BRANDING.primary_color,
        secondary: tenant?.secondary_color || DEFAULT_BRANDING.secondary_color,
    };
}

/**
 * Gets the effective business name
 */
export function getEffectiveBusinessName(tenant: Tenant | null): string {
    return tenant?.business_name || DEFAULT_BRANDING.business_name;
}

/**
 * Gets the effective logo URL
 */
export function getEffectiveLogoUrl(tenant: Tenant | null): string | null {
    return tenant?.logo_url || DEFAULT_BRANDING.logo_url;
}

/**
 * Calculates the relative luminance of a hex color
 */
export function getLuminance(hex: string): number {
    const color = hex.replace('#', '');
    const r = parseInt(color.slice(0, 2), 16) / 255;
    const g = parseInt(color.slice(2, 4), 16) / 255;
    const b = parseInt(color.slice(4, 6), 16) / 255;

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance;
}

/**
 * Returns a color with opacity
 */
export function getAlphaColor(hex: string, alpha: number): string {
    const color = hex.replace('#', '');
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Gets a contrasting text color for a given background (primary brand color)
 * Useful for badges on dark theme
 */
export function getOnPrimaryColor(primaryHex: string): string {
    const luminance = getLuminance(primaryHex);
    // If background is dark, text should be light (white or very light primary)
    if (luminance < 0.3) return '#FFFFFF';
    // If background is light, text can be the full primary color
    return primaryHex;
}

/**
 * Gets a visible badge style based on whitelabel color
 * On our dark app, we need to ensure the primary color pop against black.
 * We use a "glow" style: lightened color for text/border + subtle alpha background.
 */
export function getBadgeStyle(primaryHex: string) {
    const visibleColor = getVisibleColor(primaryHex);

    return {
        background: getAlphaColor(visibleColor, 0.12),
        text: visibleColor,
        border: getAlphaColor(visibleColor, 0.3)
    };
}

/**
 * Ensures a color is visible against the app's dark background.
 * If the color is too dark, it returns a lightened version.
 */
export function getVisibleColor(hex: string): string {
    const luminance = getLuminance(hex);
    // If it's too dark for an icon/text on black, lighten it
    if (luminance < 0.4) {
        // Simple lightening: mix with white or just return a fixed lightened version
        // For a more tactical look, we can return something like 70% brightness
        const color = hex.replace('#', '');
        let r = parseInt(color.slice(0, 2), 16);
        let g = parseInt(color.slice(2, 4), 16);
        let b = parseInt(color.slice(4, 6), 16);

        // Boost each channel towards 255
        r = Math.round(r + (255 - r) * 0.5);
        g = Math.round(g + (255 - g) * 0.5);
        b = Math.round(b + (255 - b) * 0.5);

        const newHex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        return newHex;
    }
    return hex;
}

/**
 * Gets a terminology value for a given key, falling back to a default
 */
export const getTerminology = (tenant: Tenant | null, key: string, defaultValue: string): string => {
    if (!tenant?.terminology) return defaultValue;
    return tenant.terminology[key] || defaultValue;
};
