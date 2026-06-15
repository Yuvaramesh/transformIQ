import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult } from "@/types/documents";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzePdfWithClaude(
  pdfBase64: string,
  mediaType: "application/pdf" = "application/pdf"
): Promise<AnalysisResult> {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: `You are an expert project analyst. Please analyze this document and extract the following information in JSON format with three arrays:

1. "requirements": List of explicit and implicit requirements mentioned in the document
2. "risks": Potential risks, challenges, or issues mentioned or implied
3. "constraints": Limitations, restrictions, or constraints mentioned

Be thorough but concise. Focus on the most important points. Return ONLY valid JSON, no other text.

Example format:
{
  "requirements": ["requirement 1", "requirement 2"],
  "risks": ["risk 1", "risk 2"],
  "constraints": ["constraint 1", "constraint 2"]
}`,
          },
        ],
      },
    ],
  });

  // Extract the text content from the response
  const responseText = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  // Parse the JSON response
  try {
    const parsed = JSON.parse(responseText);
    return {
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
    };
  } catch {
    console.error("Failed to parse Claude response:", responseText);
    return {
      requirements: [],
      risks: [],
      constraints: [],
    };
  }
}
