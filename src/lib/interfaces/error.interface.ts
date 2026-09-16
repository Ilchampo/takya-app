import type { ReactNode } from 'react';

export interface ErrorBoundaryProps {
    children: ReactNode;
}

export interface ErrorBoundaryState {
    failed: boolean;
    resetKey: number;
}
