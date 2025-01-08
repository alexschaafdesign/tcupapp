import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AdminImportPost = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    selectedUserId: '',
    postDate: new Date().toISOString().split('T')[0],
    postTime: new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5),
    tags: [],
    parentThreadId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [getAccessTokenSilently]);

  const getFormattedDateTime = () => {
    const dateTime = new Date(`${formData.postDate}T${formData.postTime}`);
    return dateTime.toLocaleString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const token = await getAccessTokenSilently();
      const timestamp = new Date(`${formData.postDate}T${formData.postTime}`).toISOString();

      const postData = {
        title: formData.title,
        content: formData.content,
        userId: formData.selectedUserId,
        createdAt: timestamp,
        tags: formData.tags,
        parentThreadId: formData.parentThreadId || null
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        setMessage('Post imported successfully');
        setFormData({
          title: '',
          content: '',
          selectedUserId: '',
          postDate: new Date().toISOString().split('T')[0],
          postTime: new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5),
          tags: [],
          parentThreadId: ''
        });
      } else {
        const error = await response.json();
        setMessage(`Error importing post: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Import Historical Post</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title (for new threads)</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Thread title (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Post as User</label>
          <select
            value={formData.selectedUserId}
            onChange={(e) => setFormData(prev => ({ ...prev, selectedUserId: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.auth0_id} value={user.auth0_id}>
                {user.username || user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.postDate}
                onChange={(e) => setFormData(prev => ({ ...prev, postDate: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={formData.postTime}
                onChange={(e) => setFormData(prev => ({ ...prev, postTime: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Will be posted as: {getFormattedDateTime()}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reply to Thread (optional)</label>
          <input
            type="text"
            value={formData.parentThreadId}
            onChange={(e) => setFormData(prev => ({ ...prev, parentThreadId: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Thread ID (leave empty for new thread)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags.join(', ')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            }))}
            className="w-full p-2 border rounded"
            placeholder="community, events, etc."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-3 text-white rounded ${
            isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Importing...' : 'Import Post'}
        </button>

        {message && (
          <div className={`p-3 rounded ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminImportPost;