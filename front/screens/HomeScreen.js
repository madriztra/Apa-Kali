import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ImageBackground,
    StyleSheet,
    Pressable,
    Image,
    Platform,
    Dimensions,
} from 'react-native';
// Mengganti 'expo-av' dengan 'expo-audio'
import { Audio } from 'expo-audio';
import { useNavigation } from '@react-navigation/native';

// --- SCALE UNTUK RESPONSIVE ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const moderateScale = (size, factor = 0.5) => size + ((SCREEN_WIDTH / guidelineBaseWidth) * size - size) * factor;

export default function HomeScreen() {
    const navigation = useNavigation();
    const [soundOn, setSoundOn] = useState(Platform.OS !== 'web');
    const soundRef = useRef(null);

    // Memuat dan memutar audio
    useEffect(() => {
        const loadAudio = async () => {
            try {
                // Konfigurasi audio untuk platform web dan native
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    interruptionModeIOS: 1, // 'interruptionModeIOS: InterruptionsArePlaysAndPauses'
                    shouldDuckAndroid: true,
                    interruptionModeAndroid: 1, // 'interruptionModeAndroid: INTERRUPTION_MODE_DO_NOT_MIX'
                    playThroughEarpieceAndroid: false,
                });
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/music/main.mp3'),
                    {
                        shouldPlay: soundOn,
                        isLooping: true,
                    }
                );
                soundRef.current = sound;
            } catch (err) {
                console.warn('Gagal memuat audio:', err);
            }
        };

        loadAudio();

        return () => {
            // Hentikan dan bongkar audio saat komponen dilepas
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    // Mengubah status audio
    const toggleSound = async () => {
        if (!soundRef.current) return;

        if (soundOn) {
            await soundRef.current.pauseAsync();
        } else {
            await soundRef.current.playAsync();
        }

        setSoundOn(!soundOn);
    };

    const goToNameScreen = () => {
        navigation.navigate('NameScreen');
    };

    const goToAdminScreen = () => {
        navigation.navigate('LoginScreen');
    };

    return (
        <ImageBackground
            source={require('../assets/splashbg.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <Pressable onPress={toggleSound} style={styles.soundButton}>
                <Image
                    source={
                        soundOn
                            ? require('../assets/speaker-on.png')
                            : require('../assets/speaker-off.png')
                    }
                    style={styles.soundIcon}
                    resizeMode="contain"
                />
            </Pressable>
            
            {/* Tombol Admin di kiri atas */}
            <Pressable onPress={goToAdminScreen} style={styles.adminButton}>
                <Image
                    source={require('../assets/admin.png')}
                    style={styles.adminIcon}
                    resizeMode="contain"
                />
            </Pressable>

            <View style={styles.centerContainer}>
                <Image
                    source={require('../assets/title.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Pressable onPress={goToNameScreen}>
                    <Image
                        source={require('../assets/play.png')}
                        style={styles.playButton}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    soundButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 20 : 40,
        right: 20,
        zIndex: 99,
    },
    // --- TOMBOL ADMIN ---
    adminButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? moderateScale(20) : moderateScale(50),
        left: moderateScale(20),
        zIndex: 99,
        padding: 5,
    },
    adminIcon: {
        width: moderateScale(85),
        height: moderateScale(85),
    },
    soundIcon: {
        width: 70,
        height: 70,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 300,
        height: 120,
        marginBottom: 40,
    },
    playButton: {
        width: 160,
        height: 160,
    },
});
