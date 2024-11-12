import React, { useState } from 'react';
import { supabase } from '/supabaseClient';

const OpenAITest = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const callOpenAiFunction = async () => {
    try {
      // Hanki käyttäjän JWT token käyttämällä uutta metodia
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error("User is not authenticated");
        return;
      }

      const res = await fetch("https://dnpaxqcwteagqgkixckn.supabase.co/functions/v1/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Lisää JWT token pyyntöön
        },
        body: JSON.stringify({ prompt })
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
