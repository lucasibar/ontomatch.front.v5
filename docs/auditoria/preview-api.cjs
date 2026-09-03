// Visual QA only. Synthetic data, no database or external API connections.
// Run manually with node docs/auditoria/preview-api.cjs. Binds loopback only.
const http = require('node:http');
const id = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const conversation = '33333333-3333-4333-8333-333333333333';
const photo = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#c8d2cf"/><circle cx="300" cy="280" r="95" fill="#899a96"/><path d="M90 800V610a210 210 0 0 1 420 0v190" fill="#899a96"/></svg>');
let profile = { user_id: id, name: 'Alex', birthdate: '1992-05-12', gender: 'non_binary', genderCustom: '', bio: 'Me gusta escuchar, caminar y descubrir nuevas historias.', looking_for: 'casual_dating', coachingSchool: 'Escuela de ejemplo', locationText: 'Córdoba, Córdoba', isOnboarded: true, user: { photos: [1,2,3].map(n => ({ id: String(n), url: photo, position: n, isActive: true })) } };
let preferences = { ageMin: 25, ageMax: 45, distanceKm: 50, gendersAllowed: ['all'] };
const publicProfile = { user_id: other, name: 'Mar', age: 32, gender: 'female', bio: 'Me gusta compartir conversaciones, caminatas y proyectos.', looking_for: 'serious', coachingSchool: 'Escuela de coaching', locationText: 'Córdoba, Córdoba', distanceKm: 12, photos: [1,2,3].map(position => ({ url: photo, position })) };
const messages = Array.from({ length: 12 }, (_, n) => ({ id: 'm' + n, senderUserId: n % 2 ? id : other, body: n % 2 ? 'Sí, me gustaría. ¿Qué lugares te gustan?' : 'Hola, ¿te gustaría conversar y conocernos?', createdAt: new Date(Date.UTC(2026, 8, 3, 14, n)).toISOString(), conversation: { id: conversation } }));
http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'OPTIONS') return res.end();
    const url = new URL(req.url, 'http://127.0.0.1');
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const body = raw ? JSON.parse(raw) : {};
    let result = {};
    if (url.pathname === '/auth/login' || url.pathname === '/auth/register') {
        profile.isOnboarded = !body.email?.startsWith('pending');
        result = { access_token: 'local-visual-fixture', user: { id, email: 'demo@example.test', isOnboarded: profile.isOnboarded } };
    } else if (url.pathname === '/profiles/me') {
        if (req.method === 'POST') Object.assign(profile, body);
        result = profile;
    } else if (url.pathname === '/profiles/complete') {
        Object.assign(profile, body.profile, { isOnboarded: true }); Object.assign(preferences, body.preferences); result = profile;
    } else if (url.pathname === '/preferences/me') {
        if (req.method === 'PATCH') Object.assign(preferences, body);
        result = preferences;
    } else if (url.pathname === '/discovery/feed') result = { data: [publicProfile], meta: { hasNext: false } };
    else if (url.pathname === '/conversations') result = [{ id: conversation, partner: { id: other, name: 'Mar', photoUrl: photo }, updatedAt: new Date().toISOString(), unreadCount: 0, lastMessage: { body: messages[11].body, senderId: id, createdAt: messages[11].createdAt } }];
    else if (url.pathname.endsWith('/messages')) result = { data: messages, nextCursor: null };
    else if (url.pathname === '/profiles/' + other) result = publicProfile;
    else if (url.pathname === '/locations') result = [{ id: '44444444-4444-4444-8444-444444444444', locality: 'Córdoba', province: 'Córdoba' }];
    else if (url.pathname.startsWith('/admin')) result = { isAdmin: false };
    else if (url.pathname.startsWith('/swipes')) result = { matched: false };
    res.end(JSON.stringify(result));
}).listen(3101, '127.0.0.1', () => console.log('Synthetic visual API ready on 127.0.0.1:3101'));
