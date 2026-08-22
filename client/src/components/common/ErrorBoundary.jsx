import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-red-500/40 text-slate-200 font-inter space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold font-space text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Component Rendering Alert</span>
          </div>
          <p className="text-xs text-slate-300">
            A visual sub-component encountered an issue: {this.state.error?.message || 'Unexpected state'}.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
