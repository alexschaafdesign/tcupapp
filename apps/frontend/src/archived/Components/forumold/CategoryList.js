import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
  
    useEffect(() => {
      const fetchCategories = async () => {
        const response = await fetch('/api/xenforo/forums', {
          credentials: 'include'
        });
        const data = await response.json();
        setCategories(data);
      };
      fetchCategories();
    }, []);
   
    return (
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category.node_id} className="border rounded p-4">
            <Link 
              to={`/forum/category/${category.node_id}`}
              className="text-xl text-purple-600 font-semibold hover:underline"
            >
              {category.title}
            </Link>
            <p className="text-gray-600 mt-2">{category.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              Threads: {category.type_data.discussion_count} · 
              Messages: {category.type_data.message_count}
            </div>
          </div>
        ))}
      </div>
    );
   };

   export default CategoryList;