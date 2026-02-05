import { supabase, type Tenant } from './supabase';

/**
 * Detects the current tenant based on the hostname.
 * Supports subdomains and custom domains.
 */
export async function detectTenant(): Promise<Tenant | null> {
    const hostname = window.location.hostname;

    // Localhost / IP testing support
    const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
    if (hostname === 'localhost' || hostname === '127.0.0.1' || isIp) {
        // Return a default test tenant only if providing via query param
        const urlParams = new URLSearchParams(window.location.search);
        const testSubdomain = urlParams.get('tenant');

        if (!testSubdomain) return null; // Default to generic branding if no tenant specified

        return fetchTenantBySubdomain(testSubdomain);
    }

    // Check for custom domain first
    const { data: customDomainTenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('custom_domain', hostname)
        .maybeSingle();

    if (customDomainTenant) return customDomainTenant;

    // Check for subdomain (e.g., apex.nutripro.com -> subdomain = 'apex')
    const parts = hostname.split('.');
    if (parts.length >= 3) {
        const subdomain = parts[0];
        return fetchTenantBySubdomain(subdomain);
    }

    return null;
}

async function fetchTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    // Try to find tenant by subdomain
    const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', subdomain)
        .maybeSingle();

    if (data) return data;

    if (error) {
        console.error('Error fetching tenant by subdomain:', error);
    }

    console.warn(`Tenant with subdomain '${subdomain}' not found. Using default branding.`);
    return null;
}

/**
 * Injects tenant branding (colors) into the DOM.
 */
export function injectBranding(config: Tenant) {
    const root = document.documentElement;

    console.log('[Whitelabel] Injecting branding:', {
        primary_color: config.primary_color,
        business_name: config.business_name
    });

    if (config.primary_color) {
        const hsl = hexToHsl(config.primary_color);
        console.log('[Whitelabel] Converted HEX to HSL:', config.primary_color, '->', hsl);
        if (hsl) {
            const hslValue = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
            root.style.setProperty('--primary', hslValue);
            root.style.setProperty('--ring', hslValue);
            root.style.setProperty('--accent', hslValue);
            console.log('[Whitelabel] Applied CSS variables:', hslValue);
        }
    }

    if (config.logo_url) {
        // You could store the logo URL in a CSS variable if needed for specific components
        root.style.setProperty('--tenant-logo', `url(${config.logo_url})`);

        // Update favicon dynamically
        updateFavicon(config.logo_url);
    }

    // Update document title
    document.title = `${config.business_name} | APEX PRO`;
}

/**
 * Resets the branding to the default Apex Protocol theme.
 * Removes injected CSS variables and resets the title.
 */
export function resetBranding() {
    const root = document.documentElement;

    console.log('[Whitelabel] Resetting branding to default');

    // Force reset to default Apex Protocol Green (Neon)
    // Instead of removing, we set explicit values to guarantee the look
    const defaultHsl = '67 100% 50%'; // Neon Green

    root.style.setProperty('--primary', defaultHsl);
    root.style.setProperty('--ring', defaultHsl);
    root.style.setProperty('--accent', defaultHsl);
    root.style.removeProperty('--tenant-logo');

    // Reset Title
    document.title = 'APEX PRO';
}

function updateFavicon(url: string) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = url;
}

function hexToHsl(hex: string) {
    // Basic hex to HSL conversion
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    } else {
        return null;
    }

    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}
