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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-sm sm:text-2xl font-bold mb-2 "> {project.description}</h1>
      <div className="text-xs sm:text-sm text-gray-600 mb-6">Client: {project.client?.name} <br/> Ordered on {project.orderedOn ? new Date(project.orderedOn).toLocaleString() : ''}</div>

      <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6">
        {/* Timeline (driven from project.status) */}
        {/* <div className="mb-4 text-sm text-gray-700">Timeline</div> */}
        <div>
          {/* derive steps and index from status */}
          {(() => {
            const steps = ['Payment In Escrow', 'Order Placed', 'Work Completion', 'Revision', 'Project Completion'];
            const s = (project.status || '').toLowerCase();
            const statusToIndex = (st: string) => {
              if (!st) return 0;
              if (st.includes('new') || st.includes('escrow')) return 0;
              if (st.includes('pending') && !st.includes('work')) return 1;
              if (st.includes('in-progress') || st.includes('work')) return 2;
              if (st.includes('revision')) return 3;
              if (st.includes('complete')) return 4;
              if (st.includes('completed')) return 4;
              return 0;
            };
            const completedIndex = statusToIndex(s);

            return (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6">
                {steps.map((step, i) => {
                  const completed = i <= completedIndex;
                  const circleClass = completed ? 'bg-green-800 text-white' : 'bg-white hidden sm:block border border-gray-200 text-gray-600';
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center text-center md:text-center">
                        <div className={`relative z-20 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${circleClass}`}>
                          {completed ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"/></svg>
                          ) : (
                            <div className="text-xs md:text-sm">{i + 1}</div>
                          )}
                        </div>
                        <div className="mt-2 text-xs md:text-sm font-medium max-w-[120px] md:max-w-[220px] break-words">{step}</div>
                        <div className="text-xs text-gray-500 mt-1">{completed ? 'Completed' : 'Pending'}</div>
                      </div>

                      {i < steps.length - 1 && (
                        <div className={`${i < completedIndex ? 'bg-green-800' : 'bg-green-200'} w-1 h-6 md:mx-auto my-2 md:w-auto md:h-1 md:flex-1 md:mx-4`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {statusNorm === 'revision' && (
            <FilesUploader projectId={project.id} showRevision initialFiles={["design-v1.png"]} revisionText={"Please update the layout to match the spec."} onUpdate={(p) => { setProject(p); onUpdate?.(p); }} />
          )}

          {isInProgress && (
            <>
              <FilesUploader projectId={project.id} initialFiles={["initial-setup.zip"]} showRevision={false} onUpdate={(p) => setProject(p)} />
            
            </>
          )}

          {statusNorm === 'completed' && (
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm ">
              <div className="text-3xl sm:text-4xl font-semibold text-green-600 mb-3">Project Successfully Completed</div>
              <div className="mb-4 max-w-xl">Joining our network starts with an application. We meticulously review your expertise, portfolio, and professional background.</div>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button onClick={async () => {
                  // demo: mark dispute (no-op server-side in this demo)
                  alert('Raise dispute flow (demo)');
                }} className="px-4 py-2 border-2 border-gray-400 text-gray-600 rounded cursor-pointer rounded-full">Raise a Dispute</button>
               
                <button onClick={async () => {
                  // demo: ask for review — for now just alert
                  alert('Ask for review (demo)');
                }} className="px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer rounded-full" style={{ background: 'linear-gradient(90deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)' }}>Ask for Review</button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-1/3">
          <ProjectFlowRightPanel project={{ id: project.id, title: project.title || '', price: project.price || '', tier: project.tier || '', status: project.status || '', image: project.image || '' }} />
        </div>
      </div>
    </div>
  );
}
