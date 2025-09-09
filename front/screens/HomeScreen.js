import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ImageBackground,
    StyleSheet,
    Pressable,
    Image,
    Platform,
    Text,
} from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [soundOn, setSoundOn] = useState(Platform.OS !== 'web');
    const soundRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/music/main.mp3'),
                    {
                        shouldPlay: Platform.OS !== 'web',
                        isLooping: true,
                    }
                );
                soundRef.current = sound;
            } catch (err) {
                console.warn('Gagal load audio:', err);
            }
        })();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

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
        navigation.navigate('AdminScreen');
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
            
            {/* Admin button in top-left */}
            <Pressable onPress={goToAdminScreen} style={styles.adminButton}>
                <Text style={styles.adminButtonText}>ADMIN</Text>
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
    adminButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 20 : 40,
        left: 20,
        zIndex: 99,
        // Match the styling of the play button
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    adminButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
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
