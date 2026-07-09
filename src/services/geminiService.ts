
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ExtractedData, QRAvailabilityStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeDocuments = async (base64Pdfs: string[]): Promise<ExtractedData> => {
  const model = 'gemini-3.5-flash';
  
  const fileParts = base64Pdfs.map(base64 => ({
    inlineData: { mimeType: "application/pdf", data: base64 }
  }));

  const systemPrompt = `
    You are an expert financial analyst. Analyze the provided financial documents and extract key strategic data.
    
    STRICT DIRECTIVES:
    1. USE ONLY THE PROVIDED DOCUMENTS. Do not use any external knowledge, web search results, or pre-trained data that isn't explicitly in these files.
    2. DO NOT MAKE ASSUMPTIONS. If a value or insight is not present in the documents, return "Data not available" or 0 for numeric fields.
    3. NO ESTIMATION. Do not "estimate" or "calculate" trends that are not explicitly stated in the text.
    
    CRITICAL INSTRUCTION FOR HEADLINE:
    Provide a punchy, one-sentence headline in the format "[Company]: [Key Insight/Performance Result]" based STRICTLY on the document content.
    Example: "[Company Name]: [Specific growth percentage or major event from report]".

    CRITICAL INSTRUCTION FOR EXECUTIVE INTELLIGENCE SUMMARY:
    Provide a professional, detailed paragraph summarizing the quarterly performance, margins, debt, and outlook as described ONLY in the report.

    CRITICAL INSTRUCTION FOR FINANCIAL DRIVERS:
    For Revenue, EBITDA, and PAT, you must derive 1 to 3 distinct performance reasons/points STRICTLY from different statements or sections found/available in the provided reports/documents only. Do not make any assumptions or use external knowledge. If a metric/value is missing in the documents, represent it as "Data not available%" or "0" / "N/A".
    
    You must provide multiple separate reasons if found in the report, formatted as a numbered list where each number represents an explaining statement found in the report. Each numbered statement must EXACTLY follow its respective format below:

    Format 1 (Revenue points):
    "1. Total Revenue [increased/decreased] by [X]% y-o-y and by [Y]% q-o-q to [Value] driven by [Reason statement 1 from report]."
    "2. Total Revenue [increased/decreased] by [X]% y-o-y and by [Y]% q-o-q to [Value] driven by [Reason statement 2 from report]." (if a second explainer is found)

    Format 2 (EBITDA points):
    "1. EBITDA [increased/decreased] [X]% y-o-y and [increased/decreased] by [Y]% q-o-q to reach at [Value] driven by [Reason statement 1 from report]."
    "2. EBITDA [increased/decreased] [X]% y-o-y and [increased/decreased] by [Y]% q-o-q to reach at [Value] driven by [Reason statement 2 from report]." (if a second explainer is found)

    Format 3 (PAT points):
    "1. PAT [increased/decreased] by [X]% y-o-y and [increased/decreased] by [Y]% q-o-q to reach at [Value] impacted by [Reason statement 1 from report]."
    "2. PAT [increased/decreased] by [X]% y-o-y and [increased/decreased] by [Y]% q-o-q to reach at [Value] impacted by [Reason statement 2 from report]." (if a second explainer is found)

    If multiple statements/insights explaining a driver are found, list up to 3 separate numbered reasons separated by newline characters. If only one explaining statement/insight is found, list only 1 reason (e.g. starting with "1. "). Keep all reasons separated by a standard newline.
    
    CRITICAL INSTRUCTION FOR CHART DATA:
    Extract the financial values for Revenue, EBITDA, and PAT for the available quarters specifically mentioned in the report. If exact quarterly historical numbers are not present in the tables or text, DO NOT estimate. Use only confirmed data points.

    Categories to extract into specific lists (STRICTLY FROM REPORT):
    1. Investments & Capex: Focus on capital expenditure targets and ongoing projects.
    2. Partnerships & JVs: Joint ventures and strategic partnerships.
    3. M&A & Expansions: Mergers, acquisitions, and regional expansions.
    4. Strategic Dev: Internal strategic shifts, debt management, or optimization.
    5. Future Plans: Forecasts, guidance, and upcoming major events.

    For items in these lists, extract:
    - title: Brief name of the point.
    - value: If a dollar/rupee amount is mentioned in the report (e.g., "$185bn").
    - details: 1-2 sentences explaining it based on the report.
    - impact: THE REPORTED OUTCOME OR SIGNIFICANCE as stated in the text.

    Ensure all information is fact-based and verified against the provided documents.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING, description: "Punchy headline: [Company]: [Key Insight]" },
      summary: { type: Type.STRING, description: "Detailed executive intelligence summary paragraph." },
      financials: {
        type: Type.OBJECT,
        properties: {
          revenue: { type: Type.STRING },
          ebitda: { type: Type.STRING },
          pat: { type: Type.STRING }
        },
        required: ["revenue", "ebitda", "pat"]
      },
      financialDrivers: {
        type: Type.OBJECT,
        properties: {
          revenue: { type: Type.STRING },
          ebitda: { type: Type.STRING },
          pat: { type: Type.STRING }
        },
        required: ["revenue", "ebitda", "pat"]
      },
      chartData: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            quarter: { type: Type.STRING },
            revenue: { type: Type.NUMBER },
            ebitda: { type: Type.NUMBER },
            pat: { type: Type.NUMBER }
          },
          required: ["quarter", "revenue", "ebitda", "pat"]
        }
      },
      investments_capex: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            value: { type: Type.STRING },
            details: { type: Type.STRING },
            impact: { type: Type.STRING }
          },
          required: ["title", "details"]
        }
      },
      partnerships_jvs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            details: { type: Type.STRING },
            impact: { type: Type.STRING }
          },
          required: ["title", "details"]
        }
      },
      mna_expansions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            details: { type: Type.STRING },
            impact: { type: Type.STRING }
          },
          required: ["title", "details"]
        }
      },
      strategic_dev: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            details: { type: Type.STRING },
            impact: { type: Type.STRING }
          },
          required: ["title", "details"]
        }
      },
      future_plans: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            details: { type: Type.STRING },
            impact: { type: Type.STRING }
          },
          required: ["title", "details"]
        }
      }
    },
    required: ["headline", "summary", "financials", "financialDrivers", "investments_capex", "partnerships_jvs", "mna_expansions", "strategic_dev", "future_plans"]
  };

  const result = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: "Extract strategic financial insights and specific performance drivers from these documents." },
        ...fileParts
      ]
    },
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema
    }
  });

  const text = result.text;
  if (!text) throw new Error("Gemini AI returned an empty response. This might be due to safety filters or a temporary service issue.");
  
  try {
    // Handle potential markdown wrapping
    const cleanJson = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanJson) as ExtractedData;
  } catch (e) {
    console.error("Gemini JSON Parse Error. Raw text:", text);
    throw new Error("Integrated intelligence failed to parse the document structure. Try a simpler or smaller PDF.");
  }
};

export const chatWithDocuments = async (base64Pdfs: string[], history: { role: string, text: string }[], message: string): Promise<string> => {
  const model = 'gemini-3.5-flash';
  
  const fileParts = base64Pdfs.map(base64 => ({
    inlineData: { mimeType: "application/pdf", data: base64 }
  }));

  const systemInstruction = `
    You are a helpful assistant analyzing specific financial documents uploaded by the user. 
    Answer the user's question based ONLY on the document content provided. 
    
    STRICT RULES:
    1. NO EXTERNAL INFORMATION: Do not use any outside knowledge. If the answer is not in the documents, say "I cannot find this information in the provided reports."
    2. NO ASSUMPTIONS: Do not guess or assume details. Only state what is explicitly written.
    3. NO ESTIMATION: If the user asks for figures or trends not in the report, state that they are missing.
    4. SOURCE-FOCUS: Always prioritize accuracy from the report over providing a helpful but potentially made-up answer.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        ...fileParts,
        ...history.map(h => ({ text: `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}` })),
        { text: `Current Question: ${message}` }
      ]
    },
    config: {
      systemInstruction
    }
  });

  return response.text || "I couldn't find a relevant answer in the provided documents.";
};

