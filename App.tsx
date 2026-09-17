import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
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

    const showingSplash = !ready || (!fontsLoaded && !fontError);
    const showingError = Boolean(configurationError);

    return (
        <>
            <StatusBar style={theme.dark && (showingSplash || showingError) ? 'light' : 'dark'} />
            {!ready || (!fontsLoaded && !fontError) ? (
                <SplashScreen theme={theme} />
            ) : configurationError ? (
                <ErrorScreen
                    theme={theme}
                    title="Esta instalación no puede consultar"
                    message={configurationError}
                />
            ) : (
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
            )}
        </>
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
