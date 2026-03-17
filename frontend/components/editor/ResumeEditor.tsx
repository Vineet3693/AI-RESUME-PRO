'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ColorMark } from './ColorMark';
import { LineTag } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ResumeEditorProps {
  initialContent?: string;
  sessionId: string | null;
  onContentChange?: (content: string) => void;
}

export function ResumeEditor({ initialContent = '', sessionId, onContentChange }: ResumeEditorProps) {
  const [colorTags, setColorTags] = useState<Map<number, LineTag>>(new Map());

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      ColorMark,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[600px] p-4 max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (!editor) return;

    // Apply color tags to lines
    const applyColorTags = () => {
      const textLines = editor.state.doc.textContent.split('\n');
      
      editor.commands.command(({ tr }) => {
        let pos = 0;
        
        textLines.forEach((lineText, index) => {
          const tag = colorTags.get(index);
          
          if (tag && lineText.trim()) {
            const from = pos;
            const to = pos + lineText.length;
            
            tr.addMark(from, to, editor.state.schema.marks.colorMark.create({ color: tag.color }));
          }
          
          pos += lineText.length + 1; // +1 for newline
        });
        
        return true;
      });
    };

    applyColorTags();
  }, [colorTags, editor]);

  const handleColorUpdate = (tags: Map<number, LineTag>) => {
    setColorTags(tags);
  };

  // Expose handleColorUpdate to parent via ref or callback if needed
  useEffect(() => {
    if (editor) {
      (editor as any).handleColorUpdate = handleColorUpdate;
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      <EditorContent editor={editor} className="border rounded-lg bg-white shadow-sm" />
      
      {/* Floating action bar for suggestions */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={cn(
            "px-3 py-1 rounded text-sm font-medium transition-colors",
            editor.isActive('bold')
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted-foreground/20"
          )}
        >
          Bold
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={cn(
            "px-3 py-1 rounded text-sm font-medium transition-colors",
            editor.isActive('italic')
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted-foreground/20"
          )}
        >
          Italic
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={cn(
            "px-3 py-1 rounded text-sm font-medium transition-colors",
            editor.isActive('bulletList')
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted-foreground/20"
          )}
        >
          Bullet List
        </button>
      </div>
    </div>
  );
}
