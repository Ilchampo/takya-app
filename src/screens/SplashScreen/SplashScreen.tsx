import React, { useEffect, useRef, useState } from 'react';

import type { AppTheme } from '../../theme/theme';

import { AccessibilityInfo, Animated, Easing, useWindowDimensions, View } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AstrobitLogo } from '../../components/Brand/AstrobitLogo';
import {
    HEADER_BRAND_GAP,
    HEADER_MARK_WIDTH,
    HEADER_WORD_SIZE,
    SPLASH_MARK_WIDTH,
    SPLASH_WORD_SIZE,
    TakyaMark,
    TakyaWordmark,
    markHeight,
} from '../../components/Brand/Brand';
import { Text } from '../../components/Text/Text';

import styles from './SplashScreen.styles';

const HERO_MAX_WIDTH = 600;
const HERO_GUTTER = 24;
const HERO_TOP_GAP = 12;
const TOPBAR_ROW = 48;
const HEADER_SHEET_EXTRA = 12;
const MIN_HOLD_MS = 520;
const MORPH_MS = 860;
const CREDIT_MS = 280;
const easing = Easing.bezier(0.22, 1, 0.36, 1);

type Box = { x: number; y: number; width: number; height: number };

interface SplashScreenProps {
    theme: AppTheme;
    ready?: boolean;
    headerHeight?: number;
    onMorphStart?: VoidFunction;
    onFinished?: VoidFunction;
}

const headerGutter = (windowWidth: number): number => {
    const contentWidth = Math.min(windowWidth, HERO_MAX_WIDTH);

    return (windowWidth - contentWidth) / 2 + HERO_GUTTER;
};

const centerDelta = (from: Box, to: Box) => ({
    x: to.x + to.width / 2 - (from.x + from.width / 2),
    y: to.y + to.height / 2 - (from.y + from.height / 2),
    scale: to.width / from.width,
});

