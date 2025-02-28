import React, { useRef, useEffect, useState } from 'react';
import { Paper, Box, ToggleButton, ToggleButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { 
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatQuote,
  Code,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon
} from '@mui/icons-material';
import { Editor, EditorState, RichUtils, CompositeDecorator, Entity } from 'draft-js';

// Link decorator component
const LinkComponent = (props) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url} style={{ color: '#2196f3', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  );
};

// Create decorator for links
const decorator = new CompositeDecorator([
  {
    strategy: (contentBlock, callback, contentState) => {
      contentBlock.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === 'LINK'
          );
        },
        callback
      );
    },
    component: LinkComponent,
  },
]);

const EditorWithFormatting = ({ editorState, setEditorState, autoFocus, focusTrigger }) => {
  const editorRef = useRef(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Initialize with decorator when component mounts
  useEffect(() => {
    if (!editorState) {
      setEditorState(EditorState.createEmpty(decorator));
    }
  }, []);

  // Focus the editor whenever autoFocus or focusTrigger changes.
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      setTimeout(() => {
        editorRef.current.focus();
      }, 50);
    }
  }, [autoFocus, focusTrigger]);

  const handleKeyCommand = (command, editor) => {
    const newState = RichUtils.handleKeyCommand(editor, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (e, style) => {
    e.preventDefault();
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (e, blockType) => {
    e.preventDefault();
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const promptForLink = (e) => {
    e.preventDefault();
    
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      // Get the selected text to pre-fill the link text
      const contentState = editorState.getCurrentContent();
      const startKey = selection.getStartKey();
      const startOffset = selection.getStartOffset();
      const endOffset = selection.getEndOffset();
      const selectedText = contentState
        .getBlockForKey(startKey)
        .getText()
        .slice(startOffset, endOffset);
      
      setLinkText(selectedText);
      setLinkUrl('https://');
      setLinkDialogOpen(true);
    } else {
      // No text selected, prompt for both URL and text
      setLinkText('');
      setLinkUrl('https://');
      setLinkDialogOpen(true);
    }
  };

  const confirmLink = () => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    
    // If text is already selected, apply the link
    if (!selection.isCollapsed()) {
      const contentWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url: linkUrl });
      const entityKey = contentWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.push(
        editorState,
        contentWithEntity,
        'create-entity'
      );
      setEditorState(RichUtils.toggleLink(newEditorState, selection, entityKey));
    } else {
      // If no text is selected, insert the link text and make it a link
      const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url: linkUrl });
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      
      // First, insert the text
      const contentStateWithText = Modifier.insertText(
        contentStateWithEntity,
        selection,
        linkText
      );
      
      // Then, select the newly inserted text
      const blockKey = selection.getStartKey();
      const startOffset = selection.getStartOffset();
      const endOffset = startOffset + linkText.length;
      const newSelection = selection.merge({
        anchorOffset: startOffset,
        focusOffset: endOffset,
      });
      
      // Finally, apply the link entity to the selected text
      const newEditorState = EditorState.push(
        editorState,
        contentStateWithText,
        'insert-characters'
      );
      
      const editorWithSelectedText = EditorState.forceSelection(
        newEditorState,
        newSelection
      );
      
      setEditorState(RichUtils.toggleLink(editorWithSelectedText, newSelection, entityKey));
    }
    
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
    
    // Focus back to editor after adding link
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 0);
  };

  const currentInlineStyle = editorState.getCurrentInlineStyle();
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  // If user clicks the editor's box, focus it
  const handleBoxClick = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Fix missing Modifier import
  const { Modifier } = require('draft-js');

  return (
    <Paper variant="outlined" sx={{ mb: 2, p: 1 }}>
      <ToggleButtonGroup size="small" sx={{ mb: 1 }}>
        <ToggleButton
          value="BOLD"
          selected={currentInlineStyle.has('BOLD')}
          onMouseDown={(e) => toggleInlineStyle(e, 'BOLD')}
        >
          <FormatBold />
        </ToggleButton>
        <ToggleButton
          value="ITALIC"
          selected={currentInlineStyle.has('ITALIC')}
          onMouseDown={(e) => toggleInlineStyle(e, 'ITALIC')}
        >
          <FormatItalic />
        </ToggleButton>
        <ToggleButton
          value="UNDERLINE"
          selected={currentInlineStyle.has('UNDERLINE')}
          onMouseDown={(e) => toggleInlineStyle(e, 'UNDERLINE')}
        >
          <FormatUnderlined />
        </ToggleButton>
        <ToggleButton
          value="LINK"
          onMouseDown={promptForLink}
        >
          <LinkIcon />
        </ToggleButton>
        <ToggleButton
          value="blockquote"
          selected={blockType === 'blockquote'}
          onMouseDown={(e) => toggleBlockType(e, 'blockquote')}
        >
          <FormatQuote />
        </ToggleButton>
        <ToggleButton
          value="code-block"
          selected={blockType === 'code-block'}
          onMouseDown={(e) => toggleBlockType(e, 'code-block')}
        >
          <Code />
        </ToggleButton>
        <ToggleButton
          value="unordered-list-item"
          selected={blockType === 'unordered-list-item'}
          onMouseDown={(e) => toggleBlockType(e, 'unordered-list-item')}
        >
          <FormatListBulleted />
        </ToggleButton>
        <ToggleButton
          value="ordered-list-item"
          selected={blockType === 'ordered-list-item'}
          onMouseDown={(e) => toggleBlockType(e, 'ordered-list-item')}
        >
          <FormatListNumbered />
        </ToggleButton>
      </ToggleButtonGroup>

      <Box
        onClick={handleBoxClick}
        sx={{
          border: 1,
          borderColor: 'grey.300',
          borderRadius: 1,
          p: 2,
          bgcolor: 'background.paper',
          minHeight: '100px',
          cursor: 'text',
          '& .DraftEditor-root': {
            height: '100%',
            width: '100%',
          },
          '& .public-DraftEditor-content': {
            minHeight: '100px',
            width: '100%',
          },
        }}
      >
        <Editor
          ref={(node) => (editorRef.current = node)}
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          placeholder="Enter your post here..."
        />
      </Box>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)}>
        <DialogTitle>Add Link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="url"
            label="URL"
            type="url"
            fullWidth
            variant="outlined"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          {selection.isCollapsed() && (
            <TextField
              margin="dense"
              id="text"
              label="Link Text"
              type="text"
              fullWidth
              variant="outlined"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmLink}
            disabled={!linkUrl || (selection.isCollapsed() && !linkText)}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EditorWithFormatting;