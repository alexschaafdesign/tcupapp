// TagFilter.jsx
import React from 'react';
import { 
    FormControl, InputLabel, Select, 
    MenuItem, Box, Chip 
} from '@mui/material';

export const TagFilter = ({ tags, selectedTags, onTagsChange }) => {
    return (
        <FormControl fullWidth>
            <InputLabel>Filter by Tags</InputLabel>
            <Select
                multiple
                value={selectedTags}
                onChange={(e) => onTagsChange(e.target.value)}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((tagId) => {
                            const tag = tags.find(t => t.id === tagId);
                            return <Chip key={tagId} label={tag?.name} />;
                        })}
                    </Box>
                )}
            >
                {tags.map((tag) => (
                    <MenuItem key={tag.id} value={tag.id}>
                        {tag.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default TagFilter;