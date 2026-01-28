
require('dotenv').config({ path: '.env.local' });

async function testRawGenerate() {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-2.5-flash"; // Trying the model found in list
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log("Testing Raw Generate Content with 2.5-flash...");

    const payload = {
        contents: [{ parts: [{ text: "Classify this: Buy milk" }] }]
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
            console.error("Response:", await res.text());
        } else {
            const data = await res.json();
            console.log("Success! Response:", JSON.stringify(data.candidates?.[0]?.content?.parts?.[0]?.text));
        }
    } catch (e) {
        console.error("Fetch Exception:", e);
    }
}

testRawGenerate();
