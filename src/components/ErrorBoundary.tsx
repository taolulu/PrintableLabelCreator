import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // eslint-disable-next-line no-console
    console.error('Captured error in ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-md border border-red-200">
          <h3 className="text-lg font-semibold text-red-700">Something went wrong</h3>
          <p className="mt-2 text-sm text-red-600">An error occurred in this part of the editor. You can reload the page to continue.</p>
          <div className="mt-4">
            <button onClick={() => window.location.reload()} className="px-3 py-2 bg-red-600 text-white rounded">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
