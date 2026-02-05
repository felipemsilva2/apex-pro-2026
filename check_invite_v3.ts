import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const token = process.argv[2] || '691d2119-3f08-40d5-ad1e-a276a731a2a7';

async function run() {
    const url = env.VITE_SUPABASE_URL;
    console.log(`Testing URL: ${url}`);
    const supabase = createClient(url, env.VITE_SUPABASE_ANON_KEY);

    const { data: invite, error: inviteError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .maybeSingle();

    if (inviteError) {
        console.error(`Error:`, inviteError.message);
    } else if (invite) {
        console.log(`FOUND INVITE:`, JSON.stringify(invite, null, 2));
    } else {
        console.log(`Invite NOT FOUND for any status.`);
        const { data: all } = await supabase.from('invitations').select('token, status').limit(10);
        console.log(`Invites in table:`, all || []);
    }
}

run();
