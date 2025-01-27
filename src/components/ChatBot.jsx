import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import chatbotAnimation from "../assets/chatbot.json";

const ChatBot = () => {
  const EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

  const [messages, setMessages] = useState(() => {
    const savedData = localStorage.getItem("chatMessagesWithTimestamp");
    if (savedData) {
      const { messages, timestamp } = JSON.parse(savedData);
      const now = Date.now();
      if (now - timestamp < EXPIRATION_TIME) {
        return messages;
      } else {
        localStorage.removeItem("chatMessagesWithTimestamp");
      }
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // To track the currently selected image
  const fileInputRef = useRef(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    const dataToSave = {
      messages,
      timestamp: Date.now(),
    };
    localStorage.setItem("chatMessagesWithTimestamp", JSON.stringify(dataToSave));
  }, [messages]);

  // Function to handle file upload
  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(file);
        setAttachmentPreview(reader.result); // Store Base64 string
      };
      reader.readAsDataURL(file); // Convert file to Base64
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
        attachment: attachmentPreview, // Store Base64 string
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

  // Function to handle viewing an image
  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Function to close the image view
  const closeImage = () => {
    setSelectedImage(null);
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
          <div
            style={{
              width: "32px",
              height: "32px",
            }}
          >
            <Lottie animationData={chatbotAnimation} loop={true} />
          </div>
          <span>Botrix</span>
          <span
            style={{
              fontSize: "0.8rem",
              opacity: 0.6,
              alignSelf: "flex-end",
              marginBottom: "0.7rem",
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
                  width: "25px",
                  height: "25px",
                  marginRight: "10px",
                }}
              />
            )}
            <div
              style={{
                maxWidth: "70%",
                padding: msg.text ? "0.5rem 0.75rem" : "0",
                borderRadius: msg.text ? "15px" : "0",
                backgroundColor: msg.text
                  ? msg.sender === "user"
                    ? "var(--message-bg-user)"
                    : "var(--message-bg-bot)"
                  : "transparent",
                color: msg.sender === "user" ? "#fff" : "#000",
                fontSize: "0.9rem",
                lineHeight: "1.2",
                boxShadow: msg.text ? "0px 2px 4px rgba(0, 0, 0, 0.1)" : "none",
              }}
            >
              {msg.attachment && (
                <div>
                  <img
                    src={msg.attachment}
                    alt="Attachment"
                    style={{
                      maxWidth: "100%",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewImage(msg.attachment)}
                  />
                </div>
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
                padding: "0.5rem 0.75rem",
                borderRadius: "15px",
              }}
            >
              <div
                style={{
                  border: "3px solid rgba(65, 111, 170, 0.6)",
                  borderTop: "3px solid #fff",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  animation: "spin 1.5s linear infinite",
                  marginRight: "10px",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <img
            src={selectedImage}
            alt="Selected Attachment"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "10px",
            }}
          />
          <button
            onClick={closeImage}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            &times;
          </button>
        </div>
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
          accept="image/*"
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
                width="16px"
                height="16px"
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
          onClick={loading ? () => {} : sendMessage}
          style={{
            backgroundColor: "var(--primary-color)",
            border: "none",
            borderRadius: "50%",
            padding: "0.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
          }}
          disabled={loading}
        >
          {loading ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="white"
              style={{
                width: "20px",
                height: "20px",
              }}
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="white"
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