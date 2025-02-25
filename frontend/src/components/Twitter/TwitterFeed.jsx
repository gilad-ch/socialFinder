import React, { useContext, useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { DashboardContext } from "../../contexts/DashboardContext";
import TwittCard from "./TwittCard";
import FilterChips from "./FilterChips";
import { ClipLoader } from "react-spinners";
import { fetchTwitts, bulkDeleteTweets } from "../../services/twitterApi";
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
    setSelectedTweets(new Set());
    fetchTwitts(currentStatus, null, filters.keywords, filters.username)
      .then((tweets) => {
        setTweets(tweets);
        setHasMore(tweets.length >= 10); // Check if there are more tweets
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentStatus, filters]);

  // Removes tweet from the UI
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

  const toggleSelection = (_id) => {
    setSelectedTweets((prev) => {
      const newSelection = new Set(prev);
      newSelection.has(_id) ? newSelection.delete(_id) : newSelection.add(_id);
      return newSelection;
    });
  };

  const handleBulkDelete = () => {
    document.getElementById("main-content")?.scrollTo({ top: 0 });
    bulkDeleteTweets(Array.from(selectedTweets)).then(() => {
      setTweets((prevTwitts) =>
        prevTwitts.filter((twitt) => !selectedTweets.has(twitt._id))
      );
      setSelectedTweets(new Set()); // clear selection after delete
    });
  };

  // Auto-select tweets when they are viewed
  useEffect(() => {
    // Clean up previous observers
    observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const _id = entry.target.dataset._id;
            setSelectedTweets((prev) => new Set(prev).add(_id));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Attach observer to tweet elements
    twitts.forEach((tweet) => {
      const tweetElement = tweetRefs.current[tweet._id];
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
                className="twitt-container"
                key={twitt._id}
                data-_id={twitt._id}
                ref={(el) => (tweetRefs.current[twitt._id] = el)}
              >
                <TwittCard
                  twitt={twitt}
                  uiDeleteTwitt={handleUIDeleteTwitt}
                  toggleSelection={toggleSelection}
                  selected={selectedTweets.has(twitt._id)}
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
