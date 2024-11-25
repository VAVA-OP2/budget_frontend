import React, { useState } from "react";
import "../OpenAITestStyles.css"; // Uusi tyylitiedosto

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
    <div className="openai-container">
      <h1 className="openai-header">How can i help you today?</h1>
      <textarea
        className="openai-textarea"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
      />
      <button className="openai-button" onClick={callOpenAiFunction}>
        Submit
      </button>
      <div className="openai-response-box">
        <p className="openai-response-text">Response: {response}</p>
      </div>
    </div>
  );
};

export default OpenAITest;
