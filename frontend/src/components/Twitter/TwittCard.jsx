import { useState, useContext } from "react";
import moment from "moment";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  SquareArrowOutUpRight,
  Search,
} from "lucide-react";

import TwitterMessage from "./TwitterMessage";
import { translateText } from "../../services/generalApi";
import { DashboardContext } from "../../contexts/DashboardContext";
import { updateTweetStatus, deleteTweet } from "../../services/twitterApi";

import "../../css/Twitter/TwittCard.css";

const convertTimestampToDate = (ts) => moment(ts).format("LLL");

function TwittContent({
  twitt,
  showActions,
  isChained = false,
  uiDeleteTwitt,
  currentStatus,
  toggleSelection,
  selected,
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { filters, updateFilter } = useContext(DashboardContext);
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslated, setIsTranslated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (imageSrc) => {
    setModalImage(imageSrc);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImage("");
  };

  const handleSaveTwitt = () => {
    updateTweetStatus(twitt.tweet_id, 1).then(uiDeleteTwitt(twitt.tweet_id));
  };

  const handleDownloadTwitt = () => {
    alert(`Downloading tweet - ${twitt.tweet_id}`); //TODO
  };

  const handleDeleteTwitt = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteTweet(twitt._id);
    uiDeleteTwitt(twitt.tweet_id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const isVideo = (media) => {
    return media.includes(".mp4");
  };

  const handleAddFilterKeyword = (keyword) => {
    if (!filters.keywords.includes(keyword)) {
      const updatedKeywords = [...filters.keywords, keyword];
      updateFilter("keywords", updatedKeywords);
    }
  };

  const handleTranslate = async () => {
    setIsLoading(true);
    try {
      if (!translatedText) {
        const translated = await translateText(twitt.text);
        setTranslatedText(translated);
      }
      setIsTranslated(true);
    } catch (error) {
      console.error("Error translating text: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOriginalText = async () => {
    setIsTranslated(false);
  };

  const isHebrew = (text) => {
    // Regex to check if the text contains Hebrew characters
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
  };

  return (
    <div className={`twitt-card ${isChained ? "chained" : ""}`}>
      <div className="twitt-card-content">
        <div className="profile-header">
          <img
            className="profile-image"
            src={twitt.user.profile_image_url}
            alt="Profile picture"
          />
          <div className="profile-info">
            <p className="username">{twitt.user.name}</p>
            <p className="handle">@{twitt.user.username}</p>
          </div>
          {showActions && (
            <>
              {currentStatus === 1 && (
                <button
                  className="delete-button"
                  onClick={handleDeleteTwitt}
                  title="Delete tweet"
                >
                  <Trash2 size={16} />
                </button>
              )}
              {currentStatus !== 1 && (
                <input
                  type="checkbox"
                  className="select-button"
                  checked={selected}
                  onChange={() => toggleSelection(twitt._id)}
                />
              )}
            </>
          )}
        </div>
        {twitt.keyword && (
          <div className="twitt-keyword">
            <span
              className="keyword-value"
              title="Search keyword"
              onClick={() => handleAddFilterKeyword(twitt.keyword)}
            >
              <Search size={14} className="keyword-icon" />
              {twitt.keyword}
            </span>
          </div>
        )}
        {twitt.text && (
          <p className="twitt-text">
            {isTranslated ? (
              <TwitterMessage text={translatedText} />
            ) : (
              <TwitterMessage text={twitt.text} keyword={twitt.keyword} />
            )}
          </p>
        )}
        {!isHebrew(twitt.text) && twitt.text !== "" && !isTranslated && (
          <button className="translate-button" onClick={handleTranslate}>
            {isLoading ? <div className="spinner"></div> : "Translate"}
          </button>
        )}
        {isTranslated && (
          <button className="translate-button" onClick={handleOriginalText}>
            Original Text
          </button>
        )}
        <div className="twitt-media">
          {twitt.media &&
            twitt.media.map((mediaLink, index) =>
              isVideo(mediaLink) ? (
                <video
                  key={index}
                  width="100%"
                  controls
                  className="media-preview"
                >
                  <source src={mediaLink} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  key={index}
                  className="media-preview"
                  src={mediaLink}
                  alt={`twitt media ${index}`}
                  onClick={() => openModal(mediaLink)}
                />
              )
            )}
        </div>
        <div className="tweet-buttom-section">
          <p className="timestamp">
            {convertTimestampToDate(twitt.created_at * 1000)}
          </p>
          <a
            href={`https://twitter.com/${twitt.user.username}/status/${twitt.tweet_id}`} // Link to the tweet's URL
            target="_blank"
            rel="noopener noreferrer"
            className="tweet-link-button"
            title="Open Tweet"
          >
            <SquareArrowOutUpRight size={18} />
          </a>
        </div>
        {twitt.retweet && Object.keys(twitt.retweet).length > 0 && (
          <div className="retwitts">
            <TwittContent
              key={twitt.retweet.twitt_id}
              twitt={twitt.retweet}
              showActions={false}
              isChained={true}
              currentStatus={currentStatus}
              toggleSelection={toggleSelection}
              selected={selected}
            />
          </div>
        )}
        {showActions && (
          <div className="action-buttons">
            {(currentStatus === 0 || currentStatus === 2) && (
              <>
                <button
                  className="action-button save"
                  onClick={() => handleSaveTwitt()}
                >
                  Add to watchlist
                </button>
              </>
            )}
            {currentStatus === 1 && (
              <>
                <button
                  className="action-button download"
                  onClick={() => handleDownloadTwitt()}
                >
                  Download Tweet
                </button>
              </>
            )}
          </div>
        )}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
            <div className="delete-confirm-popup">
              <p>Are you sure you want to delete this tweet?</p>
              <div className="delete-confirm-actions">
                <button onClick={handleConfirmDelete}>Delete</button>
                <button onClick={handleCancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content-box">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <img
              src={modalImage}
              alt="Enlarged twitt media"
              className="modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TwittCard({ twitt, uiDeleteTwitt, toggleSelection, selected }) {
  const { currentStatus } = useContext(DashboardContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (twitt.conversation.length) {
    // chained twitt
    return (
      <div className="twitt-chain">
        <TwittContent // parent tweet
          twitt={twitt}
          showActions={true}
          uiDeleteTwitt={uiDeleteTwitt}
          currentStatus={currentStatus}
          toggleSelection={toggleSelection}
          selected={selected}
        />
        <button className="chain-toggle" onClick={toggleExpand}>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
          {isExpanded ? "Hide" : "Show"} {twitt.conversation.length} chained{" "}
          {twitt.conversation.length === 1 ? "twitt" : "twitts"}
        </button>
        {isExpanded && (
          <div className="chained-twitts">
            {twitt.conversation.map((chainedTwitt, index) => (
              <TwittContent
                key={chainedTwitt._id}
                twitt={chainedTwitt}
                showActions={false}
                isChained={true}
                uiDeleteTwitt={uiDeleteTwitt}
                currentStatus={currentStatus}
                toggleSelection={toggleSelection}
                selected={selected}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else {
    //normal twitt
    return (
      <TwittContent
        twitt={twitt}
        showActions={true}
        uiDeleteTwitt={uiDeleteTwitt}
        currentStatus={currentStatus}
        toggleSelection={toggleSelection}
        selected={selected}
      />
    );
  }
}

export default TwittCard;
