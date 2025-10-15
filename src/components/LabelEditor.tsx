import { Label as UiLabel } from "./ui/label";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { LabelProps } from "./Label";
import React from "react";

interface LabelEditorProps {
  props: LabelProps;
  setProps: (newProps: LabelProps) => void;
}

export function LabelEditor({ props, setProps }: LabelEditorProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke the old object URL if it exists, to prevent memory leaks
      if (props.imageUrl && props.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(props.imageUrl);
      }
      const newImageUrl = URL.createObjectURL(file);
      setProps({ ...props, imageUrl: newImageUrl });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>标签编辑器</CardTitle>
        <CardDescription>实时修改右侧标签的内容</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <UiLabel htmlFor="project-name">项目名称</UiLabel>
            <Input
              id="project-name"
              value={props.projectName}
              onChange={(e) =>
                setProps({ ...props, projectName: e.target.value })
              }
              placeholder="e.g., Lyra Project"
            />
          </div>
          <div className="grid gap-2">
            <UiLabel htmlFor="title">主标题</UiLabel>
            <Input
              id="title"
              value={props.title}
              onChange={(e) => setProps({ ...props, title: e.target.value })}
              placeholder="e.g., 高端商务礼盒"
            />
          </div>
          <div className="grid gap-2">
            <UiLabel htmlFor="image-upload">选择图片</UiLabel>
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
