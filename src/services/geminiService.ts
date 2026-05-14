import { GoogleGenAI, Type } from "@google/genai";
import { TradeAnalysis } from "../types";


// Intelligence extracted to analyzeTradeScreenshot

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    symbol: {
      type: Type.STRING,
      description: "The trading symbol, e.g., MNQ, MGC, BTCUSD.",
    },
    side: {
      type: Type.STRING,
      enum: ["Long", "Short", "Neutral"],
      description: "The direction of the trade based on labels or chart orientation.",
    },
    levels: {
      type: Type.OBJECT,
      properties: {
        entry: { type: Type.NUMBER, description: "The entry price level." },
        stopLoss: { type: Type.NUMBER, description: "The stop loss price level." },
        takeProfit: { type: Type.NUMBER, description: "The take profit price level." },
      },
      required: ["entry", "stopLoss", "takeProfit"],
    },
    timestamp: {
      type: Type.STRING,
      description: "Date and Time from the chart's x-axis in YYYY-MM-DD HH:mm format.",
    },
    fiboTarget: {
      type: Type.STRING,
      description: "The highest or lowest Fibonacci level reached or targeted.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score from 0 to 1.",
    },
  },
  required: ["symbol", "side", "levels", "timestamp", "fiboTarget"],
};

export async function analyzeTradeScreenshot(base64Image: string, customApiKey?: string): Promise<TradeAnalysis> {
  try {
    const key = customApiKey;
    if (!key) {
      throw new Error("Gemini API Key missing. Go to SYSTEM -> Bring Your Own Intelligence to configure your node.");
    }
    const ai = new GoogleGenAI({ apiKey: key });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              text: `Analyze this TradingView screenshot for a professional trade dashboard. 
              Extract the symbol, side (Long/Short), trade levels (Entry, SL, TP), 
              the EXACT timestamp visible on the chart (usually on the x-axis or at the bottom right corner). 
              Convert it to YYYY-MM-DD HH:mm format. 
              If the chart is in GMT+7 (common for this user), ensure the time is extracted exactly as shown.
              Also extract any visible Fibonacci targets. 
              Return the data as structured JSON.`
            },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image.split(",")[1] || base64Image,
              },
            },
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA as any,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as TradeAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
