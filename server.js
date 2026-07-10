const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// XOR encryption/decryption
function xorTransform(data, key) {
    const keyBytes = Buffer.from(key, 'utf8');
    const result = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }
    return result;
}

// Config
const DECRYPT_KEY = 'kyo_remote_module_key_v1';
const CONFIG_PATH = path.join(__dirname, 'ad-config.json');
const DEX_DIR = path.join(__dirname, 'dex');

// Serve config JSON
app.get('/ad-config.json', (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        
        // Replace placeholder with actual DEX URL
        const host = req.get('host') || 'localhost:3000';
        const protocol = req.protocol || 'http';
        config.dex_url = `${protocol}://${host}/dex/remote_module.dex`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.send(JSON.stringify(config));
    } catch (err) {
        res.status(500).json({ error: 'Config not found' });
    }
});

// Serve encrypted DEX
app.get('/dex/:filename', (req, res) => {
    const filePath = path.join(DEX_DIR, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'DEX not found' });
    }
    
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(500).json({ error: 'DEX transfer failed' });
        }
    });
});

// Versioned DEX endpoints
app.get('/v1.0/remote_module.dex', (req, res) => {
    const filePath = path.join(DEX_DIR, 'v1.0', 'remote_module.dex');
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Version not found' });
    }
    res.sendFile(filePath);
});

app.get('/v1.5/remote_module.dex', (req, res) => {
    const filePath = path.join(DEX_DIR, 'v1.5', 'remote_module.dex');
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Version not found' });
    }
    res.sendFile(filePath);
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        dex_available: fs.existsSync(path.join(DEX_DIR, 'remote_module.dex')),
        config_available: fs.existsSync(CONFIG_PATH)
    });
});

// Admin: Upload new DEX (simple password protection)
app.post('/admin/upload', (req, res) => {
    const password = req.body.password;
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In production, use proper file upload handling
    res.json({ message: 'Upload endpoint (implement file upload middleware)' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Config: http://localhost:${PORT}/ad-config.json`);
    console.log(`DEX: http://localhost:${PORT}/dex/remote_module.dex`);
});
