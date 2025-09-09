"use client";

import React from 'react';

type Props = {
  project: {
    id: string;
    title: string;
    price: string;
    tier?: string;
    status?: string;
    image?: string;
  };
};

export default function ProjectFlowRightPanel({ project }: Props) {
  return (
    <aside className="w-80 ml-6">
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex items-center gap-3">
        <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center">{project.image ? <img src={project.image} alt="img" className="w-full h-full object-cover rounded" /> : 'IMG'}</div>
        <div>
          <div className="font-medium">{project.title}</div>
          <div className="text-sm text-gray-500">{project.tier || 'Standard'}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="text-sm text-gray-500">Order details</div>
        <div className="mt-3">
          <div className="flex justify-between text-sm"><span>Price</span><span className="font-medium">{project.price}</span></div>
          <div className="flex justify-between text-sm mt-2"><span>Status</span><span className="font-medium">{project.status || 'pending'}</span></div>
          <div className="flex justify-between text-sm mt-2"><span>Submission</span><span className="font-medium">Done</span></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm text-gray-500">Recent activity</div>
        <ul className="mt-3 text-sm space-y-2 text-gray-700">
          <li>File uploaded — <span className="text-xs text-gray-500">2 hours ago</span></li>
          <li>Revision requested — <span className="text-xs text-gray-500">1 day ago</span></li>
        </ul>
      </div>
    </aside>
  );
}
