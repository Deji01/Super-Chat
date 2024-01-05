import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export async function POST(req: Request) {
  const isAuthorized = cookies().get("supabase-auth-token");

  if (!isAuthorized) {
    return NextResponse.json(
      {
        message: "Unauthorized user.",
      },
      { status: 403 }
    );
  }

  const request = await req.json();

  if (!request?.text) {
    return NextResponse.json(
      {
        message: "Invalid request",
      },
      { status: 422 }
    );
  }
  try {
    const result = await openai.embeddings.create({
      input: request.text,
      model: "text-embedding-ada-002",
    });

    const embedding = result.data[0].embedding;
    const token = result.usage.total_tokens;

    return NextResponse.json({
      token,
      embedding,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to generate embedding.",
      },
      { status: 422 }
    );
  }
}
