'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { demoAPI } from '@/lib/canister-connections';

export default function DemoPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDemo = async (demoType: string) => {
    setIsRunning(true);
    setResults([]);
    
    // Override console.log to capture demo output
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      addResult(args.join(' '));
    };

    try {
      switch (demoType) {
        case 'auth':
          await demoAPI.demoAuth();
          break;
        case 'freelancer':
          await demoAPI.demoFreelancer('demo-session-id');
          break;
        case 'client':
          await demoAPI.demoClient('demo-session-id');
          break;
        case 'escrow':
          await demoAPI.demoEscrow();
          break;
        case 'workstore':
          await demoAPI.demoWorkStore();
          break;
        case 'all':
          await demoAPI.runAllDemos();
          break;
      }
    } catch (error) {
      addResult(`Error: ${error}`);
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ICP Canister Demo</h1>
          <p className="text-gray-600">
            Test all canister connections and functionality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test signup, login, session management
              </p>
              <Button 
                onClick={() => runDemo('auth')}
                disabled={isRunning}
                className="w-full"
              >
                Run Auth Demo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Freelancer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test freelancer profile management
              </p>
              <Button 
                onClick={() => runDemo('freelancer')}
                disabled={isRunning}
                className="w-full"
              >
                Run Freelancer Demo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test client profile management
              </p>
              <Button 
                onClick={() => runDemo('client')}
                disabled={isRunning}
                className="w-full"
              >
                Run Client Demo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escrow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test payment and escrow functionality
              </p>
              <Button 
                onClick={() => runDemo('escrow')}
                disabled={isRunning}
                className="w-full"
              >
                Run Escrow Demo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Store</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test project management
              </p>
              <Button 
                onClick={() => runDemo('workstore')}
                disabled={isRunning}
                className="w-full"
              >
                Run Work Store Demo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Demos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Run all canister demos
              </p>
              <Button 
                onClick={() => runDemo('all')}
                disabled={isRunning}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Run All Demos
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demo Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500">Click a demo button to see results...</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
            {isRunning && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Running demo...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