const searchTavily = async (query: string): Promise<string> => {
  const apiKey = process.env.TAVILY_API_KEY || "";
  if (!apiKey) {
    console.warn("Tavily API key is missing. Skipping web search.");
    return "No search results available (Tavily API key missing).";
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        include_answer: false,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily search API error: ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];
    
    if (results.length === 0) {
      return "No search results found.";
    }

    return results
      .map((r: any, index: number) => `[Result ${index + 1}]\nTitle: ${r.title}\nURL: ${r.url}\nContent: ${r.content}\n`)
      .join("\n");
  } catch (error) {
    console.error("Tavily Search Error:", error);
    return `Search failed: ${error instanceof Error ? error.message : String(error)}`;
  }
};

const qrAvailabilityCache = new Map<string, QRAvailabilityStatus>();

export const checkQRAvailability = async (company: string, period: string): Promise<QRAvailabilityStatus> => {
  const cacheKey = `${company.toLowerCase()}-${period.toLowerCase()}`;
  if (qrAvailabilityCache.has(cacheKey)) {
    return qrAvailabilityCache.get(cacheKey)!;
  }

  // Flash is more than sufficient for this check and has higher rate limits/lower quota impact
  const model = 'gemini-3.5-flash';

  const systemPrompt = `
    You are a high-precision financial intelligence agent. Your job is to verify if a specific Indian company has released its quarterly financial results/reports for a given period (e.g., Q3FY26) based ONLY on the provided web search results.

    WORKFLOW:
    1. Analyze the provided web search results for the target company and period.
    2. COMPANY SPECIFIC RECENT SOURCES AND LOGIC:
       - ONGC: https://ongcindia.com/web/eng/about-ongc/performance/financial/results (Look under yearly sections like FY-2025-26)
       - Oil India: https://www.oil-india.com/financial-results/34 (Look under 2025-2026, e.g., 'OIL Financial Results for Q1 FY 2025-26')
       - IOCL: http://iocl.com/pages/FinancialResults (Look for 'Unaudited Financial Results for Q1 (2025-26)')
       - BPCL: https://www.bharatpetroleum.in/bharat-petroleum-for/investors/disclosure-under-regulation-46-and-62-of-sebi-lodr-regulations/financial-performance/financial-results
       - HPCL: https://hindustanpetroleum.com/financial
       - GAIL: https://www.gailonline.com/IZFinancialResult.html
       - IGL: https://www.iglonline.net/financial
       - RIL: https://www.ril.com/investors/financial-reporting
       - MGL: https://www.mahanagargas.com/MGL-corporate/investors/financial-results/quarterly-result
       - Petronet: https://www.petronetlng.in/financials-pll
       - Gujarat Gas: https://www.gujaratgas.com/investors/investor-presentation/#
       - GSPL: https://gspcgroup.com/GSPL/quarterly-results
       - CESC: https://www.cesc.co.in/quarterlyResults
       - Tata Power: https://www.tatapower.com/investor-resource-center/quarterly-reports-tab
       - Adani Power: https://www.adanipower.com/investors/investor-downloads
       - Reliance Power: https://www.reliancepower.co.in/web/reliance-power/financial-results
       - Torrent Power: https://www.torrentpower.com/index.php/investors/financial?fy=2025-26
       - NTPC: https://ntpc.co.in/index.php/investors/financial-performance/financial-results
       - PGCIL: https://www.powergrid.in/en/annual-quarterly-results
       - JSW Energy: https://www.jswenergy.in/investors/energy/jsw-energy-fy-2025-26-financials-results
    3. FALLBACK: If not on company website, check BSE Corporate Announcements for the company's ticker.
       - ONGC (500312), Oil India (533106), IOC (530965), BPCL (500547), HPCL (500104), GAIL (532155), IGL (532514), RIL (500325), MGL (539957), Petronet (532522), Gujarat Gas (539336), GSPL (532702), CESC (500084), Tata Power (500400), Adani Power (533096), Reliance Power (532939), Torrent Power (532779), NTPC (532555), Power Grid (532898), JSW Energy (533148).
       - Search keywords: "Quarterly Results", "Unaudited Financial Results", "Financial Statements", "Investor Presentations".
    4. If found, identify the DIRECT PDF LINK or official news release page. If not found, check for an expected release date.

    Return ONLY a JSON object with this structure:
    {
      "status": "Available" | "Not Available" | "Coming Soon" | "Error",
      "expectedDate": "DD MMM YYYY or 'Released'",
      "sourceUrl": "The direct URL to the PDF filing or official announcement page found in the search results",
      "sourceTitle": "e.g., BSE Filing, NSE Announcement, Company Press Release",
      "summary": "One sentence summary of the status and any dividend declared."
    }
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING, enum: ["Available", "Not Available", "Coming Soon", "Error"] },
      expectedDate: { type: Type.STRING, description: "Expected release date if not yet available, or actual release date if available." },
      sourceUrl: { type: Type.STRING, description: "The most relevant URL found (e.g., BSE/NSE announcement)." },
      sourceTitle: { type: Type.STRING, description: "Title of the source." },
      summary: { type: Type.STRING, description: "A brief summary of the finding." }
    },
    required: ["status", "summary"]
  };

  try {
    // 1. Fetch search results from Tavily first
    const searchQuery = `Check quarterly report availability for ${company} for the period ${period} BSE announcements investor relations`;
    const searchResults = await searchTavily(searchQuery);

    // 2. Generate content using Gemini with search results in the prompt context
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{
          text: `Verify quarterly report availability for ${company} for the period ${period}.
          
          Here are the web search results retrieved for this query:
          ----------------------------------------
          ${searchResults}
          ----------------------------------------
          
          Analyze these search results carefully and output the appropriate JSON status response.`
        }]
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini AI for availability check.");
    
    // Handle potential markdown wrapping and robust parsing
    const cleanJson = text.replace(/```json\n?|```/g, "").trim();
    const result = JSON.parse(cleanJson) as QRAvailabilityStatus;
    
    qrAvailabilityCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("QR Availability Check Error:", error);
    throw error;
  }
};
