import * as ExpoSplashScreen from 'expo-splash-screen';
import { registerRootComponent } from 'expo';

import App from './App';

void ExpoSplashScreen.preventAutoHideAsync().catch(() => undefined);

registerRootComponent(App);
