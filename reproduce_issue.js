import https from 'https';

const SUPABASE_URL = 'https://boiqecrzszyjipdhddkn.supabase.co';
// From .env.local
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaXFlY3J6c3p5amlwZGhkZGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDcyNzUsImV4cCI6MjA4NTI4MzI3NX0.p2zEzs2ZLTRCiJjvnOCQku-feAVBNWjo7hQU4SRyBcI';

const data = JSON.stringify({
    fullName: "Augusto Teste Debug",
    username: "augusto.teste.debug",
    password: "Password123!",
    role: "client",
    tenantId: "90bdb4d9-9361-438d-92d8-dd3fa28d5e07" // Tenant 'felipe personal 2'
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`
    }
};

console.log(`Sending request to ${SUPABASE_URL}/functions/v1/manage-athlete`);

const req = https.request(`${SUPABASE_URL}/functions/v1/manage-athlete`, options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${body}`);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
