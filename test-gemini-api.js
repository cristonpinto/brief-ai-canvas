// Test if Gemini API key works
const API_KEY = "AIzaSyCKhIs-JJe4I9gz7SAlbyNBMa3105CnZcY";

async function testGemini() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say hello in one sentence." }] }],
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS! Gemini API is working:");
      console.log(data.candidates[0].content.parts[0].text);
    } else {
      console.error("❌ ERROR:", response.status);
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ FETCH ERROR:", error.message);
  }
}

testGemini();
