import React, { useState, useEffect } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import chatbotAnimation from "../assets/chatbot.json";

const ChatBot = () => {
  const EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on initial render
    const savedData = localStorage.getItem("chatMessagesWithTimestamp");
    if (savedData) {
      const { messages, timestamp } = JSON.parse(savedData);
      const now = Date.now();

      // Check if the saved messages have expired
      if (now - timestamp < EXPIRATION_TIME) {
        return messages; // Messages are still valid
      } else {
        localStorage.removeItem("chatMessagesWithTimestamp"); // Remove expired messages
      }
    }
    return []; // Default to empty array if no valid saved data
  });

  const [input, setInput] = useState(""); // To handle user input
  const [loading, setLoading] = useState(false); // Loading state for bot response

  // Save messages to localStorage whenever they change
  useEffect(() => {
    const dataToSave = {
      messages,
      timestamp: Date.now(), // Save the current time with the messages
    };
    localStorage.setItem("chatMessagesWithTimestamp", JSON.stringify(dataToSave));
  }, [messages]);

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
            backgroundColor: "#fff4f2",
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
            {/* Lottie Animation */}
        <div
          style={{
            width: "32px", // Match the previous icon size
            height: "32px",
          }}
        >
          <Lottie animationData={chatbotAnimation} loop={true} />
        </div>
        <span>Botrix</span>
        {/* Version Number (1.0) */}
          <span
            style={{
              fontSize: "0.8rem", // Smaller text
              opacity: 0.6, // Reduced opacity
              alignSelf: "flex-end", // Align with the baseline of "Botrix"
              marginBottom: "0.7rem", // Adjust vertical alignment
            }}
          >
            1.1.2
          </span>
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
            Google Gemini 1.5 Flash
          </div>
        </div>

      {/* Chat Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
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
                  alt="Bot Avatar"
                  style={{
                    width: "25px", // Slightly smaller avatar
                    height: "25px",
                    marginRight: "10px",
                  }}
                />
              )}
              <div
                style={{
                  maxWidth: "70%",
                  padding: "0.5rem 0.75rem", // Smaller padding
                  borderRadius: "15px", // Slightly less rounded
                  backgroundColor:
                    msg.sender === "user"
                      ? "var(--message-bg-user)"
                      : "var(--message-bg-bot)",
                  color: msg.sender === "user" ? "#fff" : "#000",
                  fontSize: "0.9rem", // Reduced font size
                  lineHeight: "1.2", // Compact line spacing
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
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
                  padding: "0.5rem 0.75rem", // Match smaller padding
                  borderRadius: "15px",
                }}
              >
                <div
                  style={{
                    border: "3px solid rgba(65, 111, 170, 0.6)", // Slightly smaller border
                    borderTop: "3px solid #fff",
                    width: "18px", // Smaller spinner size
                    height: "18px",
                    borderRadius: "50%",
                    animation: "spin 1.5s linear infinite", // Faster spin
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
          backgroundColor: "#fff4f2",
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
          onClick={loading ? () => {} : sendMessage} // Disable functionality when loading
          style={{
            backgroundColor: "var(--primary-color)", // Use your primary color
            border: "none",
            borderRadius: "50%", // Circular button
            padding: "0.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px", // Set a fixed width and height
            height: "40px",
          }}
          disabled={loading} // Disable the button when loading
        >
          {loading ? (
            // "Stop" Icon SVG for loading state
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="white" // White stroke for the icon
              style={{
                width: "20px",
                height: "20px",
              }}
            >
              <rect
                x="6"
                y="6"
                width="12"
                height="12"
                rx="2" // Rounded corners for the stop square
              />
            </svg>
          ) : (
            // "Send" Icon SVG for normal state
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="white" // White stroke for the icon
              style={{
                width: "20px",
                height: "20px",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5l15-7.5-15-7.5v6l10.5 1.5-10.5 1.5v6z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
