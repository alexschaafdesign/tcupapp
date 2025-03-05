import React from 'react';
import { Link } from 'react-router-dom';

const Post = ({ post }) => {
 return (
   <div className="border rounded p-4">
     <div className="flex items-start space-x-4">
       <div className="flex-shrink-0">
         <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white">
           {post.User.username[0].toUpperCase()}
         </div>
       </div>
       <div className="flex-grow">
         <div className="flex justify-between items-start">
           <Link to={`/users/${post.User.user_id}`} className="font-medium text-purple-600">
             {post.User.username}
           </Link>
           <span className="text-sm text-gray-500">
             {new Date(post.post_date * 1000).toLocaleString()}
           </span>
         </div>
         <div className="mt-2 prose" dangerouslySetInnerHTML={{ __html: post.message_html }} />
       </div>
     </div>
   </div>
 );
};

export default Post;