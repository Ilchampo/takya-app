import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useApp } from './src/hooks/useApp';

import { HistoryScreen } from './src/screens/HistoryScreen/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen/HomeScreen';
import { LegalScreen } from './src/screens/LegalScreen/LegalScreen';
import { SplashScreen } from './src/screens/SplashScreen/SplashScreen';

export default function App() {
    const {
        fontsLoaded,
        fontError,
        ready,
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
    } = useApp();

    return (
        <SafeAreaProvider>
            <StatusBar style={(!showLegal && !savedPlate) || !theme.dark ? 'dark' : 'light'} />
            {!ready || (!fontsLoaded && !fontError) ? (
                <SplashScreen />
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
                            onCancel={cancelSearch}
                            onOpenHistory={(recentPlate) => void openHistory(recentPlate)}
                            onOpenLegal={openLegal}
                            onToggleTheme={toggleTheme}
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
        </SafeAreaProvider>
    );
}
