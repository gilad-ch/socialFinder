import React from "react";

const formatText = (twitt) => {
  const text = twitt.text;
  const keyword = twitt.keyword;

  // Split the text by newline and process each line
  return text.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line.split(" ").map((word, wordIndex) => {
        // Check if the word is a mention, hashtag, or keyword
        const isKeyword = word.includes(keyword);

        // Return the word with styling if it's a mention, hashtag, or keyword
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
      <br /> {/* Preserve line breaks */}
    </React.Fragment>
  ));
};

const TwitterMessage = ({ twitt }) => {
  const message = twitt.text;
  // Count the number of English words in the message
  const englishWordCount = message
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
      {formatText(twitt)}
    </div>
  );
};

export default TwitterMessage;
