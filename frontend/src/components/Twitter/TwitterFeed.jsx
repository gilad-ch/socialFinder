import React, { useContext, useState, useEffect } from "react";
import { DashboardContext } from "../../contexts/DashboardContext";
import { ClipLoader } from "react-spinners";
import InfiniteScroll from "react-infinite-scroll-component";
import TwittCard from "./TwittCard";
import { fetchTwitts } from "../../services/twitterApi";
import FilterChips from "./FilterChips";
import "../../css/Twitter/TwitterFeed.css";

function TwitterFeed() {
  const { currentStatus, filters } = useContext(DashboardContext); // Combine useContext calls
  const [twitts, setTweets] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedTweets, setSelectedTweets] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch tweets when currentStatus changes
  useEffect(() => {
    setLoading(true);
    fetchTwitts(currentStatus, null, filters.keywords, filters.username)
      .then((tweets) => {
        setTweets(tweets);
        setHasMore(tweets.length >= 10); // Check if there are more tweets
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentStatus, filters]);

  // Remove a tweet from the UI
  const handleUIDeleteTwitt = (tweet_id) => {
    setTweets((prevTwitts) =>
      prevTwitts.filter((twitt) => twitt.tweet_id !== tweet_id)
    );
  };

  // Fetch more tweets for infinite scroll
  const fetchMoreTwitts = async () => {
    if (twitts.length > 0) {
      const lastTweetDate = twitts[twitts.length - 1].created_at;
      fetchTwitts(
        currentStatus,
        lastTweetDate,
        filters.keywords,
        filters.username
      ).then((newTweets) => {
        setTweets((prevTwitts) => [...prevTwitts, ...newTweets]);
        if (newTweets.length < 10) {
          setHasMore(false);
        }
      });
    }
  };

  const toggleSelection = (tweet_id) => {
    setSelectedTweets((prev) => {
      const newSelection = new Set(prev);
      newSelection.has(tweet_id)
        ? newSelection.delete(tweet_id)
        : newSelection.add(tweet_id);
      return newSelection;
    });
  };

  const handleBulkDelete = () => {
    setTweets((prevTwitts) =>
      prevTwitts.filter((twitt) => !selectedTweets.has(twitt.tweet_id))
    );
    setSelectedTweets(new Set()); // Clear selection after deletion
  };

  return (
    <div className="twitter-feed-container">
      {filters.keywords && filters.keywords.length > 0 && <FilterChips />}
      {loading ? (
        <div className="spinner-container-center">
          <ClipLoader color="#3b82f6" loading={true} size={50} />
        </div>
      ) : (
        <InfiniteScroll
          scrollableTarget="main-content"
          dataLength={twitts.length}
          next={fetchMoreTwitts}
          hasMore={hasMore}
          loader={
            <div className="spinner-container">
              <ClipLoader color="#3b82f6" loading={true} size={30} />
            </div>
          }
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>No more Tweets</b>
            </p>
          }
        >
          <div className="twitter-feed">
            {twitts.map((twitt) => (
              <TwittCard
                key={twitt._id}
                twitt={twitt}
                uiDeleteTwitt={handleUIDeleteTwitt}
                toggleSelection={toggleSelection}
                selected={selectedTweets.has(twitt.tweet_id)}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
      <button
        className="bulk-delete-btn"
        onClick={() => {
          setShowDeleteConfirm(true);
        }}
      >
        Delete Selected ({selectedTweets.size})
      </button>
      {showDeleteConfirm && (
        <div
          className="delete-confirm-overlay"
          onClick={() => {
            setShowDeleteConfirm(false);
          }}
        >
          <div className="delete-confirm-popup">
            <p>
              Are you sure you want to <b>delete</b> selected tweets?
            </p>
            <div className="delete-confirm-actions">
              <button onClick={handleBulkDelete}>Delete</button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TwitterFeed;
