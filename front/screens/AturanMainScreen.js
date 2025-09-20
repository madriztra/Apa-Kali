import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Platform,
    StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AturanMainScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const playerName = route.params?.playerName || 'Pemain';

    const handleStartGame = () => {
        // Mengirim `playerName` ke layar game pertama
        navigation.navigate('GamePlayScreen', { playerName: playerName }); 
    };

    return (
        <ImageBackground
            source={require('../assets/game-bg.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.centerWrapper}>
                <View style={styles.container}>
                    <Text style={styles.greeting}>👋 Halo, {playerName}!</Text>
                    <Text style={styles.title}>📜 Aturan Main</Text>

                    <Text style={styles.rule}>👀 Selesaikan 3 mini-game untuk mengumpulkan skor tertinggi.</Text>
                    <Text style={styles.rule}>✅ Setiap game memiliki tantangan dan cara bermain yang unik.</Text>
                    <Text style={styles.rule}>🏆 Skor dari setiap game akan diakumulasikan hingga akhir.</Text>
                    <Text style={styles.rule}>✨ Fokus, cepat, dan teliti adalah kunci kemenangan!</Text>

                    <TouchableOpacity onPress={handleStartGame} style={styles.startButton}>
                        <Text style={styles.startText}>Mulai Main</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    // --- BACKGROUND & LAYOUT ---
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#0F172A',
    },
    centerWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
    },
    // --- KARTU UTAMA ---
    container: {
        width: '100%',
        maxWidth: 450,
        backgroundColor: '#1E293B',
        padding: 30,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#0EA5E9',
        alignItems: 'flex-start',
        ...Platform.select({
            native: {
                shadowColor: '#0EA5E9',
                shadowOpacity: 0.7,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 0 },
                elevation: 15,
            },
            default: { 
                boxShadow: '0 0 30px rgba(14, 165, 233, 0.6)',
            }
        }),
    },
    // --- TIPOGRAFI ---
    greeting: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#38BDF8',
        marginBottom: 25,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        alignSelf: 'center',
        textShadowColor: 'rgba(56, 189, 248, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    rule: {
        fontSize: 17,
        color: '#CBD5E1',
        marginBottom: 15,
        lineHeight: 24,
    },
    // --- TOMBOL MULAI ---
    startButton: {
        marginTop: 20,
        backgroundColor: '#38BDF8',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 20,
        alignSelf: 'center',
        borderBottomWidth: 4,
        borderBottomColor: 'rgba(14, 165, 233, 0.8)',
        ...Platform.select({
            native: {
                shadowColor: '#38BDF8',
                shadowOpacity: 0.8,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 20,
                elevation: 10,
            },
            default: {
                boxShadow: '0 4px 25px rgba(56, 189, 248, 0.6)',
            }
        }),
    },
    startText: {
        color: '#0F172A',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
}); 