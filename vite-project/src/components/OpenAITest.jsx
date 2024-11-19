import React, { useState } from "react";

const OpenAITest = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const callOpenAiFunction = async () => {
    try {
      const functionUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL;

      const res = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }), // Lähetä vain syöte
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to call OpenAI function");
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
