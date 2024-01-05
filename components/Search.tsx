"use client";

import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AiFillRobot } from "react-icons/ai";

export default function Search() {
  return (
    <>
      <div className="flex-1 h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <ChatBubbleIcon className="w-5 h-5" />
            <h1>SuperChat AI</h1>
          </div>
          <Button >Logout</Button>
        </div>
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600">
                <AiFillRobot />
                <h2>How to setup superbase with next JS</h2>
            </div>
            <p>This is the answer.</p>
        </div>
      </div>
      <Input placeholder="Ask SuperChat AI a question" className="p-5  " />
    </>
  );
}
