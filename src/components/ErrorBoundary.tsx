import { Component, type ReactNode } from 'react';
import { clearLocalCache } from '../lib/store';

export class ErrorBoundary extends Component<{ children: ReactNode; label?: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error('UI crashed', error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="wrap" style={{ paddingTop: 'calc(var(--safe-top) + 40px)' }}>
        <div className="card pad form">
          <h2>Something broke{this.props.label ? ` in ${this.props.label}` : ''} 😵</h2>
          <p className="muted" style={{ fontSize: 13 }}>{String(this.state.error.message || this.state.error).slice(0, 200)}</p>
          <button className="btn primary" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
          <button className="btn" onClick={() => location.reload()}>
            Reload the app
          </button>
          <button
            className="btn ghost sm"
            onClick={() => {
              clearLocalCache();
              location.reload();
            }}
          >
            Reset cached data on this phone
          </button>
        </div>
      </div>
    );
  }
}
