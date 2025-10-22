import { Editor } from '@tiptap/react'
import React from 'react';

export const Toolbar = ({ editor, titleFontSize }: { editor: Editor | null, titleFontSize?: number }) => {
  if (!editor) {
    return null;
  }

  const [showSize, setShowSize] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(titleFontSize || 16);

  React.useEffect(() => {
    if (titleFontSize) {
      setFontSize(titleFontSize);
    }
  }, [titleFontSize]);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    editor.chain().focus().setMark('fontSize', { size: `${size}px` }).run();
  };

  return (
    <div className="flex gap-2 bg-slate-50 p-2 border-b border-gray-300 items-center rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`h-8 w-8 flex items-center justify-center rounded-md text-sm font-bold ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`h-8 w-8 flex items-center justify-center rounded-md text-sm italic font-serif ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`h-8 w-8 flex items-center justify-center rounded-md text-sm ${editor?.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`h-8 w-8 flex items-center justify-center rounded-md text-sm ${editor?.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-ordered"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
      </button>
      <div className="relative">
        <button
          onClick={() => setShowSize((s) => !s)}
          className="h-8 px-2 flex items-center justify-center rounded-md text-sm bg-gray-200 hover:bg-gray-300"
          aria-haspopup="true"
          aria-expanded={showSize}
        >
          {fontSize}px
        </button>

        {showSize && (
          <div className="absolute z-10 mt-2 p-3 bg-white border rounded shadow-md" style={{ minWidth: 220 }}>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={16}
                max={24}
                value={fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
              />
              <div className="w-12 text-right">{fontSize}px</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
