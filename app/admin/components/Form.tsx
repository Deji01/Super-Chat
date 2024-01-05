"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import React, { useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Form() {
  const inputRef = useRef() as React.MutableRefObject<HTMLTextAreaElement>;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toastError = (description: string) => {
    toast({
      title: "OOps! Something went wrong.",
      description,
      variant: "destructive",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  const handleSubmit = async () => {
    const supabase = createClientComponentClient();

    const content = inputRef.current.value;

    if (content && content.trim()) {
      setLoading(true);

      const res = await fetch(location.origin + "/embedding", {
        method: "POST",
        body: JSON.stringify({ text: content.replace(/\n/g, "") }),
      });

      if (res.status !== 200) {
        toastError("Unable to create embedding.");
      } else {

        const result = await res.json();
        const embedding = result.embedding;
        const token = result.token;

        const { error } = await supabase
          .from("documents")
          .insert({ content, embedding, token });

        if (error) {
          toastError("Unable to store content and embedding on the database.");
        } else {
          alert("Success");
          inputRef.current.value = "";
        }
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Textarea
        placeholder="Paste your text here or start typing..."
        className="h-96"
        ref={inputRef}
      />
      <Button onSubmit={handleSubmit} className="flex gap-2">
        {loading && (
          <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
        )}
        Submit
      </Button>
    </>
  );
}
