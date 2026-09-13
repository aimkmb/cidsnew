module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const SUPABASE_URL = "https://sennodrfmsijorfcnrud.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbm5vZHJmbXNpam9yZmNucnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3MzY2NiwiZXhwIjoyMDk5NzQ5NjY2fQ.a2Ocfy4OQ-nPaEDeyzI9slDFzyT8OwFtz403G8uFcAY";

    const isHit = req.query.hit === '1' || req.method === 'POST';
    const isDownload = req.query.download === '1';

    let activeUsers = 5;
    let totalLicenses = 500;
    let visitors = 516;
    let downloads = 78;

    try {
        // 1. Dapatkan bilangan peranti berlesen aktif secara terus dari jadual license_devices (Web Lesen)
        const devPromise = fetch(`${SUPABASE_URL}/rest/v1/license_devices?select=id`, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        }).then(r => r.ok ? r.json() : []).catch(() => []);

        // 2. Dapatkan rekod statistik pelawat & muat turun dari pangkalan data
        const statsRowPromise = fetch(`${SUPABASE_URL}/rest/v1/license_keys?key=eq.SITE_STATS_METRICS&select=notes`, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        }).then(r => r.ok ? r.json() : []).catch(() => []);

        // 3. Integrasi servis kaunter awam percuma internet (hits.sh)
        const hitsPromise = isHit ? fetch('https://hits.sh/cidspro.vercel.app.svg', {
            headers: { 'User-Agent': 'Mozilla/5.0 (CIDS-Suites-Pro-Stats-Bot)' }
        }).then(r => r.text()).then(svg => {
            const m = svg.match(/hits:\s*(\d+)/i);
            return m ? parseInt(m[1], 10) : 0;
        }).catch(() => 0) : Promise.resolve(0);

        const [devices, statsRows, hitCount] = await Promise.all([devPromise, statsRowPromise, hitsPromise]);

        if (Array.isArray(devices) && devices.length > 0) {
            activeUsers = devices.length;
        }

        let dbStats = { visitors: 516, downloads: 78 };
        if (Array.isArray(statsRows) && statsRows.length > 0 && statsRows[0].notes) {
            try {
                dbStats = JSON.parse(statsRows[0].notes);
            } catch (e) {}
        }

        let needsUpdate = false;
        if (isHit) {
            dbStats.visitors = (dbStats.visitors || 516) + 1;
            needsUpdate = true;
        }
        if (isDownload) {
            dbStats.downloads = (dbStats.downloads || 78) + 1;
            needsUpdate = true;
        }

        visitors = dbStats.visitors || 516;
        downloads = dbStats.downloads || 78;

        // Sekiranya servis kaunter awam (hits.sh) mempunyai kiraan tambahan, selaraskan kiraan
        if (hitCount > 0) {
            const calculatedFromHits = 516 + hitCount;
            if (calculatedFromHits > visitors) {
                visitors = calculatedFromHits;
                dbStats.visitors = visitors;
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
            externalCounter: hitCount > 0 ? `hits.sh (#${hitCount})` : 'online',
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        return res.status(200).json({
            activeUsers: 5,
            totalLicenses: 500,
            visitors: 518,
            downloads: 78,
            fallback: true
        });
    }
};
