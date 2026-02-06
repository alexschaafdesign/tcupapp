// Forum routes
app.get('/api/forum/threads', async (req, res) => {
    try {
      const { page = 1 } = req.query;
      const response = await xenforoClient.get('/threads', {
        params: {
          page,
          order: 'last_post_date',
          direction: 'desc'
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching threads:', error);
      res.status(500).json({ error: 'Failed to fetch threads' });
    }
  });
  
  app.get('/api/forum/forums/:forumId', async (req, res) => {
    try {
      const { forumId } = req.params;
      const { page = 1 } = req.query;
      const response = await xenforoClient.get(`/forums/${forumId}`, {
        params: {
          with_threads: true,
          page,
          order: 'last_post_date',
          direction: 'desc'
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching forum:', error);
      res.status(500).json({ error: 'Failed to fetch forum' });
    }
  });