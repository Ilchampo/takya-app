import type { ErrorInfo, ReactNode } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from '../../lib/interfaces/error.interface';

import { Component, Fragment } from 'react';
import { ErrorScreen } from '../../screens/ErrorScreen/ErrorScreen';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        failed: false,
        resetKey: 0,
    };

    static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
        return { failed: true };
    }

    componentDidCatch(_error: Error, _info: ErrorInfo): void {
        // Future work - intentionally has no telemetry sink.
    }

    private reset = (): void => {
        this.setState((state) => ({
            failed: false,
            resetKey: state.resetKey + 1,
        }));
    };

    render(): ReactNode {
        if (this.state.failed) {
            return (
                <ErrorScreen
                    title="Takya encontró un problema"
                    message="No pudimos mostrar esta pantalla. Intenta volver a cargar la aplicación."
                    actionLabel="Reintentar"
                    onAction={this.reset}
                />
            );
        }

        return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
    }
}
