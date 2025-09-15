"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const ProfilePage = dynamic(() => import('../page'), { ssr: false });

export default function ProfileIdPage() {
  return <ProfilePage />;
}
