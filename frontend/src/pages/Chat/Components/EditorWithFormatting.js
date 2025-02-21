import React, { useRef, useEffect } from 'react';
import { Paper, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { 
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatQuote,
  Code,
  FormatListBulleted,
  FormatListNumbered
} from '@mui/icons-material';
import { Editor, EditorState, RichUtils } from 'draft-js';

const EditorWithFormatting = ({ editorState, setEditorState, autoFocus, focusTrigger }) => {
  const editorRef = useRef(null);

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
    </Paper>
  );
};

export default EditorWithFormatting;