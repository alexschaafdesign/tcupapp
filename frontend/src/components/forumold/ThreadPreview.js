// components/forum/ThreadPreview.js
import React from 'react';
import { Link } from 'react-router-dom';

const ThreadPreview = ({ thread }) => {
 return (
   <div className="border rounded p-4 mb-4">
     <div className="flex justify-between">
       <div>
         <Link 
           to={`/forum/thread/${thread.thread_id}`}
           className="text-lg text-purple-600 font-medium hover:underline"
         >
           {thread.title}
         </Link>
         <div className="text-sm text-gray-600 mt-1">
           Posted by {thread.Creator.username} · {new Date(thread.post_date * 1000).toLocaleString()}
         </div>
       </div>
       <div className="text-right text-sm text-gray-600">
         <div>Replies: {thread.reply_count}</div>
         <div>Views: {thread.view_count}</div>
       </div>
     </div>
   </div>
 );
};

export default ThreadPreview;