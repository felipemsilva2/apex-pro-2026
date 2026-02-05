import { Request, Response, NextFunction } from 'express';
import { supabase } from '@/lib/supabase'; // Assuming backend uses a server-side client

/**
 * Middleware to authenticate user and extract tenant context.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Identify Tenant
        // Option 1: From user profile (most safe)
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single();

        if (!profile?.tenant_id) {
            return res.status(403).json({ error: 'User is not assigned to any tenant' });
        }

        // Attach to request
        (req as any).user = user;
        (req as any).tenantId = profile.tenant_id;

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Middleware to ensure request comes from a valid whitelabel context (even before login)
 */
export async function identifyTenant(req: Request, res: Response, next: NextFunction) {
    const hostname = req.hostname;

    // Logic to find tenant_id from subdomain or custom domain
    // (Simplified for this example)
    const parts = hostname.split('.');
    if (parts.length >= 3) {
        (req as any).tenantSlug = parts[0];
    }

    next();
}
