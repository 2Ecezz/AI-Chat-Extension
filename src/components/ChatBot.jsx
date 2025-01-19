import React, { useState } from "react";
import axios from "axios";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Adding user message to chat
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput(""); // Clear input field
    setLoading(true); // Set loading to true

    try {
      // Send message to Google Gemini API
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyB40g0ziMwaXfomrOzcY9M56YNyhiRMsmQ`, // Use your actual API key here
        {
          contents: [
            {
              parts: [{ text: input }], // The user's input as 'text'
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Log the entire response to inspect its structure
      console.log("API Response:", response.data);

      // Now, accessing the correct structure based on the response you showed
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0] &&
        response.data.candidates[0].content.parts[0].text
      ) {
        const botMessage = {
          sender: "bot",
          text: response.data.candidates[0].content.parts[0].text.trim(), // Correctly access the text content
        };
        setMessages((prev) => [...prev, botMessage]); // Update messages with bot's reply
      } else {
        // If the expected content is not found, show a more descriptive error
        console.log("No valid 'text' found in the response.");
        const errorMessage = {
          sender: "bot",
          text: "Sorry, I couldn't get a response from the API. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]); // Show error message if no valid response
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I couldn't process your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]); // Show error message
    }

    setLoading(false); // Set loading to false
  };

  return (
    <div
      style={{
        fontFamily: "'Arial', sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        maxWidth: "600px",
        margin: "auto",
        padding: "1rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.05)",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "0.75rem",
                borderRadius: "8px",
                backgroundColor: msg.sender === "user" ? "#4caf50" : "#e0e0e0",
                color: msg.sender === "user" ? "#fff" : "#000",
                textAlign: msg.sender === "user" ? "right" : "left",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "0.75rem",
                borderRadius: "8px",
                backgroundColor: "#e0e0e0",
                color: "#000",
              }}
            >
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div
        style={{
          display: "flex",
          marginTop: "1rem",
          borderTop: "1px solid #ddd",
          paddingTop: "1rem",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginRight: "0.5rem",
            outline: "none",
            fontSize: "1rem",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            cursor: "pointer",
            fontSize: "1rem",
          }}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
