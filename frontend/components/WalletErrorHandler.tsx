"use client";
import React from 'react';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface WalletErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  walletType?: string;
}

export function WalletErrorHandler({ error, onRetry, walletType }: WalletErrorHandlerProps) {
  if (!error) return null;

  const getErrorInfo = (errorMessage: string) => {
    // Handle specific error types
    if (errorMessage.includes('User closed modal') || errorMessage.includes('cancelled by user')) {
      return {
        type: 'user_cancelled',
        title: 'Connection Cancelled',
        message: 'You cancelled the wallet connection. You can try again anytime.',
        showRetry: true,
        showHelp: false
      };
    }

    if (errorMessage.includes('not installed')) {
      return {
        type: 'not_installed',
        title: 'Wallet Not Installed',
        message: `Please install ${walletType || 'the wallet'} to continue.`,
        showRetry: false,
        showHelp: true,
        helpUrl: walletType === 'Plug Wallet' ? 'https://plugwallet.ooo/' : 
                 walletType === 'Stoic Wallet' ? 'https://www.stoicwallet.com/' : null
      };
    }

    if (errorMessage.includes('getAccountId is not a function')) {
      return {
        type: 'api_error',
        title: 'Wallet API Error',
        message: 'The wallet API has changed. Please try updating your wallet extension.',
        showRetry: true,
        showHelp: true,
        helpUrl: walletType === 'Plug Wallet' ? 'https://plugwallet.ooo/' : 
                 walletType === 'Stoic Wallet' ? 'https://www.stoicwallet.com/' : null
      };
    }

    if (errorMessage.includes('Invalid Principal')) {
      return {
        type: 'principal_error',
        title: 'Connection Error',
        message: 'There was an issue with the wallet connection. Please try again.',
        showRetry: true,
        showHelp: false
      };
    }

    if (errorMessage.includes('rejected')) {
      return {
        type: 'rejected',
        title: 'Connection Rejected',
        message: 'The wallet connection was rejected. Please try again.',
        showRetry: true,
        showHelp: false
      };
    }

    // Default error
    return {
      type: 'generic',
      title: 'Connection Error',
      message: 'An unexpected error occurred. Please try again.',
      showRetry: true,
      showHelp: false
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-red-900 mb-1">{errorInfo.title}</h4>
          <p className="text-red-700 text-sm mb-3">{errorInfo.message}</p>
          
          <div className="flex items-center space-x-3">
            {errorInfo.showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
              >
                <RefreshCw size={14} className="mr-1" />
                Try Again
              </button>
            )}
            
            {errorInfo.showHelp && errorInfo.helpUrl && (
              <a
                href={errorInfo.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
              >
                <ExternalLink size={14} className="mr-1" />
                Get Help
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
