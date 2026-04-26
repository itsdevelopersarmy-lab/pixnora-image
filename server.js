import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import QRCode from "qrcode";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb+srv://itsnexverra_db_user:J2ie2HjBEMwMZr5B@cluster0.nazgm1s.mongodb.net/?appName=Cluster0";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const UPI_VPA = process.env.UPI_VPA || 'kumarprashant514-3@okaxis';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
  const db = client.db("genora");

  const usersColl = db.collection("users");
  const sessionsColl = db.collection("sessions");
  const nodesColl = db.collection("nodes");
  const settingsColl = db.collection("settings");

  // Bootstrap initial settings if empty
  const initialSettingsCount = await settingsColl.countDocuments();
  if (initialSettingsCount === 0) {
    const defaultSettings = {
      offerPrice: 20000,
      originalPrice: 45000,
      countdownDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      isOfferActive: true
    };
    await settingsColl.insertOne(defaultSettings);
    console.log("Bootstrapped initial settings");
  }

  // Bootstrap initial nodes if empty
  const initialNodesCount = await nodesColl.countDocuments();
  if (initialNodesCount === 0) {
    const defaultNodes = [
      {
        id: '1',
        name: 'PIXEL FORGE (AI IMAGE GENERATION)',
        type: 'IMAGE',
        cost: 49999,
        oldPrice: 74999,
        discount: 33,
        isFree: false,
        apiKey: 'ak_0000000000f997b4c86dee7b9e59392400',
        endpointUrl: 'https://digital-pixnora-ai.up.railway.app/pixnora/api/v2/generate/async-fa86903a',
        modality: 'NEXORA',
        description: 'Elite neural synthesis engine optimized for ultra-high-resolution photorealistic imagery and cinematic textures.',
        isPublished: true,
        imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4638d9980?auto=format&fit=crop&q=80&w=400',
        curlTemplate: `curl -X POST "https://digital-pixnora-ai.up.railway.app/pixnora/api/v2/generate/async-fa86903a" \
-H "Content-Type: application/json" \
-H "apikey: ak_0000000000f997b4c86dee7b9e59392400" \
-d '{
  "prompt": "Ultra extreme high detail of [SUBJECT], centered composition, subject in middle, perfectly symmetrical framing, tight close-up portrait, extreme close-up, face fills the frame, camera focused on face, sharp focus on eyes, eyes in perfect focus, facial features highly detailed, skin texture clearly visible, ultra sharp facial details, minimal background blur, macro detail, DSLR photography, 200mm macro lens, f/1.8, shallow depth of field, cinematic depth, hyper realistic, photorealistic, ultra high detail, extremely detailed, 8K resolution, HDR, global illumination, volumetric lighting, cinematic lighting, masterpiece, best quality, intricate textures, micro details, high frequency details, ultra detailed skin, realistic skin texture, visible skin pores, pores, fine lines, natural imperfections, subsurface scattering, RAW photo",
  "negative_prompt": "zoomed out, wide shot, full body, face not visible, hidden face, unfocused face, blurry face, soft focus on face, out of focus eyes, off-center, cropped subject, out of frame, multiple subjects, asymmetrical, tilted composition, side composition, smooth skin, plastic skin, airbrushed, cartoon, CGI, low detail skin, waxy face, low resolution, noise, grain",
  "params": {
    "sampler_name": "DPM++ 3M SDE Karras",
    "seed": -1,
    "width": 768,
    "height": 1344,
    "hires_fix": false,
    "steps": 45,
    "cfg_scale": 8,
    "dslr": "6x",
    "upscale": "8x",
    "karras": true,
    "samplers": [
      "euler_a",
      "dpmpp_3m_karras"
    ],
    "clip_skip": 0.75,
    "base_model": "JuggernautXL",
    "refiner_model": "JuggernautXL Refiner",
    "refiner_switch_at": "8x"
  },
  "models": [
    "RealVisXL",
    "Epic Realism",
    "JuggernautXL"
  ],
  "extra_source_images": []
}'`
      },
      {
        id: '2',
        name: 'DREAM FORGE IMAGE',
        type: 'IMAGE',
        cost: 999,
        oldPrice: 1999,
        discount: 50,
        isFree: false,
        apiKey: 'ak_0000000000f997b4c86dee7b9e59392400',
        endpointUrl: 'https://digital-pixnora-ai.up.railway.app/pixnora/api/v2/generate/async-fa86903a',
        modality: 'NEXORA',
        description: 'Advanced RAW recovery and noise reconstruction node, designed for extracting maximum frequency details from noisy prompts.',
        isPublished: true,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
        curlTemplate: `curl -X POST "https://digital-pixnora-ai.up.railway.app/pixnora/api/v2/generate/async-fa86903a" \
-H "Content-Type: application/json" \
-H "apikey: ak_0000000000f997b4c86dee7b9e59392400" \
-d '{
  "prompt": "Ultra high-end RAW photo recovery...",
  "params": {
    "sampler_name": "DPM++ 3M SDE Karras",
    "seed": -1,
    "width": 768,
    "height": 1344,
    "hires_fix": false,
    "steps": 45,
    "cfg_scale": 8,
    "dslr": "6x",
    "upscale": "8x",
    "karras": true,
    "samplers": [
      "euler_a",
      "dpmpp_3m_karras"
    ],
    "clip_skip": 0.75,
    "base_model": "JuggernautXL",
    "refiner_model": "JuggernautXL Refiner",
    "refiner_switch_at": "8x"
  },
  "models": [
    "JuggernautXL"
  ],
  "extra_source_images": []
}'`
      },
      {
        id: '3',
        name: 'GENORA ELITE MODELS',
        type: 'IMAGE',
        cost: 1499,
        oldPrice: 2999,
        discount: 50,
        isFree: false,
        apiKey: 'ak_0000000000f997b4c86dee7b9e59392400',
        endpointUrl: 'https://digital-pixnora-ai.up.railway.app/pixnora/api/v2/generate/async-fa86903a',
        modality: 'NEXORA',
        description: 'Atmospheric depth and volumetric lighting expert. Specializes in realistic full-body portraits and complex interior lighting.',
        isPublished: true,
        imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=400',
        curlTemplate: `curl -X POST "https://digital-pixnora-ai.up.railway.app/pixnora/api/v2/generate/async-fa86903a" \
-H "Content-Type: application/json" \
-H "apikey: ak_0000000000f997b4c86dee7b9e59392400" \
-d '{
  "prompt": "Ultra-realistic full-body portrait of a real person, highly detailed, cinematic photography, sharp focus, 8K resolution",
  "negative_prompt": "worst quality, low quality, blurry",
  "steps": 190,
  "models": [
    "JuggernautXL"
  ],
  "width": 512,
  "height": 512,
  "seed": 748289
}'`
      },
      {
        id: '4',
        name: 'STABLE FLUX ELITE',
        type: 'IMAGE',
        cost: 199,
        oldPrice: 399,
        discount: 50,
        isFree: false,
        apiKey: '0000000000',
        endpointUrl: 'https://stablehorde.net/api/v2/generate/async',
        modality: 'NEXORA',
        description: 'High-speed flux diffusion node optimized for rapid prototyping and iterative creative workflows.',
        isPublished: true,
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400',
        curlTemplate: `curl -X POST "https://stablehorde.net/api/v2/generate/async" \
-H "Content-Type: application/json" \
-H "apikey: 0000000000" \
-d '{
  "prompt": "Cinematic sci-fi environment, high detail, unreal engine 5, 8k",
  "n": 1,
  "steps": 50,
  "width": 512,
  "height": 512
}'`
      }
    ];
    await nodesColl.insertMany(defaultNodes);
    console.log("Bootstrapped initial nodes");
  }

  // Bootstrap demo users if they don't exist
  const demoUsers = [
    { 
      email: 'admin@genora.ai', 
      password: 'admin123', 
      role: 'admin', 
      displayName: 'Root Admin',
      walletBalance: 1000,
      subscriptionTier: "PRO",
      transactions: [],
      createdAt: new Date()
    },
    { 
      email: 'user@genora.ai', 
      password: 'user123', 
      role: 'user', 
      displayName: 'Demo User',
      walletBalance: 10,
      subscriptionTier: "FREE",
      transactions: [],
      createdAt: new Date()
    }
  ];

  for (const demoUser of demoUsers) {
    const exists = await usersColl.findOne({ email: demoUser.email });
    if (!exists) {
      await usersColl.insertOne(demoUser);
      console.log(`Bootstrapped demo user: ${demoUser.email}`);
    }
  }

  // API Routes
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await usersColl.findOne({ email, password });
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, displayName, role } = req.body;
    const existing = await usersColl.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    const newUser = {
      email,
      password,
      displayName,
      role,
      walletBalance: 10,
      subscriptionTier: "FREE",
      transactions: [{
        id: `TX-INIT-${Date.now()}`,
        type: 'Onboarding Bonus',
        amount: 10,
        timestamp: new Date(),
        status: 'success'
      }],
      createdAt: new Date()
    };
    await usersColl.insertOne(newUser);
    res.json({ success: true, user: newUser });
  });

  app.get("/api/user/:email", async (req, res) => {
    const user = await usersColl.findOne({ email: req.params.email });
    res.json(user);
  });

  app.put("/api/user/:email", async (req, res) => {
    const { walletBalance, subscriptionTier, transactions } = req.body;
    await usersColl.updateOne(
      { email: req.params.email },
      { $set: { walletBalance, subscriptionTier, transactions } }
    );
    res.json({ success: true });
  });

  app.get("/api/sessions/:email", async (req, res) => {
    const sessions = await sessionsColl.find({ userEmail: req.params.email }).toArray();
    res.json(sessions);
  });

  app.post("/api/sessions/:email", async (req, res) => {
    const { sessions } = req.body;
    await sessionsColl.deleteMany({ userEmail: req.params.email });
    if (sessions && sessions.length > 0) {
      await sessionsColl.insertMany(sessions.map((s) => {
        const { _id, ...rest } = s;
        return { ...rest, userEmail: req.params.email };
      }));
    }
    res.json({ success: true });
  });

  // Node Management Routes
  app.get("/api/nodes", async (req, res) => {
    const nodes = await nodesColl.find({}).toArray();
    res.json(nodes);
  });

  app.post("/api/generate-qr", async (req, res) => {
    try {
      const { amount, name, vpa } = req.body;
      const targetVpa = vpa || UPI_VPA;
      const targetName = name || 'Genora AI';
      const targetAmount = Number(amount).toFixed(2);
      
      console.log('Generating QR for:', { amount: targetAmount, name: targetName, vpa: targetVpa });

      // Local standard UPI URI generation is the most reliable method
      // Format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR
      const upiUri = `upi://pay?pa=${targetVpa}&pn=${encodeURIComponent(targetName)}&am=${targetAmount}&cu=INR&tn=GenoraPayment`;
      
      // We generate the QR locally on the server
      const qrDataUrl = await QRCode.toDataURL(upiUri, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 400,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      return res.json({ 
        success: true, 
        qrData: qrDataUrl,
        method: 'local',
        uri: upiUri 
      });

    } catch (error) {
      console.error("QR Generation Error:", error.message);
      res.status(500).json({ success: false, message: "Standard QR Generation failed locally" });
    }
  });

  app.post("/api/nodes", async (req, res) => {
    const nodes = req.body;
    await nodesColl.deleteMany({});
    if (nodes && nodes.length > 0) {
      await nodesColl.insertMany(nodes.map(({ _id, ...rest }) => rest));
    }
    res.json({ success: true });
  });

  // Settings Routes
  app.get("/api/settings", async (req, res) => {
    const settings = await settingsColl.findOne({});
    res.json(settings);
  });

  app.post("/api/settings", async (req, res) => {
    const settings = req.body;
    const { _id, ...rest } = settings;
    await settingsColl.updateOne({}, { $set: rest }, { upsert: true });
    res.json({ success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
