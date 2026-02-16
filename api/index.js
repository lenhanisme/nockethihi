// api/index.js

// LƯU Ý: Đã xóa dòng 'import fetch...' vì Node.js trên Vercel tự có sẵn rồi.
// Giữ nguyên export default để Vercel hiểu đây là Serverless Function.

export default async function handler(req, res) {
    // 1. Cấu hình CORS (Giữ nguyên để web của bạn gọi được)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Xử lý Preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Chỉ nhận POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action, payload } = req.body;
    const TARGET_HOST = 'https://locket-gold-unlocker.vercel.app';
    let targetEndpoint = '';

    // Định tuyến sang server gốc
    switch (action) {
        case 'get-user-info': targetEndpoint = '/api/get-user-info'; break;
        case 'restore': targetEndpoint = '/api/restore'; break;
        case 'queue-status': targetEndpoint = '/api/queue/status'; break;
        default: return res.status(400).json({ error: 'Invalid Action' });
    }

    try {
        // Dùng fetch có sẵn của Node.js (không cần thư viện)
        const response = await fetch(`${TARGET_HOST}${targetEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Giả mạo Origin để server kia tưởng là chính nó gọi
                'Origin': TARGET_HOST,
                'Referer': `${TARGET_HOST}/`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return res.status(response.status).json(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        return res.status(500).json({ error: 'Lỗi kết nối Server gốc', details: error.message });
    }
}
