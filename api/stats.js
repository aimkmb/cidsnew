module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const SUPABASE_URL = "https://sennodrfmsijorfcnrud.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbm5vZHJmbXNpam9yZmNucnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3MzY2NiwiZXhwIjoyMDk5NzQ5NjY2fQ.a2Ocfy4OQ-nPaEDeyzI9slDFzyT8OwFtz403G8uFcAY";

    const isHit = req.query.hit === '1';
    const isDownload = req.query.download === '1';

    let activeUsers = 5;
    let totalLicenses = 500;
    let visitors = 523;
    let downloads = 78;

    try {
        // 1. Dapatkan bilangan peranti berlesen aktif dari Web Lesen Supabase
        const devPromise = fetch(`${SUPABASE_URL}/rest/v1/license_devices?select=id`, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        }).then(r => r.ok ? r.json() : []).catch(() => []);

        // 2. Dapatkan rekod statistik dari pangkalan data Supabase
        const statsRowPromise = fetch(`${SUPABASE_URL}/rest/v1/license_keys?key=eq.SITE_STATS_METRICS&select=notes`, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        }).then(r => r.ok ? r.json() : []).catch(() => []);

        // 3. Integrasi servis kaunter awam percuma internet (hits.sh) untuk pelawat
        const visitorHitsPromise = isHit ? fetch('https://hits.sh/cidspro.vercel.app.svg', {
            headers: { 'User-Agent': 'Mozilla/5.0 (CIDS-Suites-Pro-Stats-Bot)' }
        }).then(r => r.text()).then(svg => {
            const m = svg.match(/hits:\s*(\d+)/i);
            return m ? parseInt(m[1], 10) : 0;
        }).catch(() => 0) : Promise.resolve(0);

        // 4. Integrasi servis kaunter awam percuma internet (hits.sh) untuk muat turun
        const downloadHitsPromise = isDownload ? fetch('https://hits.sh/cidspro.vercel.app-downloads.svg', {
            headers: { 'User-Agent': 'Mozilla/5.0 (CIDS-Suites-Pro-Stats-Bot)' }
        }).then(r => r.text()).then(svg => {
            const m = svg.match(/hits:\s*(\d+)/i);
            return m ? parseInt(m[1], 10) : 0;
        }).catch(() => 0) : Promise.resolve(0);

        const [devices, statsRows, vHitCount, dHitCount] = await Promise.all([
            devPromise,
            statsRowPromise,
            visitorHitsPromise,
            downloadHitsPromise
        ]);

        if (Array.isArray(devices) && devices.length > 0) {
            activeUsers = devices.length;
        }

        let dbStats = { visitors: 523, downloads: 78 };
        if (Array.isArray(statsRows) && statsRows.length > 0 && statsRows[0].notes) {
            try {
                dbStats = JSON.parse(statsRows[0].notes);
            } catch (e) {}
        }

        let needsUpdate = false;
        if (isHit) {
            dbStats.visitors = (dbStats.visitors || 523) + 1;
            needsUpdate = true;
        }
        if (isDownload) {
            dbStats.downloads = (dbStats.downloads || 78) + 1;
            needsUpdate = true;
        }

        visitors = dbStats.visitors || 523;
        downloads = dbStats.downloads || 78;

        // Selaraskan dengan servis kaunter awam hits.sh pelawat
        if (vHitCount > 0) {
            const calculatedFromHits = 516 + vHitCount;
            if (calculatedFromHits > visitors) {
                visitors = calculatedFromHits;
                dbStats.visitors = visitors;
                needsUpdate = true;
            }
        }

        // Selaraskan dengan servis kaunter awam hits.sh muat turun
        if (dHitCount > 0) {
            const calculatedFromDHits = 77 + dHitCount;
            if (calculatedFromDHits > downloads) {
                downloads = calculatedFromDHits;
                dbStats.downloads = downloads;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            await fetch(`${SUPABASE_URL}/rest/v1/license_keys?key=eq.SITE_STATS_METRICS`, {
                method: 'PATCH',
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    notes: JSON.stringify(dbStats)
                })
            }).catch(e => console.error('Error updating stats DB:', e));
        }

        return res.status(200).json({
            activeUsers,
            totalLicenses,
            visitors,
            downloads,
            services: {
                visitors: vHitCount > 0 ? `hits.sh (#${vHitCount})` : 'online',
                downloads: dHitCount > 0 ? `hits.sh-dl (#${dHitCount})` : 'online'
            },
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        return res.status(200).json({
            activeUsers: 5,
            totalLicenses: 500,
            visitors: 523,
            downloads: 78,
            fallback: true
        });
    }
};
