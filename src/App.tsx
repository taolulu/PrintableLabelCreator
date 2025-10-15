import { useState, useEffect } from "react";
import { Label } from "./components/Label";
import { LabelEditor } from "./components/LabelEditor";
import { Button } from "./components/ui/button";
import { Trash2, Plus, Printer, ArrowLeft } from "lucide-react";
import { A4Page } from "./components/A4Page";

export interface IndividualLabel {
  id: string;
  title: string;
  imageUrl: string;
}

export default function App() {
  const [projectName, setProjectName] = useState("Project Phoenix");
  const [labels, setLabels] = useState<IndividualLabel[]>([
    {
      id: `label-${Date.now()}`,
      title: "Custom Collector's Edition",
      imageUrl:
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
    },
  ]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(
    labels[0]?.id ?? null
  );
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  const selectedLabel = labels.find((label) => label.id === selectedLabelId);
  const MAX_LABELS = 12;

  const handleAddLabel = () => {
    if (labels.length >= MAX_LABELS) {
      alert(`You can add a maximum of ${MAX_LABELS} labels.`);
      return;
    }
    const newId = `label-${Date.now()}`;
    const newLabel: IndividualLabel = { id: newId, title: "New Label", imageUrl: "" };
    setLabels([...labels, newLabel]);
    setSelectedLabelId(newId);
  };

  const handleDeleteLabel = (idToDelete: string) => {
    const newLabels = labels.filter((label) => label.id !== idToDelete);
    setLabels(newLabels);
    if (selectedLabelId === idToDelete) {
      setSelectedLabelId(newLabels[0]?.id ?? null);
    }
  };

  const handleUpdateSelectedLabel = (
    updatedProps: Partial<Omit<IndividualLabel, "id">>
  ) => {
    if (!selectedLabelId) return;
    setLabels(
      labels.map((label) =>
        label.id === selectedLabelId ? { ...label, ...updatedProps } : label
      )
    );
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    return () => {
      labels.forEach((label) => {
        if (label.imageUrl && label.imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(label.imageUrl);
        }
      });
    };
  }, [labels]);

  return (
    <main className="bg-gray-100 min-h-screen w-full p-8">
      {isPrintPreview ? (
        <div id="print-area">
          <div className="flex justify-center gap-4 mb-8 print-hidden">
            <Button onClick={() => setIsPrintPreview(false)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
          <div className="flex justify-center">
            <A4Page labels={labels} projectName={projectName} />
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-center gap-8">
          {/* Left side: Controls */}
          <div className="flex flex-col gap-8 sticky top-8">
            <div
              className="w-64 bg-white rounded-lg shadow-md p-4 flex flex-col"
              style={{ maxHeight: "40vh" }}
            >
              <h2 className="text-lg font-semibold mb-4">My Labels</h2>
              <div className="flex-1 overflow-y-auto pr-2">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className={`p-2 rounded-md mb-2 cursor-pointer flex justify-between items-center ${
                      selectedLabelId === label.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedLabelId(label.id)}
                  >
                    <span className="truncate flex-1 pr-2">{label.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLabel(label.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleAddLabel}
                className="mt-4"
                disabled={labels.length >= MAX_LABELS}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Label
              </Button>
            </div>

            {selectedLabel ? (
              <LabelEditor
                key={selectedLabel.id}
                projectName={projectName}
                setProjectName={setProjectName}
                selectedLabel={selectedLabel}
                updateSelectedLabel={handleUpdateSelectedLabel}
              />
            ) : (
              <div className="w-full max-w-md text-center text-gray-500 bg-white p-8 rounded-lg shadow-md">
                Select a label to edit or add a new one.
              </div>
            )}

            <Button onClick={() => setIsPrintPreview(true)}>
              Go to Print Preview
            </Button>
          </div>

          {/* Right side: All Labels Preview */}
          <div
            className="flex-1 overflow-y-auto flex justify-center"
            style={{ maxHeight: "calc(100vh - 64px)" }}
          >
            <div
              style={{
                position: "relative",
                height: `${Math.ceil(labels.length / 2) * 49.5}mm`,
                width: `${2 * 105}mm`,
              }}
            >
              {labels.map((label, index) => {
                const rowIndex = Math.floor(index / 2);
                const colIndex = index % 2;
                const top = `${rowIndex * 49.5}mm`;
                const left = `${colIndex * 105}mm`;

                return (
                  <div
                    key={label.id}
                    style={{
                      position: "absolute",
                      top: top,
                      left: left,
                    }}
                  >
                    <Label
                      projectName={projectName}
                      title={label.title}
                      imageUrl={label.imageUrl}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
