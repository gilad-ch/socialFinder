import React, { useContext, useState, useEffect, useRef } from "react";
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
  const observerRef = useRef(new IntersectionObserver(() => {})); // Holds the observer instance
  const tweetRefs = useRef({}); // Store references to tweet elements

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
    document.getElementById("main-content")?.scrollTo({ top: 0 });
    setTweets((prevTwitts) =>
      prevTwitts.filter((twitt) => !selectedTweets.has(twitt.tweet_id))
    );
    setSelectedTweets(new Set()); // Clear selection after deletion
  };

  // Auto-select tweets when they are viewed
  useEffect(() => {
    // Clean up previous observers
    observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tweet_id = entry.target.dataset.tweetid;
            setSelectedTweets((prev) => new Set(prev).add(tweet_id));
          }
        });
      },
      { threshold: 0.1 } // Trigger when at least 50% of the tweet is visible
    );

    // Attach observer to tweet elements
    twitts.forEach((tweet) => {
      const tweetElement = tweetRefs.current[tweet.tweet_id];
      if (tweetElement) {
        observerRef.current.observe(tweetElement);
      }
    });

    return () => {
      observerRef.current.disconnect(); // Cleanup observer on unmount
    };
  }, [twitts]);

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
              <div
                key={twitt._id}
                data-tweetid={twitt.tweet_id}
                ref={(el) => (tweetRefs.current[twitt.tweet_id] = el)}
              >
                <TwittCard
                  twitt={twitt}
                  uiDeleteTwitt={handleUIDeleteTwitt}
                  toggleSelection={toggleSelection}
                  selected={selectedTweets.has(twitt.tweet_id)}
                />
              </div>
            ))}
          </div>
        </InfiniteScroll>
      )}
      {currentStatus !== 1 && (
        <button
          className="bulk-delete-btn"
          onClick={() => {
            setShowDeleteConfirm(true);
          }}
        >
          Delete Selected ({selectedTweets.size})
        </button>
      )}
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
