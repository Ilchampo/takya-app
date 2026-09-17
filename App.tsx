import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useApp } from './src/hooks/useApp';

import { ErrorBoundary } from './src/components/ErrorBoundary/ErrorBoundary';
import { ErrorScreen } from './src/screens/ErrorScreen/ErrorScreen';
import { HistoryScreen } from './src/screens/HistoryScreen/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen/HomeScreen';
import { LegalScreen } from './src/screens/LegalScreen/LegalScreen';
import { ResultScreen } from './src/screens/ResultScreen/ResultScreen';
import { SplashScreen } from './src/screens/SplashScreen/SplashScreen';

const AppContent = () => {
    const {
        fontsLoaded,
        fontError,
        ready,
        configurationError,
        storageAvailable,
        theme,
        showLegal,
        showResult,
        closeResult,
        refreshHistory,
        plate,
        history,
        result,
        loading,
        error,
        savedPlate,
        savedResult,
        savedLoading,
        savedError,
        changePlate,
        runSearch,
        cancelSearch,
        openHistory,
        closeHistory,
        openLegal,
        closeLegal,
        toggleTheme,
        clearHistory,
    } = useApp();

    const [splashVisible, setSplashVisible] = useState(true);
    const [heroHeight, setHeroHeight] = useState(0);
    const fontsReady = fontsLoaded || Boolean(fontError);
    const showingError = Boolean(configurationError);
    const showApp = ready && fontsReady && !configurationError;

    useEffect(() => {
        if (fontsReady) {
            void ExpoSplashScreen.hideAsync().catch(() => undefined);
        }
    }, [fontsReady]);

    if (!fontsReady) {
        return null;
    }

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style={theme.dark && showingError && !splashVisible ? 'light' : 'dark'} />
            {configurationError ? (
                <ErrorScreen
                    theme={theme}
                    title="Esta instalación no puede consultar"
                    message={configurationError}
                />
            ) : showApp ? (
                <>
                    {!showLegal && !savedPlate && !showResult && (
                        <HomeScreen
                            theme={theme}
                            plate={plate}
                            history={history}
                            loading={loading}
                            error={error}
                            storageAvailable={storageAvailable}
                            onPlateChange={changePlate}
                            onSubmit={() => void runSearch(plate)}
                            onOpenHistory={(recentPlate) => void openHistory(recentPlate)}
                            onOpenLegal={openLegal}
                            onToggleTheme={toggleTheme}
                            onClearHistory={clearHistory}
                            hideBrand={splashVisible}
                            onHeroLayout={setHeroHeight}
                        />
                    )}
                    {!showLegal && !savedPlate && showResult && (
                        <ResultScreen
                            theme={theme}
                            plate={plate}
                            result={result}
                            loading={loading}
                            error={error}
                            onBack={closeResult}
                            onCancel={cancelSearch}
                            onRefresh={() => void runSearch(plate, { refresh: true })}
                            onToggleTheme={toggleTheme}
                            onOpenLegal={openLegal}
                        />
                    )}
                    {!showLegal && savedPlate && (
                        <HistoryScreen
                            theme={theme}
                            plate={savedPlate}
                            result={savedResult}
                            loading={savedLoading}
                            error={savedError}
                            onBack={closeHistory}
                            onRefresh={refreshHistory}
                            onToggleTheme={toggleTheme}
                            onOpenLegal={openLegal}
                        />
                    )}
                    {showLegal && (
                        <LegalScreen
                            theme={theme}
                            onBack={closeLegal}
                            onToggleTheme={toggleTheme}
                        />
                    )}
                </>
            ) : null}
            {splashVisible && !configurationError && (
                <SplashScreen
                    theme={theme}
                    ready={showApp && heroHeight > 0}
                    heroHeight={heroHeight}
                    onFinished={() => setSplashVisible(false)}
                />
            )}
        </View>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <ErrorBoundary>
                <AppContent />
            </ErrorBoundary>
        </SafeAreaProvider>
    );
}
