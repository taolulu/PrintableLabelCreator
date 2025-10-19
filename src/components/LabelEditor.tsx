import { IndividualLabel } from "../App";
import React from "react";
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Mark } from '@tiptap/core'

// Toolbar Component for Tiptap with font-size control
const Toolbar = ({ editor, fontSize, onFontSizeChange }: { editor: Editor | null, fontSize: number, onFontSizeChange: (v: number) => void }) => {
  const [showSize, setShowSize] = React.useState(false);

  React.useEffect(() => {
    // close panel when editor changes
    setShowSize(false);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex gap-2 bg-slate-50 p-2 border-b border-gray-300 items-center">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded-md text-sm font-bold ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
        B
      </button>
      {/* List controls */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded-md text-sm ${editor?.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        • List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 rounded-md text-sm ${editor?.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        1. List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded-md text-sm italic font-serif ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
        I
      </button>

      {/* Font size button */}
      <div className="relative">
        <button
          onClick={() => setShowSize((s) => !s)}
          className="px-3 py-1 rounded-md text-sm bg-gray-200 hover:bg-gray-300"
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
                min={10}
                max={40}
                value={fontSize}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
              />
              <div className="w-12 text-right">{fontSize}px</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple font-size mark that stores font-size as inline style on a span
const FontSizeMark = Mark.create({
  name: 'fontSize',
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attributes: any) => {
          if (!attributes.size) return {};
          return { style: `font-size: ${attributes.size}` };
        },
      },
    }
  },
  parseHTML() {
    return [
      { tag: 'span' },
    ]
  },
  renderHTML({ HTMLAttributes }: any) {
    return ['span', HTMLAttributes, 0]
  },
  // Note: commands are applied through the editor API (editor.chain().setMark(...))
})


interface LabelEditorProps {
  projectName: string;
  setProjectName: (name: string) => void;
  selectedLabel: IndividualLabel;
  updateSelectedLabel: (updatedProps: Partial<Omit<IndividualLabel, "id">>, id?: string) => void;
}

export function LabelEditor({
  projectName,
  setProjectName,
  selectedLabel,
  updateSelectedLabel,
}: LabelEditorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = React.useState<number>(selectedLabel.titleFontSize ?? 18);

  const editor = useEditor({
    extensions: [
      FontSizeMark,
      StarterKit,
    ],
    content: selectedLabel.title,
    onUpdate: ({ editor }) => {
      updateSelectedLabel({ title: editor.getHTML() }, selectedLabel.id);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-4 focus:outline-none',
      },
    },
  });

  // keep fontSize in sync when selectedLabel changes
  React.useEffect(() => {
    setFontSize(selectedLabel.titleFontSize ?? 18);
  }, [selectedLabel]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Read file as Data URL so it persists across page reloads
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string | null;
        if (result) {
          updateSelectedLabel({ imageUrl: result }, selectedLabel.id);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFontSizeChange = (value: number) => {
    setFontSize(value);
    updateSelectedLabel({ titleFontSize: value }, selectedLabel.id);
    // Try to apply the mark; if the editor schema isn't ready yet, retry a few times.
    const applyFontSizeMark = (triesLeft = 5, delay = 50) => {
      if (!editor) return;
      try {
        const hasMark = Boolean(editor.schema && editor.schema.marks && editor.schema.marks['fontSize']);
        if (hasMark) {
          editor.chain().focus().setMark('fontSize', { size: `${value}px` }).run();
          return;
        }
      } catch (e) {
        // swallow and retry
      }

      if (triesLeft > 0) {
        setTimeout(() => applyFontSizeMark(triesLeft - 1, delay * 1.5), delay);
      } else {
        // eslint-disable-next-line no-console
        console.warn('FontSize mark not available after retries; skipping setMark');
      }
    };

    applyFontSizeMark();
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h3 className="text-xl font-bold">Label Editor</h3>
        <p className="text-sm text-gray-500 mt-1">Edit the shared project name and the properties of the selected label.</p>
      </div>
      <div className="p-6 pt-0 grid gap-6">
        <div className="grid gap-2">
          <label htmlFor="project-name" className="font-semibold text-sm">Project Name (Shared)</label>
          <input
            id="project-name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., Project Phoenix"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Edit Selected Label</span>
            </div>
        </div>

        <div className="grid gap-2">
          <label className="font-semibold text-sm">Label Title</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Toolbar editor={editor} fontSize={fontSize} onFontSizeChange={handleFontSizeChange} />
            <div style={{ fontSize: `${fontSize}px` }} className="p-4">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="image-upload" className="font-semibold text-sm">Label Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
          <button className="w-full p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center justify-center gap-2" onClick={() => fileInputRef.current?.click()}>
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Image
          </button>
        </div>
      </div>
    </div>
  );
}