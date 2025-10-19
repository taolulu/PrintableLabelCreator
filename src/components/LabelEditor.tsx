import { Label as UiLabel } from "./ui/label";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { IndividualLabel } from "../App";
import React from "react";
import { Button } from "./ui/button";
import { UploadCloud } from "lucide-react";

interface LabelEditorProps {
  projectName: string;
  setProjectName: (name: string) => void;
  selectedLabel: IndividualLabel;
  updateSelectedLabel: (updatedProps: Partial<Omit<IndividualLabel, "id">>) => void;
}

export function LabelEditor({
  projectName,
  setProjectName,
  selectedLabel,
  updateSelectedLabel,
}: LabelEditorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (selectedLabel.imageUrl && selectedLabel.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(selectedLabel.imageUrl);
      }
      const newImageUrl = URL.createObjectURL(file);
      updateSelectedLabel({ imageUrl: newImageUrl });
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
          <Input
            id="project-name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., Project Phoenix"
            className="w-full"
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
          <label htmlFor="title" className="font-semibold text-sm">Label Title</label>
          <Input
            id="title"
            value={selectedLabel.title}
            onChange={(e) => updateSelectedLabel({ title: e.target.value })}
            placeholder="e.g., Collector's Edition"
            className="w-full"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="image-upload" className="font-semibold text-sm">Label Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
        </div>
      </div>
    </div>
  );
}
