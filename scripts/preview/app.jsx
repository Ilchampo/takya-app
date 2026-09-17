import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from '../../src/screens/HomeScreen/HomeScreen';
import { ResultScreen } from '../../src/screens/ResultScreen/ResultScreen';
import { LegalScreen } from '../../src/screens/LegalScreen/LegalScreen';
import { SplashScreen } from '../../src/screens/SplashScreen/SplashScreen';
import { ErrorScreen } from '../../src/screens/ErrorScreen/ErrorScreen';
import { createTheme } from '../../src/theme/theme';

const now = Date.now();
const demo = {
    plate: 'ABC0123',
    fetchedAt: now,
    fromCache: false,
    sri: {
        status: 'success',
        data: {
            numeroPlaca: 'ABC0123',
            descripcionMarca: 'CHEVROLET',
            descripcionModelo: 'AVEO FAMILY',
            colorVehiculo1: 'AMARILLO',
        },
    },
    fiscalia: { status: 'success', data: { cabecera: [] } },
};
const records = {
    ...demo,
    fiscalia: {
        status: 'success',
        data: {
            cabecera: [
                {
                    ciudad: 'QUITO',
                    fecha: '2026-09-01',
                    hora: '10:30',
                    gen_delito_tipopenal: 'ROBO',
                    sujetos: [{ persona: 'EJEMPLO PERSONA FICTICIA', tipo: 'SOSPECHOSO' }],
                },
            ],
        },
    },
};
const partial = {
    ...demo,
    fiscalia: {
        status: 'error',
        message: 'Servicio no disponible por el momento. Intenta más tarde.',
    },
};
const loading = { ...demo, fiscalia: { status: 'loading', attempt: 1 } };
function Preview() {
    const [mode, setMode] = useState('light');
    const [screen, setScreen] = useState('home');
    const [prior, setPrior] = useState('home');
    const [plate, setPlate] = useState('');
    const [width, setWidth] = useState(390);
    const [large, setLarge] = useState(false);
    const [history, setHistory] = useState([]);
    const theme = createTheme(mode);
    const toggle = () => setMode(mode === 'light' ? 'dark' : 'light');
    const legal = () => {
        setPrior(screen);
        setScreen('privacy');
    };
    const props = {
        theme,
        onToggleTheme: toggle,
        onOpenLegal: legal,
        onBack: () => setScreen('home'),
    };
    const fixtures = {
        result: demo,
        saved: { ...demo, fromCache: true },
        records,
        partial,
        loading,
    };
    return (
        <div className="qa">
            <aside className="controls">
                <h1>Takya</h1>
                <p>
                    Visual QA · Actual screen components with synthetic data. No government requests
                    or device history.
                </p>
                <label>
                    Screen{' '}
                    <select
                        aria-label="Preview screen"
                        value={screen}
                        onChange={(e) => setScreen(e.target.value)}
                    >
                        {[
                            'home',
                            'result',
                            'records',
                            'partial',
                            'loading',
                            'saved',
                            'privacy',
                            'splash',
                            'error',
                        ].map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Width{' '}
                    <select
                        aria-label="Phone width"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                    >
                        <option>320</option>
                        <option>390</option>
                        <option>430</option>
                    </select>
                </label>
                <button onClick={toggle}>Switch to {mode === 'light' ? 'dark' : 'light'}</button>
                <button
                    onClick={() =>
                        setHistory(
                            history.length
                                ? []
                                : [
                                      { plate: 'ABC0123', fetchedAt: now },
                                      { plate: 'XYZ0456', fetchedAt: now - 3600000 },
                                  ],
                        )
                    }
                >
                    Toggle recent queries
                </button>
                <button onClick={() => setLarge(!large)}>{large ? 'Normal' : 'Large'} text</button>
                <p>
                    Light and dark colors, small screens, expanded records and partial source
                    failure.
                </p>
            </aside>
            <main
                className="phone"
                style={{ width, background: theme.colors.background, color: theme.colors.text }}
            >
                <div className="status">
                    <span>9:41</span>
                    <span>••• ▰</span>
                </div>
                <div className="app" data-large={large}>
                    {large && (
                        <style>
                            {
                                '[data-large="true"] [dir="auto"] {font-size:150% !important;line-height:1.5 !important}'
                            }
                        </style>
                    )}
                    <SafeAreaProvider
                        initialMetrics={{
                            frame: { x: 0, y: 0, width, height: 782 },
                            insets: { top: 0, bottom: 0, left: 0, right: 0 },
                        }}
                        style={{ flex: 1 }}
                    >
                        {screen === 'home' && (
                            <HomeScreen
                                {...props}
                                plate={plate}
                                onPlateChange={setPlate}
                                history={history}
                                loading={false}
                                error={null}
                                storageAvailable
                                onSubmit={() => setScreen('result')}
                                onOpenHistory={() => setScreen('saved')}
                                onClearHistory={async () => {
                                    setHistory([]);
                                    return true;
                                }}
                            />
                        )}
                        {fixtures[screen] && (
                            <ResultScreen
                                {...props}
                                saved={screen === 'saved'}
                                plate="ABC0123"
                                result={fixtures[screen]}
                                loading={screen === 'loading'}
                                error={null}
                                onCancel={() => setScreen('partial')}
                                onRefresh={() => setScreen('result')}
                            />
                        )}
                        {screen === 'privacy' && (
                            <LegalScreen {...props} onBack={() => setScreen(prior)} />
                        )}
                        {screen === 'splash' && <SplashScreen theme={theme} />}
                        {screen === 'error' && (
                            <ErrorScreen
                                theme={theme}
                                title="No pudimos abrir Takya"
                                message="Cierra la aplicación e intenta nuevamente."
                                actionLabel="Volver a intentar"
                                onAction={() => setScreen('home')}
                            />
                        )}
                    </SafeAreaProvider>
                </div>
                <div className="homebar" />
            </main>
        </div>
    );
}
createRoot(document.getElementById('root')).render(<Preview />);
