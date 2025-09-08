"use client";

import React, { useState } from 'react';

type Props = {
  projectId?: string;
  initialFiles?: string[];
  showRevision?: boolean;
  revisionText?: string;
  onUpdate?: (project: any) => void;
};

export default function FilesUploader({ projectId, initialFiles = [], showRevision = false, revisionText, onUpdate }: Props) {
  const [files, setFiles] = useState<string[]>(initialFiles);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<FileList | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelected(e.target.files);
  }

  async function handleSubmit() {
    let names: string[] = [];
    if (selected && selected.length > 0) {
      names = Array.from(selected).map((f) => f.name);
      setFiles((s) => [...names, ...s]);
    }

    // call API to persist files and advance status to 'in-progress' (demo)
    if (projectId) {
      try {
  const res = await fetch('/api/projects', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: projectId, status: 'in-progress', files: names })
        });
        const json = await res.json();
        if (json?.ok && onUpdate) onUpdate(json.project);
      } catch (e) {
        console.error('failed to update project', e);
      }
    }

    setModalOpen(false);
    setSelected(null);
  }

  return (
    <div>
      {showRevision && (
        <div className="p-4 border rounded mb-4">
          <div className="font-medium">Revision requested</div>
          <div className="text-sm text-gray-600 mt-1">{revisionText || 'Client requested changes. Please upload revised files.'}</div>

          <div className="mt-3 flex items-center gap-3">
            <label className="px-3 py-2 bg-white border rounded cursor-pointer">
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
              Select file(s)
            </label>
            <button onClick={() => setModalOpen(true)} className="px-3 py-2 bg-[#041D37] text-white rounded">Submit Project</button>
          </div>
        </div>
      )}

      {!showRevision && (
        <div className="p-4 border rounded mb-4">
          <div className="font-medium">Submit Work</div>
          <div className="text-sm text-gray-600 mt-1">Upload files when you are ready to submit work.</div>
          <div className="mt-3">
            <label className="px-3 py-2 bg-white border rounded cursor-pointer">
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
              Select file(s)
            </label>
            <button onClick={() => setModalOpen(true)} className="ml-3 px-3 py-2 bg-[#041D37] text-white rounded">Submit Files</button>
          </div>
        </div>
      )}

      {/* Recent files list on page */}
      <div className="mb-4">
        <div className="font-medium mb-2">Recent Files</div>
        <ul className="space-y-1 text-sm text-gray-700">
          {files.length === 0 && <li className="text-gray-400">No files yet.</li>}
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between">
              <span>{f}</span>
              <span className="text-xs text-gray-500">Just now</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Submit your file</h3>
            <div className="text-sm text-gray-600 mb-4">Confirm files to submit:</div>
            <div className="mb-4 max-h-40 overflow-auto border rounded p-2">
              {selected && selected.length > 0 ? (
                <ul className="space-y-1">
                  {Array.from(selected).map((f, i) => <li key={i} className="text-sm">{f.name}</li>)}
                </ul>
              ) : (
                <div className="text-sm text-gray-400">No files selected. Use the Select file(s) control on the page.</div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={handleSubmit} className="px-3 py-1 bg-green-600 text-white rounded">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
