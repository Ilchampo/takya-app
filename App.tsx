import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useApp } from './src/hooks/useApp';

import { ErrorBoundary } from './src/components/ErrorBoundary/ErrorBoundary';
import { ErrorScreen } from './src/screens/ErrorScreen/ErrorScreen';
import { HistoryScreen } from './src/screens/HistoryScreen/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen/HomeScreen';
import { LegalScreen } from './src/screens/LegalScreen/LegalScreen';
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

    return (
        <>
            <StatusBar style={(!showLegal && !savedPlate) || !theme.dark ? 'dark' : 'light'} />
            {!ready || (!fontsLoaded && !fontError) ? (
                <SplashScreen />
            ) : configurationError ? (
                <ErrorScreen
                    title="Esta instalación no puede consultar"
                    message={configurationError}
                />
            ) : (
                <>
                    {!showLegal && !savedPlate && (
                        <HomeScreen
                            theme={theme}
                            plate={plate}
                            result={result}
                            history={history}
                            loading={loading}
                            error={error}
                            storageAvailable={storageAvailable}
                            onPlateChange={changePlate}
                            onSubmit={() => void runSearch(plate)}
                            onRefresh={() => void runSearch(plate, { refresh: true })}
                            onCancel={cancelSearch}
                            onOpenHistory={(recentPlate) => void openHistory(recentPlate)}
                            onOpenLegal={openLegal}
                            onToggleTheme={toggleTheme}
                            onClearHistory={clearHistory}
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
