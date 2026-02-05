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

// Try BOTH project IDs
const projectIds = ['bo1qecrzszyjipdhddkn', 'boiqecrzszyjipdhddkn'];
const token = process.argv[2] || '691d2119-3f08-40d5-ad1e-a276a731a2a7';

async function run() {
    for (const projectId of projectIds) {
        console.log(`\n--- Testing Project ID: ${projectId} ---`);
        const url = `https://${projectId}.supabase.co`;
        const supabase = createClient(url, env.VITE_SUPABASE_ANON_KEY);

        const { data: invite, error: inviteError } = await supabase
            .from('invitations')
            .select('*')
            .eq('token', token)
            .maybeSingle();

        if (inviteError) {
            console.error(`Error fetching invite from ${projectId}:`, inviteError.message);
        } else if (invite) {
            console.log(`FOUND INVITE in ${projectId}:`, JSON.stringify(invite, null, 2));
            return;
        } else {
            console.log(`Invite not found in ${projectId}.`);
            // Check if ANY invites exist
            const { data: others } = await supabase.from('invitations').select('token').limit(3);
            console.log(`Other tokens in ${projectId}:`, others?.map(o => o.token) || []);
        }
    }
}

run();
