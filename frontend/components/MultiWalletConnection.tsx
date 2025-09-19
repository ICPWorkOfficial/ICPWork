"use client";
import React, { useState, useEffect } from 'react';
import { WalletSelector } from './WalletSelector';
import { walletManager, WalletConnection as WalletConnectionType } from '@/lib/wallet-connector';

interface MultiWalletConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
  onBalanceChange?: (balance: number) => void;
  className?: string;
}

export function MultiWalletConnection({ 
  onConnectionChange, 
  onBalanceChange,
  className = ""
}: MultiWalletConnectionProps) {
  const [currentConnection, setCurrentConnection] = useState<WalletConnectionType | null>(null);

  const handleConnectionChange = (connection: WalletConnectionType | null) => {
    setCurrentConnection(connection);
    onConnectionChange?.(!!connection);
  };

  const handleBalanceChange = (balance: number) => {
    onBalanceChange?.(balance);
  };

  return (
    <WalletSelector
      onConnectionChange={handleConnectionChange}
      onBalanceChange={handleBalanceChange}
      className={className}
    />
  );
}
