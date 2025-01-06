// tags.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import supabase from '../lib/supabase.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { data: tags, error } = await supabase
            .from('tags')
            .select('*')
            .order('name');
            
        if (error) throw error;
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const { name, description } = req.body;
    
    try {
        const { data: tag, error } = await supabase
            .from('tags')
            .insert([{ name, description }])
            .select()
            .single();
            
        if (error) throw error;
        res.json(tag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('post_tags')
            .select(`
                tag_id,
                tags (
                    name,
                    description
                ),
                count: tag_id(count)
            `)
            .group('tag_id, tags.name, tags.description');
            
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;