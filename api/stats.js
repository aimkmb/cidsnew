module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    try {
        const SUPABASE_URL = "https://sennodrfmsijorfcnrud.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbm5vZHJmbXNpam9yZmNucnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3MzY2NiwiZXhwIjoyMDk5NzQ5NjY2fQ.a2Ocfy4OQ-nPaEDeyzI9slDFzyT8OwFtz403G8uFcAY";

        const response = await fetch(`${SUPABASE_URL}/rest/v1/license_devices?select=id`, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) {
            return res.status(200).json({ activeUsers: 5, totalLicenses: 500 });
        }

        const devices = await response.json();
        const count = Array.isArray(devices) ? devices.length : 5;

        return res.status(200).json({
            activeUsers: count,
            totalLicenses: 500,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        return res.status(200).json({
            activeUsers: 5,
            totalLicenses: 500,
            fallback: true
        });
    }
};
