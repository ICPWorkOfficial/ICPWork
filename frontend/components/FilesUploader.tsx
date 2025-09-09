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
  const [selected, setSelected] = useState<File[]>([]);
  const [comment, setComment] = useState<string>('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setSelected(Array.from(e.target.files));
  }

  function removeSelected(index: number) {
    setSelected(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    let names: string[] = [];
    if (selected && selected.length > 0) {
      names = selected.map((f) => f.name);
      setFiles((s) => [...names, ...s]);
    }

    // call API to persist files and advance status to 'in-progress' (demo)
  if (projectId) {
      try {
  const res = await fetch('/api/projects', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, status: 'in-progress', files: names, comment })
        });
        const json = await res.json();
        if (json?.ok && onUpdate) onUpdate(json.project);
      } catch (e) {
        console.error('failed to update project', e);
      }
    }

  setModalOpen(false);
  setSelected([]);
  setComment('');
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
            <label className="px-5 py-2 bg-white border-2 border-gray-400 text-gray-600 rounded-full cursor-pointer">
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
              Select file(s)
            </label>
            <button onClick={() => setModalOpen(true)} className="ml-3 px-5 py-2 bg-[#041D37] text-white rounded-full "  style={{ background: 'linear-gradient(90deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)' }}>Submit Files</button>
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
            <h3 className="text-lg font-semibold mb-2 text-center">Submit Your Revised</h3>
            {/* <div className="text-sm text-gray-600 mb-4">Confirm files to submit:</div> */}
            <div className="mb-4 max-h-40 overflow-auto border rounded p-2">
              {selected && selected.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selected.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                      <span className="max-w-[180px] truncate">{f.name}</span>
                      <button onClick={() => removeSelected(i)} className="text-gray-500 hover:text-gray-800">✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400">No files selected. Use the Select file(s) control on the page.</div>
              )}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full border rounded p-2 text-sm" placeholder="Add a comment to send with the files (optional)" />
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <button onClick={() => setModalOpen(false)} className="px-3 py-1 border border-gray-600 text-gray-600 rounded-full">Cancel</button>
              <button onClick={handleSubmit} className="px-5 py-1 bg-green-600 text-white rounded-full" style={{ background: 'linear-gradient(90deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)' }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
