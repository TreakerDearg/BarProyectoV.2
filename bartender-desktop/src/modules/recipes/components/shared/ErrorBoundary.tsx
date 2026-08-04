import { Component, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Captura errores en componentes hijos
 * Previene que un error rompa toda la aplicación
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2 className={styles.errorTitle}>Algo salió mal</h2>
            <p className={styles.errorMessage}>
              {this.state.error?.message || 'Ocurrió un error inesperado'}
            </p>
            <button onClick={this.handleReset} className={styles.errorButton}>
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * RecipeBuilderErrorBoundary - Error boundary específico para RecipeBuilder
 */
export function RecipeBuilderErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className={styles.moduleError}>
          <div className={styles.moduleErrorContent}>
            <span className={styles.moduleErrorIcon}>🔧</span>
            <h3>Error en el Constructor de Recetas</h3>
            <p>No se pudo cargar el constructor. Por favor intenta recargar la página.</p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * RecipeLibraryErrorBoundary - Error boundary específico para RecipeLibrary
 */
export function RecipeLibraryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className={styles.moduleError}>
          <div className={styles.moduleErrorContent}>
            <span className={styles.moduleErrorIcon}>📚</span>
            <h3>Error en la Biblioteca</h3>
            <p>No se pudo cargar la biblioteca de recetas. Por favor intenta recargar la página.</p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * AnalyticsErrorBoundary - Error boundary específico para Analytics
 */
export function AnalyticsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className={styles.moduleError}>
          <div className={styles.moduleErrorContent}>
            <span className={styles.moduleErrorIcon}>📊</span>
            <h3>Error en Analytics</h3>
            <p>No se pudieron cargar los análisis. Por favor intenta recargar la página.</p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * TimelineErrorBoundary - Error boundary específico para Timeline
 */
export function TimelineErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className={styles.moduleError}>
          <div className={styles.moduleErrorContent}>
            <span className={styles.moduleErrorIcon}>📅</span>
            <h3>Error en Timeline</h3>
            <p>No se pudo cargar el timeline. Por favor intenta recargar la página.</p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * InspectorErrorBoundary - Error boundary específico para Inspector
 */
export function InspectorErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className={styles.moduleError}>
          <div className={styles.moduleErrorContent}>
            <span className={styles.moduleErrorIcon}>🔍</span>
            <h3>Error en Inspector</h3>
            <p>No se pudo cargar el inspector. Por favor intenta recargar la página.</p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
