import React, { useState } from "react";
import { supabase } from "/supabaseClient";

const OpenAITest = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const callOpenAiFunction = async () => {
    try {
      const res = await fetch("https://dnpaxqcwteagqgkixckn.supabase.co/functions/v1/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGF4cWN3dGVhZ3Fna2l4Y2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzIyMjcsImV4cCI6MjA0MTAwODIyN30.XZKW19p0GiuaqFhEf-sCRrv1CtNFDqPU5a6bOABxoVc`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to call OpenAI function");
      }

      const data = await res.json();
      setResponse(data.result);
    } catch (error) {
      console.error("Error calling OpenAI function:", error);
      setResponse("Error calling OpenAI function");
    }
  };

  return (
    <div>
      <h1>Test OpenAI Function</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
      />
      <button onClick={callOpenAiFunction}>Submit</button>
      <p>Response: {response}</p>
    </div>
  );
};

export default OpenAITest;
