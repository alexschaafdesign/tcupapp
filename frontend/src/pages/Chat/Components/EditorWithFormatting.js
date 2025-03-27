import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { 
  Paper, 
  Box, 
  ToggleButton, 
  ToggleButtonGroup, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button 
} from '@mui/material';
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
import { 
  EditorState, 
  RichUtils, 
  Modifier,
  convertToRaw,
  convertFromRaw
} from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import Editor from 'draft-js-plugins-editor';
import { LinkDecorator } from './LinkDecorator';
import 'draft-js/dist/Draft.css';

// Export options for HTML conversion
const exportOptions = {
  entityStyleFn: (entity) => {
    const entityType = entity.get('type').toLowerCase();
    if (entityType === 'link') {
      const data = entity.getData();
      return {
        element: 'a',
        attributes: {
          href: data.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'editor-link',
        },
      };
    }
  },
};

// We have two options for fixing the issue:

// Option 1: Don't use the LinkDecorator directly here, but pass the initialized EditorState from parent
// Option 2: Create editor state with proper handling to avoid reinitialization issues

const EditorWithFormatting = forwardRef(
  ({ editorState, setEditorState, autoFocus, placeholder = "Enter your text here...", onSave }, ref) => {
    const editorRef = useRef(null);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');

    // Expose a focus method via the forwarded ref
    useEffect(() => {
      if (ref) {
        ref.current = {
          focus: () => {
            if (editorRef.current) editorRef.current.focus();
          },
        };
      }
    }, [ref]);

    // Auto-focus the editor when autoFocus is true
    useEffect(() => {
      if (autoFocus && editorRef.current) {
        setTimeout(() => {
          editorRef.current.focus();
        }, 100);
      }
    }, [autoFocus]);

    const handleKeyCommand = (command, currentState) => {
      const newState = RichUtils.handleKeyCommand(currentState, command);
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
        const content = editorState.getCurrentContent();
        const startKey = selection.getStartKey();
        const startOffset = selection.getStartOffset();
        const endOffset = selection.getEndOffset();
        const selectedText = content.getBlockForKey(startKey)
          .getText()
          .slice(startOffset, endOffset);
        setLinkText(selectedText);
      } else {
        setLinkText('');
      }
      setLinkUrl('https://');
      setLinkDialogOpen(true);
    };

    const confirmLink = () => {
      const content = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      let newState;
      
      if (!selection.isCollapsed()) {
        // Text is selected, convert to link
        const contentWithEntity = content.createEntity('LINK', 'MUTABLE', { url: linkUrl });
        const entityKey = contentWithEntity.getLastCreatedEntityKey();
        newState = EditorState.push(editorState, contentWithEntity, 'create-entity');
        newState = RichUtils.toggleLink(newState, selection, entityKey);
      } else {
        // No text selected, insert new link with text
        const contentWithEntity = content.createEntity('LINK', 'MUTABLE', { url: linkUrl });
        const entityKey = contentWithEntity.getLastCreatedEntityKey();
        const contentWithText = Modifier.insertText(content, selection, linkText);
        const newSelection = selection.merge({
          anchorOffset: selection.getStartOffset(),
          focusOffset: selection.getStartOffset() + linkText.length,
        });
        newState = EditorState.push(editorState, contentWithText, 'insert-characters');
        newState = EditorState.forceSelection(newState, newSelection);
        newState = RichUtils.toggleLink(newState, newSelection, entityKey);
      }
      
      setEditorState(newState);
      setLinkDialogOpen(false);
      setLinkUrl('');
      setLinkText('');
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 0);
    };

    const getContentAsHTML = () => {
      const content = editorState.getCurrentContent();
      return stateToHTML(content, exportOptions);
    };

    const getContentAsRaw = () => {
      const content = editorState.getCurrentContent();
      return JSON.stringify(convertToRaw(content));
    };

    const handleSave = () => {
      if (onSave) {
        onSave({
          html: getContentAsHTML(),
          raw: getContentAsRaw(),
        });
      }
    };

    const currentInlineStyle = editorState.getCurrentInlineStyle();
    const selection = editorState.getSelection();
    const currentBlock = editorState.getCurrentContent().getBlockForKey(selection.getStartKey());
    const blockType = currentBlock ? currentBlock.getType() : '';

    const handleBoxClick = () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    };

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
          <ToggleButton value="LINK" onMouseDown={promptForLink}>
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
            '& .DraftEditor-root': { height: '100%', width: '100%' },
            '& .public-DraftEditor-content': { minHeight: '100px', width: '100%' },
            '& a': { color: '#2196f3', textDecoration: 'underline' },
          }}
        >
          <Editor
            ref={editorRef}
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={handleKeyCommand}
            placeholder={placeholder}
            spellCheck={true}
            // We don't need to specify plugins here since we're using the editorState from parent
          />
        </Box>

        {onSave && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Box>
        )}

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
            <Button onClick={confirmLink} disabled={!linkUrl || (selection.isCollapsed() && !linkText)}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }
);

export default EditorWithFormatting;