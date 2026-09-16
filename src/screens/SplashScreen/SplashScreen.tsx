import React from 'react';

import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isLoaded } from 'expo-font';
import { AstrobitLogo } from '../../components/Brand/Brand';
import { Text } from '../../components/Text/Text';
import { palette } from '../../theme/palette';
import { fonts } from '../../theme/typography';

import styles from './SplashScreen.styles';

export const SplashScreen: React.FC = () => (
    <SafeAreaView style={styles.screen}>
        <View style={styles.hero}>
            <Image
                source={require('../../../assets/taxi.png')}
                style={styles.taxi}
                resizeMode="contain"
            />
            <Text
                style={[
                    styles.wordmark,
                    { fontFamily: isLoaded(fonts.title) ? fonts.title : undefined },
                ]}
            >
                Takya
            </Text>
            <Text style={styles.tagline}>Información pública, más cerca.</Text>
        </View>
        <View style={styles.madeBy}>
            <Text style={styles.created}>CREADO POR</Text>
            <AstrobitLogo color={palette.light.onPrimary} />
        </View>
    </SafeAreaView>
);
