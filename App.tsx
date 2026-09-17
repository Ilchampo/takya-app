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
import { LegalDocumentScreen } from './src/screens/LegalDocumentScreen/LegalDocumentScreen';
import { LegalScreen } from './src/screens/LegalScreen/LegalScreen';
import { ResultScreen } from './src/screens/ResultScreen/ResultScreen';
import { SplashScreen } from './src/screens/SplashScreen/SplashScreen';
import { legalDocuments } from './src/data/legal.data';

const AppContent = () => {
    const {
        fontsLoaded,
        fontError,
        ready,
        configurationError,
        storageAvailable,
        theme,
        showLegal,
        legalPage,
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
        openLegalPage,
        closeLegal,
        toggleTheme,
        clearHistory,
    } = useApp();

    const [splashVisible, setSplashVisible] = useState(true);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [revealHome, setRevealHome] = useState(false);

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
                            revealContent={revealHome || !splashVisible}
                            onHeaderLayout={setHeaderHeight}
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
                    {legalPage === 'hub' && (
                        <LegalScreen
                            theme={theme}
                            onBack={closeLegal}
                            onToggleTheme={toggleTheme}
                            onOpenPrivacyPolicy={() => openLegalPage('privacy')}
                            onOpenTermsOfService={() => openLegalPage('terms')}
                        />
                    )}
                    {legalPage && legalPage !== 'hub' && (
                        <LegalDocumentScreen
                            theme={theme}
                            document={legalDocuments[legalPage]}
                            onBack={closeLegal}
                            onToggleTheme={toggleTheme}
                            onOpenPrivacyPolicy={
                                legalPage === 'terms' ? () => openLegalPage('privacy') : undefined
                            }
                        />
                    )}
                </>
            ) : null}
            {splashVisible && !configurationError && (
                <SplashScreen
                    theme={theme}
                    ready={showApp && headerHeight > 0}
                    headerHeight={headerHeight}
                    onMorphStart={() => setRevealHome(true)}
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
