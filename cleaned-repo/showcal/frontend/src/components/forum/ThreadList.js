import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ThreadPreview from './ThreadPreview';
import { useNavigate } from 'react-router-dom';

const ThreadList = () => {
    const [threads, setThreads] = useState([]);
    const { id } = useParams();
  
    useEffect(() => {
      const fetchThreads = async () => {
        const response = await fetch(`/api/xenforo/categories/${id}/threads`, {
          credentials: 'include'
        });
        const data = await response.json();
        setThreads(data);
      };
      fetchThreads();
    }, [id]);
  
    return (
      <div>
        {threads.map(thread => (
          <ThreadPreview key={thread.id} thread={thread} />
        ))}
      </div>
    );
  };

  export default ThreadList;