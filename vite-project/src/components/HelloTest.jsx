import React, { useState } from "react";

const HelloTest = () => {
  const [message, setMessage] = useState("");

  const callHelloFunction = async () => {
    try {
      const res = await fetch("https://dnpaxqcwteagqgkixckn.supabase.co/functions/v1/hello", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGF4cWN3dGVhZ3Fna2l4Y2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzIyMjcsImV4cCI6MjA0MTAwODIyN30.XZKW19p0GiuaqFhEf-sCRrv1CtNFDqPU5a6bOABxoVc`, // Replace YOUR_ANON_KEY with your actual Supabase Anon Key
        },
      });
  
      if (!res.ok) {
        throw new Error("Failed to call Hello function");
      }
  
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error calling Hello function:", error);
      setMessage("Error calling Hello function");
    }
  };
  

  return (
    <div>
      <h1>Test Hello Function</h1>
      <button onClick={callHelloFunction}>Call Hello Function</button>
      <p>Response: {message}</p>
    </div>
  );
};

export default HelloTest;
