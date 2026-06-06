import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, imageBase64, imageMimeType } = body;

    if (!prompt && !imageBase64) {
      return NextResponse.json(
        { error: "Prompt or image is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    
    type ContentPart =
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } };

    const content: ContentPart[] = [];

    if (imageBase64 && imageMimeType) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${imageMimeType};base64,${imageBase64}`,
        },
      });
    }

    content.push({
      type: "text",
      text: prompt || "Describe this image and suggest relevant service providers.",
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "KKTC Service Finder",
      },
      body: JSON.stringify({
        // fallback chain — OpenRouter tries each in order on rate-limit/error
        models: [
          "nvidia/nemotron-nano-12b-v2-vl:free",
          "google/gemma-4-31b-it:free",
          "google/gemma-4-26b-a4b-it:free",
        ],
        route: "fallback",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for finding service providers in KKTC (Northern Cyprus). When given a description or image, suggest relevant service categories and providers. Be concise and practical.",
          },
          {
            role: "user",
            content,
          },
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error status:", response.status);
      console.error("OpenRouter error body:", err);
      return NextResponse.json(
        { error: "AI request failed", detail: err },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Search route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
