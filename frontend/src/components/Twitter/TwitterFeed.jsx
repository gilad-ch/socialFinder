import React from "react";
import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import InfiniteScroll from "react-infinite-scroll-component";
import TwittCard from "./TwittCard";
import { fetchTwitts } from "../../services/api";
import "../../css/Twitter/TwitterFeed.css";

function TwitterFeed({ currentStatus }) {
  const [twitts, setTweets] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Refetch tweets if current status is changed
  useEffect(() => {
    setLoading(true); // Start loading
    fetchTwitts(currentStatus)
      .then((tweets) => {
        setTweets(tweets);
        setHasMore(tweets.length >= 10); // Set hasMore based on initial fetch
      })
      .finally(() => {
        setLoading(false); // End loading
      });
  }, [currentStatus]);

  // Function to handle the deletion of a tweet - only in the UI
  const handleUIDeleteTwitt = (tweet_id) => {
    setTweets((prevTwitts) =>
      prevTwitts.filter((twitt) => twitt.tweet_id !== tweet_id)
    );
  };

  const fetchMoreTwitts = async () => {
    if (twitts.length > 0) {
      fetchTwitts(currentStatus, twitts[twitts.length - 1].created_at).then(
        (newTweets) => {
          setTweets((prevTwitts) => [...prevTwitts, ...newTweets]);
          if (newTweets.length < 10) {
            setHasMore(false);
          }
        }
      );
    }
  };

  return (
    <div className="twitter-feed-container">
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
        >
          <div className="twitter-feed">
            {twitts.map((twitt, index) => (
              <TwittCard
                key={twitt._id}
                twitt={twitt}
                uiDeleteTwitt={handleUIDeleteTwitt}
                currentStatus={currentStatus}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}

export default TwitterFeed;
