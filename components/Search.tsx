"use client";

import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AiFillRobot, AiOutlineLoading } from "react-icons/ai";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "./ui/toast";
import { oneLine, stripIndent } from "common-tags";

export default function Search() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const { toast } = useToast();
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toastError = (description: string) => {
    toast({
      title: "OOps! Something went wrong.",
      description,
      variant: "destructive",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleSearch = async () => {
    const searchText = inputRef.current.value;

    setLoading(true);
    if (searchText && searchText.trim()) {
      setQuestions((currentQuestion) => [...currentQuestion, searchText]);
      const res = await fetch(location.origin + "/embedding", {
        method: "POST",
        body: JSON.stringify({ text: searchText.replace(/\n/g, "") }),
      });
      if (res.status !== 200) {
        toastError("Unable to create embedding");
      } else {
        const data = await res.json();
        const { data: documents } = await supabase.rpc("match_documents", {
          query_embedding: data.embedding,
          match_threshold: 0.8,
          match_count: 10,
        });

        let tokenCount = 0;
        let contextText = "";

        for (let i = 0; i < documents.length; i++) {
          const document = documents[i];
          const content = document.content;
          tokenCount += document.token;

          if (tokenCount > 1500) {
            break;
          }
          contextText += `${content.trim()}\n--\n`;
        }
        if (contextText) {
          const prompt = generatePrompt(contextText, searchText);
          await generateAnswer(prompt);
        } else {
          setAnswers((currentAnswer) => [
            ...currentAnswer,
            "Sorry there is no context related  to this question. Kindly provide more information.",
          ]);
        }
      }
    }
    inputRef.current.value = "";
    setLoading(false);
  };

  const generateAnswer = async (prompt: string) => {
    const res = await fetch(location.origin + "/chat", {
      method: "POST",
      body: JSON.stringify({ text: prompt.replace(/\n/g, "") }),
    });

    if (res.status !== 200) {
      toastError("Unable to generate response.");
    } else {
      const data = await res.json();
      setAnswers((currentAnswer) => [...currentAnswer, data.choices[0].text]);
    }
  };
  const generatePrompt = (contextText: string, searchText: string) => {
    const prompt = stripIndent`${oneLine`
    You are a very enthusiastic Supabase representative who loves
    to help people! Given the following sections from the Supabase
    documentation, answer the question using only that information,
    outputted in markdown format. If you are unsure and the answer
    is not explicitly written in the documentation, say
    "Sorry, I don't know how to help with that."`}

    Context sections:
    ${contextText}

    Question: """
    ${searchText}
    """

    Answer as markdown (including related code snippets if available):
  `;
    return prompt;
  };
  return (
    <>
      <div className="flex-1 h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <ChatBubbleIcon className="w-5 h-5" />
            <h1>SuperChat AI</h1>
          </div>
          <Button onClick={handleLogout}>Logout</Button>
        </div>

        {questions.map((question, index) => {
          const answer = answers[index];
          const isLoading = loading && !answer; // Fix variable name here
          return (
            <div className="space-y-3" key={index}>
              <div className="flex items-center gap-2 text-indigo-600">
                <AiFillRobot />
                <h2>{question}</h2>
              </div>
              {isLoading ? (
                <AiOutlineLoading className="animate-spin" />
              ) : (
                <p>{answer}</p>
              )}
            </div>
          );
        })}
      </div>
      <Input
        placeholder="Ask SuperChat AI a question"
        className="p-5"
        ref={inputRef}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
    </>
  );
}
