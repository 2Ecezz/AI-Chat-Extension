import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import chatbotAnimation from "../assets/chatbot.json";
import Lightbox from "react-image-lightbox"; // Import the lightbox component
import "react-image-lightbox/style.css"; // Import the lightbox styles

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
  const [attachment, setAttachment] = useState(null); // To store the uploaded file
  const [attachmentPreview, setAttachmentPreview] = useState(null); // To store the image preview URL
  const [isImageOpen, setIsImageOpen] = useState(false); // To control the lightbox
  const [selectedImage, setSelectedImage] = useState(""); // To store the selected image URL
  const fileInputRef = useRef(null); // Ref for the file input element

  // Save messages to localStorage whenever they change
  useEffect(() => {
    const dataToSave = {
      messages,
      timestamp: Date.now(), // Save the current time with the messages
    };
    localStorage.setItem("chatMessagesWithTimestamp", JSON.stringify(dataToSave));
  }, [messages]);

  // Function to handle file upload
  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      setAttachmentPreview(URL.createObjectURL(file)); // Create a preview URL for the image
    }
  };

  // Function to clear the attachment and preview
  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  // Function to handle sending a message
  const sendMessage = async () => {
    if (!input.trim() && !attachment) return; // Prevent empty messages

    // Add user's image message to chat (if attachment exists)
    if (attachment) {
      const imageMessage = {
        sender: "user",
        attachment: URL.createObjectURL(attachment), // Store file URL
      };
      setMessages((prev) => [...prev, imageMessage]);
    }

    // Add user's text message to chat (if input exists)
    if (input.trim()) {
      const textMessage = {
        sender: "user",
        text: input,
      };
      setMessages((prev) => [...prev, textMessage]);
    }

    setInput(""); // Clear the input field
    setAttachment(null); // Clear the attachment
    setAttachmentPreview(null); // Clear the attachment preview
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

  // Function to open the image in a lightbox
  const openImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageOpen(true);
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
                padding: msg.text ? "0.5rem 0.75rem" : "0", // Only add padding for text messages
                borderRadius: msg.text ? "15px" : "0", // Only add border radius for text messages
                backgroundColor: msg.text
                  ? msg.sender === "user"
                    ? "var(--message-bg-user)"
                    : "var(--message-bg-bot)"
                  : "transparent", // No background for image messages
                color: msg.sender === "user" ? "#fff" : "#000",
                fontSize: "0.9rem", // Reduced font size
                lineHeight: "1.2", // Compact line spacing
                boxShadow: msg.text ? "0px 2px 4px rgba(0, 0, 0, 0.1)" : "none", // Only add shadow for text messages
              }}
            >
              {msg.attachment && (
                <img
                  src={msg.attachment}
                  alt="Attachment"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "10px",
                    cursor: "pointer", // Add pointer cursor to indicate clickability
                  }}
                  onClick={() => openImage(msg.attachment)} // Open the image in a lightbox
                />
              )}
              {msg.text && <span>{msg.text}</span>}
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

      {/* Lightbox for Image Zoom */}
      {isImageOpen && (
        <Lightbox
          mainSrc={selectedImage}
          onCloseRequest={() => setIsImageOpen(false)}
        />
      )}

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
        {/* Attachment Button */}
        <button
          onClick={() => fileInputRef.current.click()}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            marginRight: "0.5rem",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            style={{
              width: "24px",
              height: "24px",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
            />
          </svg>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleAttachment}
          accept="image/*" // Restrict to image files
        />

        {/* Image Preview */}
        {attachmentPreview && (
          <div
            style={{
              position: "relative",
              marginRight: "0.5rem",
            }}
          >
            <img
              src={attachmentPreview}
              alt="Attachment Preview"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <button
              onClick={clearAttachment}
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                backgroundColor: "#f2f0f0",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="black"
                width="16px" // Increased from 12px to 16px
                height="16px" // Increased from 12px to 16px
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        )}

        {/* Text Input */}
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

        {/* Send Button */}
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