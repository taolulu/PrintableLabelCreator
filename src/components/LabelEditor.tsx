import { IndividualLabel } from "../App";
import React from "react";
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Mark } from '@tiptap/core'
import { saveImageBlob } from '../lib/idbImages';
import { Toolbar } from './Toolbar';

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

  const editor = useEditor({
    extensions: [
      StarterKit,
      FontSizeMark,
    ],
    content: selectedLabel.title,
    onUpdate: ({ editor }) => {
      updateSelectedLabel({ title: editor.getHTML() }, selectedLabel.id);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      (async () => {
        try {
          const id = await saveImageBlob(file);
          updateSelectedLabel({ imageUrl: `idb://${id}` }, selectedLabel.id);
        } catch (e) {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string | null;
            if (result) updateSelectedLabel({ imageUrl: result }, selectedLabel.id);
          };
          reader.readAsDataURL(file);
        }
      })();
    }
  };

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
          <div className="border border-gray-300 rounded-lg min-h-48 t-editor-content">
            <Toolbar editor={editor} titleFontSize={selectedLabel.titleFontSize} />
            <EditorContent editor={editor} />
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