export const SplashScreen: React.FC<SplashScreenProps> = (props) => {
    const { theme, ready = false, headerHeight = 0, onMorphStart, onFinished } = props;

    const insets = useSafeAreaInsets();

    const { width, height } = useWindowDimensions();

    const markRef = useRef<View>(null);
    const wordRef = useRef<View>(null);
    const started = useRef(false);
    const mountedAt = useRef(0);
    const onMorphStartRef = useRef(onMorphStart);
    const onFinishedRef = useRef(onFinished);
    const [progress] = useState(() => new Animated.Value(0));
    const [sheet] = useState(() => new Animated.Value(0));
    const [credit] = useState(() => new Animated.Value(1));
    const [markBox, setMarkBox] = useState<Box | null>(null);
    const [wordBox, setWordBox] = useState<Box | null>(null);
    const [animating, setAnimating] = useState(false);

    const ink = theme.colors.onPrimary;

    useEffect(() => {
        mountedAt.current = Date.now();
        void ExpoSplashScreen.hideAsync().catch(() => undefined);
    }, []);

    useEffect(() => {
        onMorphStartRef.current = onMorphStart;
        onFinishedRef.current = onFinished;
    }, [onMorphStart, onFinished]);

    const measure = (): void => {
        markRef.current?.measureInWindow((x, y, boxWidth, boxHeight) => {
            setMarkBox((current) =>
                current &&
                current.x === x &&
                current.y === y &&
                current.width === boxWidth &&
                current.height === boxHeight
                    ? current
                    : { x, y, width: boxWidth, height: boxHeight },
            );
        });
        wordRef.current?.measureInWindow((x, y, boxWidth, boxHeight) => {
            setWordBox((current) =>
                current &&
                current.x === x &&
                current.y === y &&
                current.width === boxWidth &&
                current.height === boxHeight
                    ? current
                    : { x, y, width: boxWidth, height: boxHeight },
            );
        });
    };

    useEffect(() => {
        if (!ready || !markBox || !wordBox || started.current) {
            return;
        }

        const wait = Math.max(0, MIN_HOLD_MS - (Date.now() - mountedAt.current));
        const timer = setTimeout(() => {
            void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
                if (started.current) {
                    return;
                }

                started.current = true;

                if (reduceMotion) {
                    onMorphStartRef.current?.();
                    Animated.timing(credit, {
                        toValue: 0,
                        duration: 220,
                        useNativeDriver: true,
                    }).start(() => onFinishedRef.current?.());

                    return;
                }

                setAnimating(true);

                Animated.timing(credit, {
                    toValue: 0,
                    duration: CREDIT_MS,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }).start(({ finished }) => {
                    if (!finished) {
                        return;
                    }

                    onMorphStartRef.current?.();

                    Animated.parallel([
                        Animated.timing(progress, {
                            toValue: 1,
                            duration: MORPH_MS,
                            easing,
                            useNativeDriver: true,
                        }),
                        Animated.timing(sheet, {
                            toValue: 1,
                            duration: MORPH_MS,
                            easing,
                            useNativeDriver: false,
                        }),
                    ]).start(() => onFinishedRef.current?.());
                });
            });
        }, wait);

        return () => clearTimeout(timer);
    }, [ready, markBox, wordBox, credit, progress, sheet]);

    const gutter = headerGutter(width);
    const headerMarkHeight = markHeight(HEADER_MARK_WIDTH);
    const headerWordHeight = Math.round(HEADER_WORD_SIZE * 1.15);
    const headerTop = insets.top + HERO_TOP_GAP;
    const fallbackHeader = headerTop + TOPBAR_ROW + HEADER_SHEET_EXTRA;
    const targetHeight = headerHeight > 0 ? headerHeight : fallbackHeader;

    const markTarget: Box = {
        x: gutter,
        y: headerTop + (TOPBAR_ROW - headerMarkHeight) / 2,
        width: HEADER_MARK_WIDTH,
        height: headerMarkHeight,
    };

    const wordTarget: Box = {
        x: gutter + HEADER_MARK_WIDTH + HEADER_BRAND_GAP,
        y: headerTop + (TOPBAR_ROW - headerWordHeight) / 2,
        width: wordBox ? wordBox.width * (HEADER_WORD_SIZE / SPLASH_WORD_SIZE) : HEADER_MARK_WIDTH,
        height: headerWordHeight,
    };

    const markFly = markBox ? centerDelta(markBox, markTarget) : { x: 0, y: 0, scale: 1 };
    const wordFly = wordBox ? centerDelta(wordBox, wordTarget) : { x: 0, y: 0, scale: 1 };

    return (
        <View style={styles.overlay} pointerEvents="auto">
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        height: sheet.interpolate({
                            inputRange: [0, 1],
                            outputRange: [height, targetHeight],
                        }),
                        backgroundColor: theme.colors.primary,
                        borderBottomLeftRadius: sheet.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 32],
                        }),
                        borderBottomRightRadius: sheet.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 32],
                        }),
                    },
                ]}
            />
            <View
                style={[styles.center, animating && { opacity: 0 }]}
                pointerEvents="none"
                onLayout={measure}
            >
                <View ref={markRef} collapsable={false}>
                    <TakyaMark theme={theme} width={SPLASH_MARK_WIDTH} onPrimary />
                </View>
                <View ref={wordRef} collapsable={false}>
                    <TakyaWordmark color={ink} fontSize={SPLASH_WORD_SIZE} />
                </View>
            </View>
            {animating && markBox && wordBox && (
                <>
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.flyer,
                            {
                                left: markBox.x,
                                top: markBox.y,
                                transform: [
                                    {
                                        translateX: progress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, markFly.x],
                                        }),
                                    },
                                    {
                                        translateY: progress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, markFly.y],
                                        }),
                                    },
                                    {
                                        scale: progress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, markFly.scale],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <TakyaMark theme={theme} width={SPLASH_MARK_WIDTH} onPrimary />
                    </Animated.View>
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.flyer,
                            {
                                left: wordBox.x,
                                top: wordBox.y,
                                transform: [
                                    {
                                        translateX: progress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, wordFly.x],
                                        }),
                                    },
                                    {
                                        translateY: progress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, wordFly.y],
                                        }),
                                    },
                                    {
                                        scale: progress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, wordFly.scale],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <TakyaWordmark color={ink} fontSize={SPLASH_WORD_SIZE} />
                    </Animated.View>
                </>
            )}
            <Animated.View
                accessible
                accessibilityLabel="Developed by Astrobit"
                style={[
                    styles.credit,
                    { paddingBottom: Math.max(insets.bottom, 20) + 16, opacity: credit },
                ]}
            >
                <Text style={[styles.developed, { color: theme.colors.onPrimaryMuted }]}>
                    Desarrollado por
                </Text>
                <AstrobitLogo color={ink} width={128} />
            </Animated.View>
        </View>
    );
};
