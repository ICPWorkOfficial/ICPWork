"use client";

import React from 'react';
import FilesUploader from '@/components/FilesUploader';
import ProjectFlowRightPanel from '@/components/ProjectFlowRightPanel';

type Project = {
  id: string;
  title?: string;
  description?: string;
  tier?: string;
  type?: string;
  price?: string;
  orderedOn?: string;
  image?: string;
  status?: string;
  client?: { name: string; email?: string };
};

export default function ProjectFlowView({ project: initialProject, onUpdate }: { project: Project; onUpdate?: (p: Project) => void }) {
  const [project, setProject] = React.useState<Project>(initialProject);
  const statusNorm = (project.status || '').toLowerCase();
  const isInProgress = ['in-progress', 'new', 'pending', 'work-pending'].includes(statusNorm) || statusNorm.includes('pend');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Service Flow — {project.title}</h1>
      <div className="text-sm text-gray-600 mb-6">Client: {project.client?.name} • Ordered on {project.orderedOn ? new Date(project.orderedOn).toLocaleString() : ''}</div>

      <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="font-semibold mb-4">Timeline</h2>
        <div className="relative">
          <div className="absolute left-6 right-6 top-5 h-1 bg-green-200"></div>
          <div className="flex items-center justify-between relative z-10">
            {['Payment In Escrow', 'Order Placed', 'Work Completion', 'Revision', 'Project Completion'].map((step, i) => {
              const completed = i <= 1;
              return (
                <div key={step} className="flex flex-col items-center text-center w-1/5 px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completed ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                    {completed ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"/></svg> : <div className="text-sm">{i + 1}</div>}
                  </div>
                  <div className="mt-2 text-sm font-medium">{step}</div>
                  <div className="text-xs text-gray-500 mt-1">{completed ? 'Completed' : 'Pending'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="flex gap-6">
        <div className="flex-1">
          {statusNorm === 'revision' && (
            <FilesUploader projectId={project.id} showRevision initialFiles={["design-v1.png"]} revisionText={"Please update the layout to match the spec."} onUpdate={(p) => { setProject(p); onUpdate?.(p); }} />
          )}

          {isInProgress && (
            <>
              <FilesUploader projectId={project.id} initialFiles={["initial-setup.zip"]} showRevision={false} onUpdate={(p) => setProject(p)} />
              <div className="mt-4">
                <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={async () => {
                  try {
                    const res = await fetch('/api/projects', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: project.id, status: 'completed' }) });
                    const json = await res.json();
                    if (json?.ok) { setProject(json.project); onUpdate?.(json.project); }
                  } catch (e) { console.error(e); }
                }}>Mark as Complete</button>
              </div>
            </>
          )}

          {statusNorm === 'completed' && (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-semibold text-green-600 mb-3">Project Successfully Completed</div>
              <div className="mb-4">Thanks — the project workflow is finished.</div>
              <div className="flex justify-center gap-3">
                <button onClick={async () => {
                  // demo: mark dispute (no-op server-side in this demo)
                  alert('Raise dispute flow (demo)');
                }} className="px-4 py-2 border rounded">Raise a Dispute</button>
                <button onClick={async () => {
                  // demo: ask for review — for now just alert
                  alert('Ask for review (demo)');
                }} className="px-4 py-2 bg-indigo-600 text-white rounded">Ask for Review</button>
              </div>
            </div>
          )}
        </div>

  <ProjectFlowRightPanel project={{ id: project.id, title: project.title || '', price: project.price || '', tier: project.tier || '', status: project.status || '', image: project.image || '' }} />
      </div>
    </div>
  );
}
