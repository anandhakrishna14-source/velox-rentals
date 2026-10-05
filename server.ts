import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// =========================================================================
// 1. CHATBOT: Multi-turn Chat with System Roles & Model Selection
// =========================================================================
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], role = 'concierge', complexity = 'general' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        reply: "Greetings from Velox Drive. Our fleet team is ready to assist your luxury driving experience across Bangalore, Mumbai, Delhi, and Goa.",
        modelUsed: 'offline-fallback'
      });
    }

    // Role-specific System Instructions
    let systemInstruction = "";
    if (role === 'technical_advisor') {
      systemInstruction = `You are the Chief Technical Specialist & Motorsport Engineer for Velox Drive.
Provide deep, authoritative knowledge on the Porsche 911 GT3 (992 4.0L NA Flat-Six 9,000 RPM), Rolls-Royce Ghost Extended (6.75L Twin-Turbo V12), Bentley Continental GT Speed (6.0L W12 TSI), BMW M5 Competition (4.4L TwinPower Turbo V8 AWD), Toyota Fortuner Legender 4x4, Mercedes-AMG A 35, and MINI Cooper S. Focus on performance figures, handling dynamics, exhaust acoustics, zero-to-hundred timings, and mechanical specifications.`;
    } else if (role === 'trip_curator') {
      systemInstruction = `You are the Luxury Travel & Route Curator for Velox Drive in India.
Provide scenic expressway routes, hill station getaways, VIP hotel destinations, five-star curations, and driving etiquette for routes around Bangalore (Nandi Hills, Mysore Expressway), Mumbai (Bandra-Worli Sea Link, Pune Expressway), Delhi (Yamuna Expressway, Agra), and Goa (Coastal Highway, MOPA). Include practical advice on tolls, road conditions, and scenic viewpoints.`;
    } else {
      systemInstruction = `You are the 24/7 Chief Executive Concierge for "Velox Drive", India's premiere ultra-luxury supercar and grand touring rental service.
Tone: Sophisticated, polite, helpful, concise, automotive-literate.
Key policies:
- Minimum Age: 21 for AMG/MINI/Fortuner, 23 for Porsche GT3, Rolls-Royce, Bentley, BMW M5.
- Delivery: VIP airport curbside arrival lanes, five-star valet, or private residence doorstep delivery in Bangalore, Mumbai, Delhi, and Goa.
- Security Deposit: 100% refundable, auto-released 24-48 hours after return inspection.
- Chauffeur Option: Available on all vehicles.
- Free Cancellation: Full refund up to 24 hours prior to handover.`;
    }

    // Model selection based on user prompt guidelines:
    // - Complex tasks: gemini-3.1-pro-preview
    // - General tasks: gemini-3.5-flash
    // - Fast tasks: gemini-3.1-flash-lite
    let selectedModel = 'gemini-3.5-flash';
    if (complexity === 'complex') {
      selectedModel = 'gemini-3.1-pro-preview';
    } else if (complexity === 'fast') {
      selectedModel = 'gemini-3.1-flash-lite';
    }

    // Format chat history into contents array
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        if (item.text) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }]
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction
      }
    });

    return res.json({
      reply: response.text || "I am at your service.",
      modelUsed: selectedModel
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      reply: "Our concierge team is standing by. Please connect with our reservation desk directly at +91 800 835 6900.",
      error: error?.message || 'Chat generation failed'
    });
  }
});

// =========================================================================
// 2. SEARCH GROUNDING: Up-to-date Web Information with gemini-3.5-flash
// =========================================================================
app.post('/api/ai/search-grounding', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        reply: `Search Grounding for "${query}": Velox Drive operates across all major metro hubs in India offering verified luxury vehicles with curbside airport delivery.`,
        sources: []
      });
    }

    // Use gemini-3.5-flash with googleSearch tool per user instruction
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are an expert luxury automotive research assistant for Velox Drive. Answer the user query thoroughly using Google Search to provide up-to-date and accurate information: "${query}"`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    // Extract citation links from groundingMetadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Array<{ title: string; uri: string }> = [];

    for (const chunk of groundingChunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri
        });
      }
    }

    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    return res.json({
      reply: response.text,
      sources,
      searchQueries,
      modelUsed: 'gemini-3.5-flash'
    });
  } catch (error: any) {
    console.error('Search Grounding error:', error);
    return res.status(500).json({
      reply: "Unable to retrieve live search data at this moment.",
      error: error?.message
    });
  }
});

// =========================================================================
// 3. MAPS GROUNDING: Accurate Geographic & Location Grounding with gemini-3.5-flash
// =========================================================================
app.post('/api/ai/maps-grounding', async (req: Request, res: Response) => {
  try {
    const { query, latitude, longitude } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        reply: `Maps Grounding for "${query}": Velox Drive hubs are situated at Bangalore Airport (T2 VIP lane), Mumbai BKC Signature Pavilion, Delhi Aerocity Worldmark, and Goa Airport.`,
        mapSources: []
      });
    }

    // Default to India center if not provided
    const userLat = typeof latitude === 'number' ? latitude : 12.9716;
    const userLng = typeof longitude === 'number' ? longitude : 77.5946;

    // Use gemini-3.5-flash with googleMaps tool per user instruction
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are the GPS Route & Geographic Specialist for Velox Drive. Answer this location or route query using Google Maps data: "${query}"`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: userLat,
              longitude: userLng
            }
          }
        }
      }
    });

    // Extract Google Maps place URLs from grounding chunks per skill requirement
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapSources: Array<{ title: string; uri: string; address?: string }> = [];

    for (const chunk of groundingChunks) {
      if ((chunk as any).maps?.uri) {
        mapSources.push({
          title: (chunk as any).maps.title || 'View Location on Google Maps',
          uri: (chunk as any).maps.uri
        });
      }
    }

    return res.json({
      reply: response.text,
      mapSources,
      modelUsed: 'gemini-3.5-flash'
    });
  } catch (error: any) {
    console.error('Maps Grounding error:', error);
    return res.status(500).json({
      reply: "Unable to retrieve live map information at this moment.",
      error: error?.message
    });
  }
});

