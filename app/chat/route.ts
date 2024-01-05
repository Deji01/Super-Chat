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

  const {prompt} = await req.json();

  try{
    const res = await openai.completions.create({
    prompt,
    model: "text-davinci-003",
    max_tokens: 512, 
    temperature: 0
})

return NextResponse.json({ choices: res.choices}, {status: 200})
}catch {
    return NextResponse.json({
        message: "Unable to get completions from LLM."
    }, {status: 400})
}
}