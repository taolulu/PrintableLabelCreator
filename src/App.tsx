import { useState, useEffect, useRef } from "react";
import { Label } from "./components/Label";
import { LabelEditor } from "./components/LabelEditor";

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

  const labelListRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectedLabel = labels.find((label) => label.id === selectedLabelId);
  const MAX_LABELS = 12;

  // Effect to scroll the selected label into view in the list
  useEffect(() => {
    if (selectedLabelId) {
      const selectedElement = labelListRefs.current[selectedLabelId];
      selectedElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedLabelId]);

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
    <main className="bg-slate-100 min-h-screen w-full p-4 sm:p-8">
      {isPrintPreview ? (
        <div id="print-area" className="flex flex-col items-center gap-8">
          <div className="flex justify-center gap-4 print-hidden">
            <button onClick={() => setIsPrintPreview(false)} className="px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50 text-gray-800 font-semibold">
              Back to Editor
            </button>
            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white font-semibold border rounded-md shadow-sm hover:bg-blue-700">
              Print
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-lg">
            <A4Page labels={labels} projectName={projectName} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left side: Controls */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800">My Labels</h2>
              <div className="flex-1 overflow-y-auto pr-2 -mr-2" style={{ maxHeight: "35vh" }}>
                {labels.map((label) => (
                  <div
                    key={label.id}
                    ref={(el) => (labelListRefs.current[label.id] = el)}
                    className={`group p-3 rounded-lg mb-2 cursor-pointer flex justify-between items-center transition-colors ${
                      selectedLabelId === label.id
                        ? "bg-blue-100 shadow-inner"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedLabelId(label.id)}
                  >
                    <span className="truncate flex-1 pr-2 font-medium text-gray-700">{label.title}</span>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLabel(label.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-red-500"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddLabel}
                disabled={labels.length >= MAX_LABELS}
                className="w-full mt-2 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors disabled:opacity-50"
              >
                Add Label
              </button>
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
              <div className="w-full text-center text-gray-500 bg-white p-8 rounded-lg shadow-md">
                Select a label to edit or add a new one.
              </div>
            )}
             <button onClick={() => setIsPrintPreview(true)} className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-lg">
              Go to Print Preview
            </button>
          </div>

          {/* Right side: All Labels Preview */}
          <div className="lg:col-span-2 bg-gray-50 rounded-lg shadow-inner p-4 sm:p-8 overflow-y-auto flex justify-center items-start"
            style={{ maxHeight: "calc(100vh - 64px)" }}
          >
            <div
              className="origin-top"
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
                      zIndex: label.id === selectedLabelId ? 10 : 1, // Elevate selected label
                    }}
                  >
                    <Label
                      projectName={projectName}
                      title={label.title}
                      imageUrl={label.imageUrl}
                      isSelected={label.id === selectedLabelId}
                      onClick={() => setSelectedLabelId(label.id)}
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
