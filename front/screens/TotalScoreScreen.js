// TotalScoreScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const NEON_GREEN = '#39FF14';
const DARK_BLUE = '#0d1b2a';

export default function TotalScoreScreen({ route, navigation }) {
    // Ambil total skor DAN total waktu yang dikirim
    const { skorAkhir, waktuAkhir } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PERMAINAN SELESAI</Text>
            
            <View style={styles.statsContainer}>
                <Text style={styles.label}>Total Skor Kamu:</Text>
                <Text style={styles.totalScoreText}>{skorAkhir}</Text>
            </View>

            <View style={styles.statsContainer}>
                <Text style={styles.label}>Total Waktu Bermain:</Text>
                <Text style={styles.totalTimeText}>{waktuAkhir}</Text>
            </View>

            <TouchableOpacity 
                style={styles.button} 
                onPress={() => navigation.popToTop()}
            >
                <Text style={styles.buttonText}>Kembali ke Menu</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DARK_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 50,
    },
    statsContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    label: {
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 10,
    },
    totalScoreText: {
        fontSize: 72,
        fontWeight: 'bold',
        color: NEON_GREEN,
        textShadowColor: NEON_GREEN,
        textShadowRadius: 20,
    },
    totalTimeText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
    button: {
        backgroundColor: NEON_GREEN,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 15,
        marginTop: 20,
    },
    buttonText: {
        color: DARK_BLUE,
        fontSize: 18,
        fontWeight: 'bold',
    },
});