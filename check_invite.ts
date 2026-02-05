import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkInvite(token: string) {
    console.log(`Checking invite for token: ${token}`);

    const { data: invite, error: inviteError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single();

    if (inviteError) {
        console.error('Error fetching invite:', inviteError.message);
        // Let's check if there are any invitations at all to see if connection works
        const { data: allInvites, error: allErr } = await supabase.from('invitations').select('token').limit(5);
        if (allErr) {
            console.error('Database connection error:', allErr.message);
        } else {
            console.log('Other available tokens (first 5):', allInvites.map(i => i.token));
        }
        return;
    }

    console.log('Invite Data:', JSON.stringify(invite, null, 2));

    const now = new Date();
    const expiresAt = new Date(invite.expires_at);
    console.log('Current Time:', now.toISOString());
    console.log('Expires At:', expiresAt.toISOString());
    console.log('Is Expired?', expiresAt < now);
    console.log('Status:', invite.status);

    if (invite.tenant_id) {
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', invite.tenant_id)
            .single();

        if (tenantError) {
            console.error('Error fetching tenant:', tenantError.message);
        } else {
            console.log('Tenant Data:', JSON.stringify(tenant, null, 2));
        }
    }
}

const token = process.argv[2] || '691d2119-3f08-40d5-ad1e-a276a731a2a7';
checkInvite(token);
