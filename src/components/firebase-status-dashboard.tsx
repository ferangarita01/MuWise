
'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Shield, Wifi, Server } from 'lucide-react';

interface ConnectionStatus {
  service: string;
  status: 'checking' | 'connected' | 'error' | 'warning';
  message: string;
  lastChecked?: Date;
}

export const FirebaseStatusDashboard = () => {
  const [connections, setConnections] = useState<ConnectionStatus[]>([
    { service: 'Firebase Config', status: 'checking', message: 'Verificando configuración...' },
    { service: 'Authentication', status: 'checking', message: 'Verificando autenticación...' },
    { service: 'Firestore', status: 'checking', message: 'Verificando Firestore...' },
    { service: 'Realtime Database', status: 'checking', message: 'Verificando Realtime DB...' },
    { service: 'Network', status: 'checking', message: 'Verificando conectividad...' }
  ]);

  const [isChecking, setIsChecking] = useState(false);

  // Simular verificación de Firebase (reemplaza con tu lógica real)
  const checkFirebaseConnections = async () => {
    setIsChecking(true);
    
    // Simular delay de verificación
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    const newConnections: ConnectionStatus[] = [];

    // 1. Verificar configuración
    await delay(500);
    try {
      // Aquí iría tu lógica real de verificación
      newConnections.push({
        service: 'Firebase Config',
        status: 'connected',
        message: 'Configuración válida - Proyecto: new-prototype-rmkd6',
        lastChecked: new Date()
      });
    } catch {
      newConnections.push({
        service: 'Firebase Config',
        status: 'error',
        message: 'Error en configuración de Firebase',
        lastChecked: new Date()
      });
    }

    // 2. Verificar Authentication
    await delay(500);
    try {
      newConnections.push({
        service: 'Authentication',
        status: 'connected',
        message: 'Auth habilitado - Email/Password configurado',
        lastChecked: new Date()
      });
    } catch {
      newConnections.push({
        service: 'Authentication',
        status: 'error',
        message: 'Error en Authentication - Verificar configuración',
        lastChecked: new Date()
      });
    }

    // 3. Verificar Firestore
    await delay(500);
    try {
      newConnections.push({
        service: 'Firestore',
        status: 'warning',
        message: 'Conectado pero revisar reglas de seguridad',
        lastChecked: new Date()
      });
    } catch {
      newConnections.push({
        service: 'Firestore',
        status: 'error',
        message: 'Error: Cannot resolve marked - Dependencia faltante',
        lastChecked: new Date()
      });
    }

    // 4. Verificar Realtime Database
    await delay(500);
    newConnections.push({
      service: 'Realtime Database',
      status: 'connected',
      message: 'Conectado - URL: new-prototype-rmkd6-default-rtdb.firebaseio.com',
      lastChecked: new Date()
    });

    // 5. Verificar Red
    await delay(500);
    newConnections.push({
      service: 'Network',
      status: 'connected',
      message: 'Conectividad OK - Todos los endpoints accesibles',
      lastChecked: new Date()
    });

    setConnections(newConnections);
    setIsChecking(false);
  };

  useEffect(() => {
    checkFirebaseConnections();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'Authentication':
        return <Shield className="w-4 h-4" />;
      case 'Firestore':
      case 'Realtime Database':
        return <Database className="w-4 h-4" />;
      case 'Network':
        return <Wifi className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'checking':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const overallStatus = connections.every(c => c.status === 'connected') ? 'healthy' :
                       connections.some(c => c.status === 'error') ? 'error' : 'warning';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Estado de Firebase</h2>
            <p className="text-muted-foreground">Diagnóstico de conexiones para Muwise</p>
          </div>
          <button
            onClick={checkFirebaseConnections}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Verificando...' : 'Verificar'}
          </button>
        </div>

        {/* Overall Status */}
        <div className={`mt-4 p-4 rounded-lg border-2 ${
          overallStatus === 'healthy' ? 'bg-green-500/10 border-green-500/20' :
          overallStatus === 'error' ? 'bg-red-500/10 border-red-500/20' :
          'bg-yellow-500/10 border-yellow-500/20'
        }`}>
          <div className="flex items-center gap-2">
            {overallStatus === 'healthy' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : overallStatus === 'error' ? (
              <XCircle className="w-6 h-6 text-red-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
            <span className="font-semibold">
              {overallStatus === 'healthy' ? 'Todas las conexiones funcionando' :
               overallStatus === 'error' ? 'Hay problemas críticos que resolver' :
               'Hay advertencias que revisar'}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all ${getStatusColor(connection.status)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getServiceIcon(connection.service)}
                <h3 className="font-semibold text-sm">{connection.service}</h3>
              </div>
              {getStatusIcon(connection.status)}
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">{connection.message}</p>
            
            {connection.lastChecked && (
              <p className="text-xs text-muted-foreground">
                Última verificación: {connection.lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Fixes */}
      {connections.some(c => c.status === 'error') && (
        <div className="mt-6 p-4 bg-red-500/10 border border-destructive/50 rounded-lg">
          <h3 className="font-semibold text-destructive mb-2">🚨 Acciones Requeridas:</h3>
          <ul className="text-sm text-destructive/90 space-y-1">
            <li>• Instalar dependencia faltante: <code className="bg-destructive/20 px-1 rounded">npm install marked</code></li>
            <li>• Verificar reglas de Firestore en Firebase Console</li>
            <li>• Revisar configuración de Authentication</li>
            <li>• Comprobar que el build local funcione: <code className="bg-destructive/20 px-1 rounded">npm run build</code></li>
          </ul>
        </div>
      )}

      {/* Configuration Display */}
      <div className="mt-6 p-4 bg-muted/50 border rounded-lg">
        <h3 className="font-semibold mb-2">Configuración Actual:</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Proyecto: <code className="bg-muted px-1 rounded">new-prototype-rmkd6</code></div>
          <div>Región: <code className="bg-muted px-1 rounded">us-central1</code></div>
          <div>Auth Domain: <code className="bg-muted px-1 rounded">new-prototype-rmkd6.firebaseapp.com</code></div>
        </div>
      </div>
    </div>
  );
};
