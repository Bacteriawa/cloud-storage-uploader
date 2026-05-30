'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  moduleName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Mock monitoring service
const reportToMonitoringPlatform = (error: Error, errorInfo: ErrorInfo, moduleName: string) => {
  // In a real app, this would use Sentry, Datadog, or a custom API
  console.log(`[Monitor] Error reported from module: ${moduleName}`);
  console.error('[Monitor] Error:', error);
  console.error('[Monitor] Component Stack:', errorInfo.componentStack);
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const moduleName = this.props.moduleName || 'Global';
    
    // Call custom onError if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Unified reporting
    reportToMonitoringPlatform(error, errorInfo, moduleName);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.resetError);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          padding: '24px',
          margin: '16px',
          borderRadius: '12px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--danger)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} color="var(--danger)" />
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
              Oops! Something went wrong.
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px' }}>
              The module &quot;{this.props.moduleName || 'Unknown'}&quot; crashed. We have been notified of this issue.
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={this.resetError}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
