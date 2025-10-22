import React, { useState, useEffect, useRef } from "react";
import { Label } from "./components/Label";
import { LabelEditor } from "./components/LabelEditor";
import { A4Page } from "./components/A4Page";
import { stripHtmlTags } from "./components/ui/utils";
import { saveImageBlob, getImageBlob } from './lib/idbImages';

export interface IndividualLabel {
  id: string;
  title: string;
  imageUrl: string;
  titleFontSize?: number;
}

export default function App(): React.ReactElement {
  const [projectName, setProjectName] = useState<string>("Project Phoenix");
  const [labels, setLabels] = useState<IndividualLabel[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [isPrintPreview, setIsPrintPreview] = useState<boolean>(false);

  const labelListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const STORAGE_KEY = 'plc:state:v1';
  const MAX_LABELS = 12;

  const selectedLabel = labels.find((l) => l.id === selectedLabelId) ?? null;

  // Load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { projectName?: string; labels?: IndividualLabel[]; selectedLabelId?: string };
        if (parsed.labels && parsed.labels.length) {
          setLabels(parsed.labels);
          setSelectedLabelId(parsed.selectedLabelId ?? parsed.labels[0].id);
        } else {
          const initial: IndividualLabel[] = [{ id: `label-${Date.now()}`, title: '<p>Custom Collector\'s Edition</p>', imageUrl: '', titleFontSize: 16 }];
          setLabels(initial);
          setSelectedLabelId(initial[0].id);
        }
        if (parsed.projectName) setProjectName(parsed.projectName);
      } else {
  const initial: IndividualLabel[] = [{ id: `label-${Date.now()}`, title: '<p>Custom Collector\'s Edition</p>', imageUrl: '', titleFontSize: 16 }];
        setLabels(initial);
        setSelectedLabelId(initial[0].id);
      }
    } catch (e) {
  const initial: IndividualLabel[] = [{ id: `label-${Date.now()}`, title: '<p>Custom Collector\'s Edition</p>', imageUrl: '', titleFontSize: 16 }];
      setLabels(initial);
      setSelectedLabelId(initial[0].id);
    }
  }, []);

  // Persist with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ projectName, labels, selectedLabelId })); } catch {}
    }, 700);
    return () => clearTimeout(t);
  }, [projectName, labels, selectedLabelId]);

  // Auto-scroll selected label into view
  useEffect(() => {
    if (!selectedLabelId) return;
    const el = labelListRefs.current[selectedLabelId];
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedLabelId]);

  const handleAddLabel = () => {
    if (labels.length >= MAX_LABELS) return alert(`Max ${MAX_LABELS}`);
    const id = `label-${Date.now()}`;
  const l: IndividualLabel = { id, title: '<p>New Label</p>', imageUrl: '', titleFontSize: 16 };
    setLabels((s) => [...s, l]);
    setSelectedLabelId(id);
  };

  const handleDeleteLabel = (id: string) => {
    setLabels((s) => s.filter((x) => x.id !== id));
    setSelectedLabelId((cur) => (cur === id ? null : cur));
  };

  const handleUpdateSelectedLabel = (patch: Partial<Omit<IndividualLabel, 'id'>>, id?: string) => {
    const target = id ?? selectedLabelId;
    if (!target) return;
    setLabels((s) => s.map((l) => (l.id === target ? { ...l, ...patch } : l)));
  };

  const handlePrint = () => window.print();

  const blobToDataURL = (b: Blob) => new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(b);
  });

  const exportProject = async () => {
    try {
      const labelsCopy = await Promise.all(
        labels.map(async (l) => {
          const copy = { ...l } as IndividualLabel;
          if (copy.imageUrl?.startsWith('idb://')) {
            const id = copy.imageUrl.replace('idb://', '');
            try {
              const blob = await getImageBlob(id);
              if (blob) copy.imageUrl = await blobToDataURL(blob);
              else copy.imageUrl = '';
            } catch {
              copy.imageUrl = '';
            }
          }
          return copy;
        })
      );

      const payload = { plcExportVersion: 1, projectName, labels: labelsCopy, selectedLabelId };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(projectName || 'plc-export').replace(/[^a-z0-9-_.]/gi, '_').slice(0, 64)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert('Export failed');
    }
  };

  const handleImportFile = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { projectName?: string; labels?: IndividualLabel[]; selectedLabelId?: string };
      if (!parsed || !Array.isArray(parsed.labels)) return alert('Invalid file');
      const restored = await Promise.all(parsed.labels.map(async (lab) => {
        const copy = { ...lab } as IndividualLabel;
        if (copy.imageUrl?.startsWith('data:')) {
          try {
            const resp = await fetch(copy.imageUrl);
            const blob = await resp.blob();
            const id = await saveImageBlob(blob);
            copy.imageUrl = `idb://${id}`;
          } catch { copy.imageUrl = ''; }
        }
        return copy;
      }));
      setProjectName(parsed.projectName ?? projectName);
      setLabels(restored);
      setSelectedLabelId(parsed.selectedLabelId ?? restored[0]?.id ?? null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert('Import failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Keep a ref to latest labels so we can revoke object URLs on unmount only.
  const labelsRef = useRef<IndividualLabel[]>(labels);
  useEffect(() => {
    labelsRef.current = labels;
  }, [labels]);

  useEffect(() => {
    return () => {
      // On unmount, revoke any blob URLs that were created during the session.
      labelsRef.current.forEach((label) => {
        if (label.imageUrl && label.imageUrl.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(label.imageUrl);
          } catch (e) {
            // ignore
          }
        }
      });
    };
  }, []);

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
              <div className="flex gap-2">
                <button onClick={exportProject} className="flex-1 text-sm px-3 py-2 bg-white border rounded hover:bg-gray-50">Export</button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-sm px-3 py-2 bg-white border rounded hover:bg-gray-50">Import</button>
                <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
              </div>
              <div className="flex-1 overflow-y-auto pr-2 -mr-2" style={{ maxHeight: "35vh" }}>
                {labels.map((label) => (
                  <div
                    key={label.id}
                    ref={(el) => { labelListRefs.current[label.id] = el; }}
                    className={`group p-3 rounded-lg mb-2 cursor-pointer flex justify-between items-center transition-colors ${
                      selectedLabelId === label.id
                        ? "bg-blue-100 shadow-inner"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedLabelId(label.id)}
                  >
                    <span className="truncate flex-1 pr-2 font-medium text-gray-700">{stripHtmlTags(label.title)}</span>
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
                      id={label.id}
                      titleFontSize={label.titleFontSize}
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
