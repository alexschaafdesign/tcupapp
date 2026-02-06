import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Post from './Post';

// components/forum/ThreadView.js
const ThreadView = () => {
    const [thread, setThread] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const { id } = useParams();
    const { user } = useContext(AuthContext);
   
    useEffect(() => {
      const fetchThread = async () => {
        const response = await fetch(`/api/xenforo/threads/${id}`, {
          credentials: 'include'
        });
        const threadData = await response.json();
        setThread(threadData);
        setPosts(threadData.posts);
      };
      fetchThread();
    }, [id]);
   
    const handlePost = async (e) => {
      e.preventDefault();
      const response = await fetch(`/api/xenforo/threads/${id}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newPost }),
        credentials: 'include'
      });
      const newPostData = await response.json();
      setPosts([...posts, newPostData]);
      setNewPost('');
    };
   
    return (
      <div>
        {thread && (
          <>
            <h1>{thread.title}</h1>
            <div className="posts">
              {posts.map(post => (
                <Post key={post.id} post={post} />
              ))}
            </div>
            {user && (
              <form onSubmit={handlePost}>
                <textarea 
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                <button type="submit">Post Reply</button>
              </form>
            )}
          </>
        )}
      </div>
    );
   };

   export default ThreadView;