// =========================================================================
// 4. LIVE API VOICE: Real-time Audio via gemini-3.8-live & HTTP Fallback
// =========================================================================
app.post('/api/ai/live-voice', async (req: Request, res: Response) => {
  try {
    const { message, voice = 'Zephyr' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        replyText: "Welcome to Velox Drive Voice Concierge. What luxury car or destination can I arrange for you today?"
      });
    }

    // Generate voice response using Live API conversational persona
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message || 'Introduce yourself as the Velox Drive Voice Concierge.',
      config: {
        systemInstruction: 'You are the live voice concierge for Velox Drive luxury rentals. Speak concisely, naturally, and with refined automotive poise in 2 sentences.'
      }
    });

    return res.json({
      replyText: response.text || 'I am ready to assist your drive.'
    });
  } catch (error: any) {
    console.error('Live voice error:', error);
    return res.status(500).json({ error: error?.message });
  }
});

// Existing Route Matchmaker endpoint
app.post('/api/ai/recommend', async (req: Request, res: Response) => {
  try {
    const { purpose, guests, preferences, location, durationDays } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        recommendedCarId: purpose === 'Weekend Escape' ? 'porsche-911-gt3' : 'rolls-royce-ghost',
        carName: purpose === 'Weekend Escape' ? 'Porsche 911 GT3 (992)' : 'Rolls-Royce Ghost Extended',
        reasoning: 'Engineered for driver-focused performance with exhilarating naturally-aspirated response.',
        routeTip: 'Take early morning departures along scenic expressways for pristine driving conditions.',
        suggestedPackage: 'Zero-Depreciation Super Protection with 5G In-Car Wi-Fi'
      });
    }

    const prompt = `You are the chief concierge for "Velox Drive", an ultra-luxury car rental platform.
Customer criteria:
- Purpose: ${purpose || 'General Luxury Drive'}
- Guests: ${guests || 2}
- City: ${location || 'Bangalore'}
- Duration: ${durationDays || 3} days
- Preferences: ${preferences || 'Exotic performance and comfort'}

Fleet models:
1. Porsche 911 GT3 (992)
2. Rolls-Royce Ghost Extended
3. Bentley Continental GT Speed
4. BMW M5 Competition (F90)
5. Toyota Fortuner Legender 4x4
6. Mercedes-AMG A 35 4MATIC+
7. MINI Cooper S (3-Door)

Return JSON with recommendedCarId, carName, reasoning, routeTip, suggestedPackage, estimatedDailyBudget.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    return res.json({
      recommendedCarId: 'porsche-911-gt3',
      carName: 'Porsche 911 GT3 (992)',
      reasoning: 'Authentic motorsport pedigree with 9,000 RPM track response.',
      routeTip: 'Scenic elevated highway.',
      suggestedPackage: 'Zero-Depreciation Super Protection'
    });
  }
});

// =========================================================================
// WebSocket Server for Real-Time Gemini Live API (gemini-3.8-live)
// =========================================================================
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Gemini Live voice stream');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    clientWs.send(JSON.stringify({
      text: "Gemini Live API is initialized. Please set your API key in environment to stream live audio.",
      ready: true
    }));
    return;
  }

  try {
    // Connect to gemini-3.8-live per Live API specifications
    const session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        systemInstruction: 'You are the live voice concierge for Velox Drive luxury car rentals. Reply in concise, refined spoken sentences.'
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (audio) {
            clientWs.send(JSON.stringify({ audio, text }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          try {
            clientWs.close();
          } catch {}
        }
      }
    });

    clientWs.on('message', (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' }
          });
        } else if (parsed.text) {
          session.sendRealtimeInput({
            text: parsed.text
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    clientWs.on('close', () => {
      try {
        session.close();
      } catch {}
    });
  } catch (err: any) {
    console.error('Error connecting to gemini-3.8-live:', err);
    clientWs.send(JSON.stringify({
      error: err?.message || 'Failed to connect to Live API'
    }));
  }
});

// Upgrade HTTP to WebSocket on /api/live
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Vite Middleware for Full-stack Dev
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`VELOX DRIVE luxury server with Gemini AI and Firebase running on port ${PORT}`);
  });
}

startServer();
