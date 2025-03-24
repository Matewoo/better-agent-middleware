const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // falls du Node < 18 nutzt
const app = express();

// Middleware-Konfiguration
app.use(cors({
  origin: 'https://localhost:3000', // Frontend-URL erlauben
  credentials: true
}));
app.use(express.json());

// Logger-Middleware für alle Anfragen
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Anfrage-Body:', JSON.stringify(req.body, null, 2));
  }
  
  next(); // Weiter zur nächsten Middleware
});

// POST /chat
app.post('/chat', async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: 'message und userId sind erforderlich' });
  }

  try {
    console.log('🚀 Sende Anfrage an n8n...');
    console.log('URL:', 'https://n8n.telc.net/webhook/c4a02416-3c18-4338-8b58-a0c4902b6fd7');
    console.log('Body:', JSON.stringify({ message, userId }));
    
    const response = await fetch('https://n8n.telc.net/webhook/c4a02416-3c18-4338-8b58-a0c4902b6fd7', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message, userId }),
    });
    
    console.log('💬 n8n Antwort-Status:', response.status);
    console.log('💬 n8n Antwort-Header:', Object.fromEntries([...response.headers.entries()]));
    
    const result = await response.json();
    console.log('💬 n8n Antwort-Body:', JSON.stringify(result, null, 2));
    
    // Sicherstellen, dass eine 'message' Eigenschaft existiert
    if (!result.message && result.response) {
      result.message = result.response;
    } else if (!result.message) {
      result.message = "Ich habe deine Nachricht erhalten.";
    }
    
    res.json(result);
  } catch (err) {
    console.error('❌ Fehler bei Anfrage an n8n:', err);
    console.error('❌ Fehlerdetails:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Fehler bei Verarbeitung der Anfrage' });
  }
});

// POST /proxy/chat (neuer Endpunkt für Frontend-Kompatibilität)
app.post('/proxy/chat', async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: 'message und userId sind erforderlich' });
  }

  try {
    console.log('🚀 Sende Anfrage an n8n...');
    console.log('URL:', 'https://n8n.telc.net/webhook/c4a02416-3c18-4338-8b58-a0c4902b6fd7');
    console.log('Body:', JSON.stringify({ message, userId }));
    
    const response = await fetch('https://n8n.telc.net/webhook/c4a02416-3c18-4338-8b58-a0c4902b6fd7', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message, userId }),
    });
    
    console.log('💬 n8n Antwort-Status:', response.status);
    console.log('💬 n8n Antwort-Header:', Object.fromEntries([...response.headers.entries()]));
    
    const result = await response.json();
    console.log('💬 n8n Antwort-Body:', JSON.stringify(result, null, 2));
    
    // Format umwandeln für Frontend-Kompatibilität
    const formattedResponse = {
      message: result.response || "Ich habe deine Nachricht erhalten.",
      ...result
    };
    
    res.json(formattedResponse);
  } catch (err) {
    console.error('❌ Fehler bei Anfrage an n8n:', err);
    console.error('❌ Fehlerdetails:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Fehler bei Verarbeitung der Anfrage' });
  }
});

// Server starten
app.listen(4000, () => {
  console.log('🧠 Middleware läuft auf http://localhost:4000');
});
