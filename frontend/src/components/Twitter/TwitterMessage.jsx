import React from "react";
import Linkify from "linkify-react";
const linkifyOptions = {
  render: ({ attributes, content }) => (
    <a
      {...attributes}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "var(--primary-dark)", // Default color
        textDecoration: "none",
        fontWeight: "bold",
        transition: "color 0.2s ease-in-out", // Smooth hover effect
      }}
      onMouseEnter={(e) => (e.target.style.color = "var(--primary)")} // Hover color
      onMouseLeave={(e) => (e.target.style.color = "var(--primary-dark)")} // Reset color
    >
      {content}
    </a>
  ),
};

const formatText = (text, keyword = null) => {
  // Split the text by newline and process each line
  return text.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      <Linkify options={linkifyOptions}>
        {line.split(" ").map((word, wordIndex) => {
          // Check if the word is a keyword
          const isKeyword = word.includes(keyword);

          // Return the word with styling keyword
          if (isKeyword) {
            return (
              <span
                key={wordIndex}
                style={{
                  direction: "ltr",
                  color: isKeyword ? "rgb(255, 255, 255)" : "rgb(29, 155, 240)", // Use keyword color or default
                  fontWeight: isKeyword ? "bold" : "normal", // Bold the keyword
                  textDecoration: "none",
                }}
              >
                {word}{" "}
              </span>
            );
          }

          // Default rendering for normal words
          return (
            <span key={wordIndex} style={{ direction: "ltr" }}>
              {word}{" "}
            </span>
          );
        })}
        <br />
      </Linkify>
    </React.Fragment>
  ));
};

const TwitterMessage = ({ text, keyword = null }) => {
  // Count the number of English words in the message
  const englishWordCount = text
    .split(" ")
    .filter((word) => /[a-zA-Z]/.test(word)).length;

  // Set the direction to "ltr" if there are more than 3 English words, otherwise "rtl"
  const isEnglish = englishWordCount > 1;

  return (
    <div
      style={{
        textAlign: "start",
        direction: isEnglish ? "ltr" : "rtl", // Set direction based on language
        color: "rgb(231, 233, 234)",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 10,
        WebkitBoxOrient: "vertical",
      }}
    >
      {formatText(text, keyword)}
    </div>
  );
};

export default TwitterMessage;
