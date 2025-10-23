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
  const [printCopies, setPrintCopies] = useState<number>(1);

  const labelListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const STORAGE_KEY = 'plc:state:v1';

  const selectedLabel = labels.find((l) => l.id === selectedLabelId) ?? null;
  const [currentPage, setCurrentPage] = useState<number>(0);

  // helper: split labels into pages of 12
  const pageSize = 12;
  
  // Create expanded labels array based on print copies
  const expandedLabels = React.useMemo(() => {
    if (printCopies <= 1) return labels;
    
    const expanded: IndividualLabel[] = [];
    for (let copy = 0; copy < printCopies; copy++) {
      labels.forEach((label) => {
        expanded.push({
          ...label,
          id: `${label.id}-copy-${copy}` // Ensure unique IDs for each copy
        });
      });
    }
    
    // Fill up to complete pages (12 labels per page)
    const remainder = expanded.length % pageSize;
    if (remainder > 0) {
      const fillerCount = pageSize - remainder;
      const lastLabel = labels[labels.length - 1];
      for (let i = 0; i < fillerCount; i++) {
        expanded.push({
          ...lastLabel,
          id: `${lastLabel.id}-filler-${i}`
        });
      }
    }
    
    return expanded;
  }, [labels, printCopies]);
  
  const pages: IndividualLabel[][] = [];
  for (let i = 0; i < expandedLabels.length; i += pageSize) {
    pages.push(expandedLabels.slice(i, i + pageSize));
  }

  // keep currentPage in-range when labels/pages change
  useEffect(() => {
    if (pages.length === 0) {
      setCurrentPage(0);
      return;
    }
    setCurrentPage((cur) => Math.max(0, Math.min(cur, pages.length - 1)));
  }, [pages.length]);

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
          const initial: IndividualLabel[] = [{ id: `label-${Date.now()}`, title: '<p>Custom Collector\'s Edition</p>', imageUrl: '', titleFontSize: 13 }];
          setLabels(initial);
          setSelectedLabelId(initial[0].id);
        }
        if (parsed.projectName) setProjectName(parsed.projectName);
      } else {
  const initial: IndividualLabel[] = [{ id: `label-${Date.now()}`, title: '<p>Custom Collector\'s Edition</p>', imageUrl: '', titleFontSize: 13 }];
        setLabels(initial);
        setSelectedLabelId(initial[0].id);
      }
    } catch (e) {
  const initial: IndividualLabel[] = [{ id: `label-${Date.now()}`, title: '<p>Custom Collector\'s Edition</p>', imageUrl: '', titleFontSize: 13 }];
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
    const id = `label-${Date.now()}`;
    const l: IndividualLabel = { id, title: '<p>New Label</p>', imageUrl: '', titleFontSize: 13 };
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
          <div className="flex justify-center gap-4 print-hidden items-center">
            <button onClick={() => setIsPrintPreview(false)} className="px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50 text-gray-800 font-semibold">
              Back to Editor
            </button>
            <div className="flex items-center gap-2 bg-white px-4 py-2 border rounded-md shadow-sm">
              <label htmlFor="print-copies" className="text-sm text-gray-600 font-medium">份数:</label>
              <input
                id="print-copies"
                type="number"
                min="1"
                max="100"
                value={printCopies}
                onChange={(e) => setPrintCopies(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-16 p-1 border rounded text-sm text-center"
              />
            </div>
            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white font-semibold border rounded-md shadow-sm hover:bg-blue-700">
              Print
            </button>
          </div>
          {/* Page navigator for multi-page preview (screen only) */}
          {(pages.length > 1 || printCopies > 1) && (
            <div className="col-span-full flex items-center justify-center gap-4 mt-4 print-hidden bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                总标签数: {expandedLabels.length} 个 | 总页数: {pages.length} 页
                {printCopies > 1 && (
                  <span className="ml-2 text-blue-600">
                    ({labels.length} 个标签 × {printCopies} 份
                    {expandedLabels.length > labels.length * printCopies && 
                      ` + ${expandedLabels.length - labels.length * printCopies} 个填充`}
                    )
                  </span>
                )}
              </div>
            </div>
          )}
          {pages.length > 1 && (
            <div className="col-span-full flex items-center justify-center gap-4 mt-4 print-hidden">
              <button
                className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Prev
              </button>
              <div>
                Page {currentPage + 1} / {pages.length}
              </div>
              <button
                className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
                disabled={currentPage === pages.length - 1}
              >
                Next
              </button>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Go to</label>
                <input
                  type="number"
                  min={1}
                  max={pages.length}
                  value={currentPage + 1}
                  onChange={(e) => {
                    const v = Number(e.target.value) - 1;
                    if (!isNaN(v)) setCurrentPage(Math.max(0, Math.min(pages.length - 1, v)));
                  }}
                  className="w-16 p-1 border rounded text-sm"
                />
              </div>
            </div>
          )}

          {/* Screen preview: show only the current A4 page */}
          <div className="bg-white rounded-lg shadow-lg print-hidden">
            <A4Page labels={pages[currentPage] ?? []} projectName={projectName} />
          </div>

          {/* Print-only content: render all pages for printing (hidden on screen) */}
          <div className="hidden print:block">
            {pages.map((p, idx) => (
              <div key={idx} style={{ pageBreakAfter: 'always' }} className="bg-white rounded-lg shadow-lg mb-6">
                <A4Page labels={p} projectName={projectName} />
              </div>
            ))}
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
              {/* Labels list removed from left panel — preview area now contains controls */}
              <button
                onClick={handleAddLabel}
                className="w-full mt-2 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
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
          <div className="lg:col-span-2 bg-gray-50 rounded-lg shadow-inner p-4 sm:p-8 overflow-visible flex flex-col items-center">
            <div
              className="origin-top"
              style={{
                position: "relative",
                height: `${Math.max(1, Math.ceil((pages[currentPage]?.length ?? 0) / 2)) * 49.5}mm`,
                width: `${2 * 105}mm`,
              }}
            >
              {pages.length === 0 ? (
                <div className="text-gray-500">No labels</div>
              ) : (
                // render only current page
                pages[currentPage].map((label, index) => {
                  const globalIndex = currentPage * pageSize + index;
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
                        zIndex: label.id === selectedLabelId ? 10 : 1,
                      }}
                    >
                      <div className="relative">
                        <Label
                          projectName={projectName}
                          title={label.title}
                          imageUrl={label.imageUrl}
                          id={label.id}
                          titleFontSize={label.titleFontSize}
                          isSelected={label.id === selectedLabelId}
                          onClick={() => setSelectedLabelId(label.id)}
                        />

                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            title="Copy label"
                            className="bg-white p-1 rounded shadow-sm hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newId = `label-${Date.now()}`;
                              const copy = { ...label, id: newId };
                              setLabels((s) => {
                                const arr = [...s];
                                arr.splice(globalIndex + 1, 0, copy);
                                return arr;
                              });
                              // select the new copy and navigate to its page
                              const newGlobalIndex = globalIndex + 1;
                              const newPage = Math.floor(newGlobalIndex / pageSize);
                              setCurrentPage(newPage);
                              setSelectedLabelId(newId);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          </button>
                          <button
                            title="Delete label"
                            className="bg-white p-1 rounded shadow-sm hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLabels((s) => {
                                const idx = s.findIndex((x) => x.id === label.id);
                                if (idx === -1) return s;
                                const arr = [...s];
                                arr.splice(idx, 1);
                                // determine next selected id
                                let nextSelected: string | null = null;
                                if (selectedLabelId === label.id) {
                                  // prefer the item that now occupies the deleted index, else previous
                                  if (arr[idx]) nextSelected = arr[idx].id;
                                  else if (arr[idx - 1]) nextSelected = arr[idx - 1].id;
                                  else nextSelected = null;
                                } else {
                                  nextSelected = selectedLabelId;
                                }
                                // update currentPage to keep selected in view
                                if (nextSelected) {
                                  const newIdx = arr.findIndex((x) => x.id === nextSelected);
                                  if (newIdx >= 0) setCurrentPage(Math.floor(newIdx / pageSize));
                                } else {
                                  setCurrentPage(0);
                                }
                                // update selectedLabelId outside setLabels to avoid stale closure
                                setSelectedLabelId(nextSelected);
                                return arr;
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        </div>
                    </div>

                    
                    </div>
                  );
                })
              )}
            </div>

            {/* Editor preview bottom navigator (visible on screen, hidden in print) */}
            {pages.length > 1 && (
              <div className="w-full flex items-center justify-center gap-4 mt-4 print-hidden">
                <button
                  className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Prev
                </button>
                <div>
                  Page {currentPage + 1} / {pages.length}
                </div>
                <button
                  className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
                  disabled={currentPage === pages.length - 1}
                >
                  Next
                </button>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Go to</label>
                  <input
                    type="number"
                    min={1}
                    max={pages.length}
                    value={currentPage + 1}
                    onChange={(e) => {
                      const v = Number(e.target.value) - 1;
                      if (!isNaN(v)) setCurrentPage(Math.max(0, Math.min(pages.length - 1, v)));
                    }}
                    className="w-16 p-1 border rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
