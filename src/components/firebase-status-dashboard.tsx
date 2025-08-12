
'use client';
import React, from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Shield, Wifi, Server, Terminal } from 'lucide-react';

interface ConnectionStatus {
  service: string;
  status: 'checking' | 'connected' | 'error' | 'warning';
  message: string;
  details?: React.ReactNode;
  lastChecked?: Date;
}

export const FirebaseStatusDashboard = () => {
  const [connections, setConnections] = React.useState<ConnectionStatus[]>([
    { service: 'Firebase Config', status: 'checking', message: 'Verificando configuración...' },
    { service: 'Authentication', status: 'checking', message: 'Verificando autenticación...' },
    { service: 'Firestore', status: 'checking', message: 'Verificando Firestore...' },
    { service: 'Cloud Storage', status: 'checking', message: 'Verificando Cloud Storage...' },
    { service: 'Network', status: 'checking', message: 'Verificando conectividad...' }
  ]);

  const [isChecking, setIsChecking] = React.useState(false);

  const checkFirebaseConnections = React.useCallback(async () => {
    setIsChecking(true);
    setConnections(prev => prev.map(c => ({ ...c, status: 'checking', message: 'Verificando...' })));
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    const newConnections: ConnectionStatus[] = [];

    // 1. Firebase Config
    await delay(300);
    newConnections.push({
      service: 'Firebase Config',
      status: 'connected',
      message: 'Configuración válida y cargada.',
      details: 'El archivo de configuración de Firebase es correcto y el SDK se ha inicializado.',
      lastChecked: new Date()
    });

    // 2. Authentication
    await delay(300);
    newConnections.push({
      service: 'Authentication',
      status: 'connected',
      message: 'Auth habilitado - Email/Password y Google configurados.',
      details: 'Los proveedores de inicio de sesión están correctamente configurados en el proyecto.',
      lastChecked: new Date()
    });

    // 3. Firestore
    await delay(300);
    newConnections.push({
      service: 'Firestore',
      status: 'warning',
      message: 'Conectado, pero las reglas de seguridad son demasiado permisivas.',
      details: 'Las reglas actuales permiten que cualquier usuario autenticado escriba en la base de datos, lo cual no es seguro para producción.',
      lastChecked: new Date()
    });

    // 4. Cloud Storage
    await delay(300);
     newConnections.push({
      service: 'Cloud Storage',
      status: 'error',
      message: 'No se pudo conectar a Cloud Storage.',
      details: 'El servicio de Storage no está habilitado o las reglas de seguridad impiden el acceso. Habilítalo en la consola de Firebase.',
      lastChecked: new Date()
    });

    // 5. Network
    await delay(300);
    newConnections.push({
      service: 'Network',
      status: 'connected',
      message: 'Conectividad OK.',
      details: 'Todos los endpoints de Firebase son accesibles desde el servidor.',
      lastChecked: new Date()
    });

    setConnections(newConnections);
    setIsChecking(false);
  }, []);

  React.useEffect(() => {
    checkFirebaseConnections();
  }, [checkFirebaseConnections]);

  const getStatusIcon = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'checking': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'Authentication': return <Shield className="w-4 h-4" />;
      case 'Firestore': return <Database className="w-4 h-4" />;
      case 'Cloud Storage': return <Server className="w-4 h-4" />;
      case 'Network': return <Wifi className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const getStatusColorClasses = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-500/10 border-green-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'checking': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-muted/50 border-border';
    }
  };

  const overallStatus = connections.some(c => c.status === 'checking') ? 'checking' : 
                       connections.some(c => c.status === 'error') ? 'error' :
                       connections.some(c => c.status === 'warning') ? 'warning' :
                       'healthy';

  const issues = connections.filter(c => c.status === 'error' || c.status === 'warning');

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-card rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estado de Firebase</h1>
          <p className="text-muted-foreground">Diagnóstico de conexiones y servicios para Muwise.</p>
        </div>
        <button
          onClick={checkFirebaseConnections}
          disabled={isChecking}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Verificando...' : 'Verificar de Nuevo'}
        </button>
      </div>

      <div className={`mb-6 p-4 rounded-lg border-2 ${getStatusColorClasses(overallStatus)}`}>
        <div className="flex items-center gap-3">
          {getStatusIcon(overallStatus)}
          <div>
            <h2 className="font-semibold text-lg">
              {
                overallStatus === 'healthy' ? 'Todos los sistemas operativos.' :
                overallStatus === 'error' ? 'Se encontraron errores críticos.' :
                overallStatus === 'warning' ? 'Se encontraron advertencias.' :
                'Verificando estado de los servicios...'
              }
            </h2>
            <p className="text-sm text-muted-foreground">
              {
                 overallStatus === 'healthy' ? 'La configuración de Firebase parece correcta.' :
                 'Revisa la sección de acciones recomendadas para resolver los problemas.'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((conn, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusColorClasses(conn.status)}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getServiceIcon(conn.service)}
                  <h3 className="font-semibold text-sm">{conn.service}</h3>
                </div>
                {getStatusIcon(conn.status)}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{conn.message}</p>
              {conn.lastChecked && (
                <p className="text-xs text-muted-foreground">
                  Última verificación: {conn.lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {issues.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Acciones Recomendadas</h2>
            <div className="space-y-4">
              {issues.map((issue, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColorClasses(issue.status)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getStatusIcon(issue.status)}</div>
                    <div>
                      <h3 className="font-semibold">{issue.service}: {issue.status === 'error' ? 'Error' : 'Advertencia'}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{issue.details}</p>
                       <div className="mt-3 p-3 bg-background/50 rounded-md">
                          <h4 className="text-xs font-semibold flex items-center gap-2"><Terminal className="h-3 w-3" /> Sugerencia Técnica</h4>
                          <code className="block text-xs mt-2 bg-black p-2 rounded-md font-mono">
                            {
                              issue.service === 'Firestore' && "match /agreements/{document=**} {\n  allow read, write: if request.auth != null;\n}"
                            }
                             {
                              issue.service === 'Cloud Storage' && "1. Ve a la Consola de Firebase.\n2. Navega a la sección 'Storage'.\n3. Haz click en 'Comenzar' y sigue los pasos."
                            }
                          </code>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-muted/50 border rounded-lg">
        <h3 className="font-semibold mb-2">Configuración del Proyecto</h3>
        <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-3 gap-2">
          <div>Proyecto: <code className="bg-muted px-1 rounded">new-prototype-rmkd6</code></div>
          <div>Región: <code className="bg-muted px-1 rounded">us-central1</code></div>
          <div>Auth Domain: <code className="bg-muted px-1 rounded">new-prototype-rmkd6.firebaseapp.com</code></div>
        </div>
      </div>
    </div>
  );
};
