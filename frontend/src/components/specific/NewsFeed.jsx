import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';

const NewsFeed = () => {
  const { news } = useAppContext();

  return (
    <div className="news-feed-container">
      {news.map(n => (
        <div key={n.id} className="news-card">
          <img src={n.imageUrl} alt={n.title} className="news-card-image" />
          <div className="news-card-content">
            <span className="item-title">{n.title}</span>
            <span className="item-meta">{n.source} | {n.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsFeed;