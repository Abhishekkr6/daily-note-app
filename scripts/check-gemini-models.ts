
// Usage: npx tsx scripts/check-gemini-models.ts

import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
}

const key = process.env.GEMINI_API_KEY;

if (!key) {
    console.error("❌ No GEMINI_API_KEY found in .env.local");
    process.exit(1);
}

async function listModels() {
    console.log("🔍 Fetching available Gemini models...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", data.error.message);
            return;
        }

        if (data.models) {
            console.log("\n✅ AVAILABLE MODELS:");
            data.models.forEach((m: any) => {
                // Filter for 'generateContent' supported models
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
            console.log("\n(Please pick one of the above for your code)");
        } else {
            console.log("⚠️ No specific models returned.", data);
        }

    } catch (error) {
        console.error("❌ Network Error:", error);
    }
}

listModels();
