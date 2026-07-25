export async function solveDoubt(imageBase64) {
  try {
    const response = await fetch('/api/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", errorData);
      throw new Error(errorData.error || "Server error while processing image");
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error("Error calling serverless function:", error);
    throw new Error("समझने में परेशानी हुई। कृपया दूसरी फ़ोटो खींचें। (Failed to connect to backend)");
  }
}
