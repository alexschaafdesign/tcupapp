import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';


// components/forum/LatestPosts.js
const LatestPosts = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchLatestPosts = async () => {
          try {
            const response = await fetch('/api/xenforo/threads', {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            console.log('Status:', response.status);
            const data = await response.json();
            console.log('Data:', data);
          } catch (error) {
            console.error(error);
          }
        };
        fetchLatestPosts();
      }, []);

   
    return (
      <div className="latest-posts">
        <h2 className="text-purple-600 text-2xl mb-4">Latest posts</h2>
        {posts.map(post => (
          <div key={post.thread_id} className="flex items-center p-4 border-b">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                {post.creator_username[0].toUpperCase()}
              </div>
            </div>
            <div className="ml-4 flex-grow">
              <Link to={`/forum/thread/${post.thread_id}`} className="text-purple-600 hover:underline">
                {post.thread_title}
              </Link>
              <div className="text-sm text-gray-600">
                {post.creator_username} · {new Date(post.post_date * 1000).toLocaleString()}
                · {post.forum_title}
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>Replies: {post.reply_count}</div>
              <div>Views: {post.view_count}</div>
            </div>
          </div>
        ))}
      </div>
    );
};
   

   export default LatestPosts;