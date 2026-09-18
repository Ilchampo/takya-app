import React, { useMemo } from 'react';

import type { ReactNode } from 'react';
import type { GestureResponderEvent, PanResponderGestureState } from 'react-native';

import { PanResponder, View } from 'react-native';

import styles from './EdgeSwipeBack.styles';

const EDGE_WIDTH = 28;
const MIN_DISTANCE = 64;
const MIN_VELOCITY = 0.35;

interface EdgeSwipeBackProps {
    onBack: VoidFunction;
    children: ReactNode;
}

const startedFromEdge = (
    event: GestureResponderEvent,
    gesture: PanResponderGestureState,
): boolean => event.nativeEvent.pageX - gesture.dx <= EDGE_WIDTH;

const isEdgeBackSwipe = (
    event: GestureResponderEvent,
    gesture: PanResponderGestureState,
): boolean =>
    startedFromEdge(event, gesture) &&
    gesture.dx > 10 &&
    Math.abs(gesture.dx) > Math.abs(gesture.dy);

const shouldGoBack = (gesture: PanResponderGestureState): boolean =>
    gesture.dx >= MIN_DISTANCE || gesture.vx >= MIN_VELOCITY;

export const EdgeSwipeBack: React.FC<EdgeSwipeBackProps> = (props) => {
    const { onBack, children } = props;

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: isEdgeBackSwipe,
                onMoveShouldSetPanResponderCapture: isEdgeBackSwipe,
                onPanResponderTerminationRequest: () => false,
                onPanResponderRelease: (_event, gesture) => {
                    if (shouldGoBack(gesture)) {
                        onBack();
                    }
                },
            }),
        [onBack],
    );

    return (
        <View style={styles.wrap} {...panResponder.panHandlers}>
            {children}
        </View>
    );
};
