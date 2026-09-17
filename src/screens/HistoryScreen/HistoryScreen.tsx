import React from 'react';

import type { ResultScreenProps } from '../ResultScreen/ResultScreen';

import { ResultScreen } from '../ResultScreen/ResultScreen';

export const HistoryScreen: React.FC<Omit<ResultScreenProps, 'saved' | 'onCancel'>> = (props) => (
    <ResultScreen {...props} saved />
);
