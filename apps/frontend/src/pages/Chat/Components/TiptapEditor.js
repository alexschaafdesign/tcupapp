import React from 'react'
import { Box, Button } from '@mui/material'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function TiptapEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <>
      {/* Simple menu bar */}
      <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
        <Button
          variant={editor.isActive('bold') ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </Button>
        <Button
          variant={editor.isActive('blockquote') ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          “Quote”
        </Button>
      </Box>

      {/* Editor container with MUI styles */}
      <Box
        sx={{
          border: 1,
          borderColor: 'grey.300',
          borderRadius: 1,
          p: 2,
          minHeight: 150,
          backgroundColor: 'background.paper',
          // If you want a visible outline when focused, add one:
          outline: 'none',
          '& .ProseMirror': {
            outline: 'none',
            // optional additional styles
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </>
  )
}