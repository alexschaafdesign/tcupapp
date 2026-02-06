import React from 'react';
import { Link } from 'react-router-dom';


const ForumHeader = ({ user }) => {
    return (
      <header className="bg-purple-600 text-white p-4 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">TCUPBOARD Forums</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span>Welcome, {user.username}</span>
                <Link to="/forum/new" className="bg-white text-purple-600 px-4 py-2 rounded">
                  New Thread
                </Link>
              </>
            ) : (
              <Link to="/login" className="bg-white text-purple-600 px-4 py-2 rounded">
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>
    );
   };

   export default ForumHeader