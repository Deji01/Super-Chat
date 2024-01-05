"use client";

import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthComponent() {
  const supabase = createClientComponentClient();

  const handleLoginWithGithub = () =>
    supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: location.origin + "/auth/callback",        
      },
    });
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <div className="w-96 border shadow-sm p-5 rounded-sm">
        <h1 className="font-bold text-lg">{"Welcome to SuperChat AI"}</h1>
        <p className="text-sm mt-1">
          {`Unlock the Power of Intelligent Conversations. 
            
            Superchat AI is your gateway to a new era of dynamic and insightful conversations. 
            Elevate your chat experience with our cutting-edge platform that seamlessly combines 
            Next.js, Supabase, and a powerful language model.
            `}
        </p>
        <Button className="mt-4 flex" onClick={handleLoginWithGithub}>
          <GitHubLogoIcon className="mr-2 w-4 h-4" /> Login with Github
        </Button>
      </div>
    </div>
  );
}
