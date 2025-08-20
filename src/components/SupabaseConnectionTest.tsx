import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Database, User, HardDrive } from 'lucide-react';

interface ConnectionStatus {
  auth: 'connected' | 'disconnected' | 'testing';
  database: 'connected' | 'disconnected' | 'testing';
  storage: 'connected' | 'disconnected' | 'testing';
}

export const SupabaseConnectionTest = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    auth: 'testing',
    database: 'testing',
    storage: 'testing'
  });
  const [user, setUser] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuth = async () => {
    try {
      setStatus(prev => ({ ...prev, auth: 'testing' }));
      addResult('Testing authentication...');
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        addResult(`Auth error: ${error.message}`);
        setStatus(prev => ({ ...prev, auth: 'disconnected' }));
        return;
      }
      
      setUser(user);
      if (user) {
        addResult(`Authenticated as: ${user.email}`);
        setStatus(prev => ({ ...prev, auth: 'connected' }));
      } else {
        addResult('No authenticated user');
        setStatus(prev => ({ ...prev, auth: 'disconnected' }));
      }
    } catch (error) {
      addResult(`Auth test failed: ${error}`);
      setStatus(prev => ({ ...prev, auth: 'disconnected' }));
    }
  };

  const testDatabase = async () => {
    try {
      setStatus(prev => ({ ...prev, database: 'testing' }));
      addResult('Testing database connection...');
      
      const { data, error } = await supabase
        .from('clothing_items')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        addResult(`Database error: ${error.message}`);
        setStatus(prev => ({ ...prev, database: 'disconnected' }));
        return;
      }
      
      addResult(`Database connected. Found ${data?.length || 0} clothing items`);
      setStatus(prev => ({ ...prev, database: 'connected' }));
    } catch (error) {
      addResult(`Database test failed: ${error}`);
      setStatus(prev => ({ ...prev, database: 'disconnected' }));
    }
  };

  const testStorage = async () => {
    try {
      setStatus(prev => ({ ...prev, storage: 'testing' }));
      addResult('Testing storage connection...');
      
      const { data, error } = await supabase.storage
        .from('clothing-images')
        .list('', { limit: 1 });
      
      if (error) {
        addResult(`Storage error: ${error.message}`);
        setStatus(prev => ({ ...prev, storage: 'disconnected' }));
        return;
      }
      
      addResult(`Storage connected. Found ${data?.length || 0} files`);
      setStatus(prev => ({ ...prev, storage: 'connected' }));
    } catch (error) {
      addResult(`Storage test failed: ${error}`);
      setStatus(prev => ({ ...prev, storage: 'disconnected' }));
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testAuth();
    await testDatabase();
    await testStorage();
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Auth</span>
            {getStatusIcon(status.auth)}
            <Badge className={getStatusColor(status.auth)}>
              {status.auth}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">Database</span>
            {getStatusIcon(status.database)}
            <Badge className={getStatusColor(status.database)}>
              {status.database}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span className="text-sm font-medium">Storage</span>
            {getStatusIcon(status.storage)}
            <Badge className={getStatusColor(status.storage)}>
              {status.storage}
            </Badge>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">Authenticated User:</p>
            <p className="text-sm text-green-600">{user.email}</p>
            <p className="text-xs text-green-500">ID: {user.id}</p>
          </div>
        )}

        {/* Test Controls */}
        <div className="flex gap-2">
          <Button onClick={runAllTests} size="sm">
            Run All Tests
          </Button>
          <Button onClick={testAuth} variant="outline" size="sm">
            Test Auth
          </Button>
          <Button onClick={testDatabase} variant="outline" size="sm">
            Test Database
          </Button>
          <Button onClick={testStorage} variant="outline" size="sm">
            Test Storage
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Test Results:</h4>
            <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <p key={index} className="text-xs font-mono text-gray-700">
                  {result}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};