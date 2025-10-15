import { Label as UiLabel } from "./ui/label";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { IndividualLabel } from "../App"; // Import the new interface
import React from "react";

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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Label Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Shared Project Name */}
          <div className="grid gap-2">
            <UiLabel htmlFor="project-name">Project Name (Shared)</UiLabel>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          {/* Separator */}
          <hr className="my-2" />
          {/* Individual Label Fields */}
          <div className="grid gap-2">
            <UiLabel htmlFor="title">Label Title</UiLabel>
            <Input
              id="title"
              value={selectedLabel.title}
              onChange={(e) => updateSelectedLabel({ title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <UiLabel htmlFor="image-upload">Label Image</UiLabel>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}