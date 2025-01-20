import React, { useState } from "react";
import axios from "axios";

const ChatBot = () => {
  const [messages, setMessages] = useState([]); // To store chat messages
  const [input, setInput] = useState(""); // To handle user input
  const [loading, setLoading] = useState(false); // Loading state for bot response

  // Function to handle sending a message
  const sendMessage = async () => {
    if (!input.trim()) return; // Prevent empty messages

    // Add user's message to chat
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear the input field
    setLoading(true); // Show typing indicator

    try {
      // Sending the user's message to the Google Gemini API
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyB40g0ziMwaXfomrOzcY9M56YNyhiRMsmQ`,
        {
          contents: [
            {
              parts: [{ text: input }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check the API response structure and extract bot's reply
      console.log("API Response:", response.data); // Log full response for debugging
      const botMessageText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (botMessageText) {
        const botMessage = { sender: "bot", text: botMessageText };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Handle unexpected response structure
        const errorMessage = {
          sender: "bot",
          text: "Sorry, I couldn't get a valid response from the API. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I couldn't process your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false); // Hide typing indicator
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        maxWidth: "400px",
        margin: "auto",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "0",
        backgroundColor: "#fdfdfd",
        fontFamily: "'Poppins', sans-serif",
        boxShadow: "0px 4px 12px rgba(88, 27, 255, 0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          padding: "1rem 0",
          backgroundColor: "#fff4f2", // Light pink background
        }}
      >
        <h3
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            color: "#333",
            gap: "0.5rem",
          }}
        >
          <img
            src="48.png" // Replace with your actual image path or URL
            alt="AI Chat Bot Icon"
            style={{
              width: "32px", // Adjust size for better visibility
              height: "32px",
            }}
          />
          AI Chat Bot
        </h3>
        <span
          style={{
            fontSize: "0.9rem",
            color: "#777",
            display: "block",
            marginTop: "0.5rem",
          }}
        >
          Model
        </span>
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.25rem 0.5rem",
            backgroundColor: "#fff",
            borderRadius: "16px",
            border: "1px solid #ddd",
            display: "inline-block",
            fontSize: "1rem",
            fontWeight: "500",
            color: "#333",
          }}
        >
          Google Gemini 2.0
        </div>
      </div>

      {/* Chat Messages Area */}
<div
  style={{
    flex: 1,
    overflowY: "auto", // Scrollable messages
    padding: "1rem",
  }}
>
  {messages.map((msg, index) => (
    <div
      key={index}
      style={{
        display: "flex",
        justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
        marginBottom: "1rem",
      }}
    >
      {msg.sender !== "user" && (
        <img
          src="129.png"
          style={{
            width: "30px",
            height: "30px",
            marginRight: "10px",
          }}
        />
      )}
      <div
        style={{
          maxWidth: "70%",
          padding: "0.75rem 1rem",
          borderRadius: "20px",
          backgroundColor:
            msg.sender === "user" ? "var(--message-bg-user)" : "var(--message-bg-bot)",
          color: msg.sender === "user" ? "#fff" : "#000",
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span>{msg.text}</span>
      </div>
    </div>
  ))}

  {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              maxWidth: "70%",
              padding: "0.75rem 1rem",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start", // Align spinner to the left
            }}
          >
            <div
              style={{
                border: "4px solid rgba(5, 91, 204, 0.6)",
                borderTop: "4px solid #fff",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                animation: "spin 3s linear infinite",
                marginRight: "10px",
              }}
            />
          </div>
        </div>
      )}
  </div>

      {/* Input Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderTop: "1px solid #ddd",
          backgroundColor: "#fff",
          borderRadius: "0 0 10px 10px",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your message..."
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "1px solid #ddd",
            borderRadius: "20px",
            outline: "none",
            fontSize: "0.9rem",
            marginRight: "0.5rem",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            backgroundColor: "var(--primary-color)",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            padding: "0.5rem 1rem",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;