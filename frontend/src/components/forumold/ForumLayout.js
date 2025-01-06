// components/forum/ForumLayout.js
import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import ForumHeader from './ForumHeader';
import CategoryList from './CategoryList';
import ThreadView from './ThreadView';
import ThreadList from './ThreadList';
import LatestPosts from './LatestPosts';
import { AuthContext } from '../../contexts/AuthContext';  // Add this line

const ForumLayout = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mx-auto px-4">
      <ForumHeader user={user} />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <Routes>
            <Route exact path="/forum" element={<CategoryList />} />
            <Route path="/forum/thread/:id" element={<ThreadView />} />
            <Route path="/forum/category/:id" element={<ThreadList />} />
            <Route path="/forum/latest" element={<LatestPosts />} />
          </Routes>
        </div>
        <div className="col-span-4">
          <LatestPosts />
        </div>
      </div>
    </div>
  );
};

export default ForumLayout;