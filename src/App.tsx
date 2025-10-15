import { useState, useEffect } from "react";
import { Label, LabelProps } from "./components/Label";
import { LabelEditor } from "./components/LabelEditor";

export default function App() {
  const [labelProps, setLabelProps] = useState<LabelProps>({
    projectName: "Project Phoenix",
    title: "Custom Collector's Edition",
    imageUrl:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
  });

  // Effect to clean up the object URL
  useEffect(() => {
    // This is the cleanup function that runs when the component unmounts
    // or when the dependency array value changes before the effect runs again.
    return () => {
      if (labelProps.imageUrl && labelProps.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(labelProps.imageUrl);
      }
    };
  }, [labelProps.imageUrl]); // Dependency array

  return (
    <main className="bg-gray-100 min-h-screen w-full flex flex-col lg:flex-row items-center justify-center p-8 gap-16">
      {/* Left side: Editor */}
      <div className="w-full max-w-md">
        <LabelEditor props={labelProps} setProps={setLabelProps} />
      </div>

      {/* Right side: Live Preview */}
      <div className="flex-shrink-0">
        <Label {...labelProps} />
      </div>
    </main>
  );
}