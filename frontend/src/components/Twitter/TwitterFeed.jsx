import React, { useContext, useState, useEffect } from "react";
import { DashboardContext } from "../../contexts/DashboardContext";
import { ClipLoader } from "react-spinners";
import InfiniteScroll from "react-infinite-scroll-component";
import TwittCard from "./TwittCard";
import { fetchTwitts } from "../../services/api";
import FilterChips from "./FilterChips";
import "../../css/Twitter/TwitterFeed.css";

function TwitterFeed() {
  const { currentStatus, filters } = useContext(DashboardContext); // Combine useContext calls
  const [twitts, setTweets] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

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
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}

export default TwitterFeed;
