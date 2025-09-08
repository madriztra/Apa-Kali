import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    StatusBar, 
    ImageBackground,
    Animated,
    Easing,
    FlatList,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Asumsikan fungsi ini sudah didefinisikan di tempat lain
const calculateGame3Score = (timeInSeconds) => {
    // Implementasi logika skor Game 3
    const maxScore = 1000;
    const timeLimit = 60; // Misalnya, waktu maksimal adalah 60 detik
    
    if (timeInSeconds <= 0) {
        return maxScore; // Waktu tidak valid, berikan skor maksimal
    }

    // Semakin cepat, semakin tinggi skor
    const score = Math.max(0, maxScore - (timeInSeconds * (maxScore / timeLimit)));
    return Math.round(score);
};

const LeaderboardScreen = ({ route, navigation }) => {
    // --- Menerima data baru dari Game 3 ---
    const { scoreGame1dan2, timeGame3, playerName } = route.params || { 
        scoreGame1dan2: 0, 
        timeGame3: 0, 
        playerName: 'Pemain' 
    };

    // --- Hitung skor Game 3 dan skor total ---
    const scoreGame3 = calculateGame3Score(timeGame3);
    const totalScore = scoreGame1dan2 + scoreGame3;

    // --- State untuk data leaderboard ---
    const [leaderboard, setLeaderboard] = useState([]);

    // --- State & Ref untuk Animasi Skor ---
    const [displayScores, setDisplayScores] = useState({
        game1dan2: 0,
        game3: 0,
        total: 0,
    });
    const animatedValues = useRef({
        game1dan2: new Animated.Value(0),
        game3: new Animated.Value(0),
        total: new Animated.Value(0),
    }).current;
    
    // Fungsi untuk menyimpan skor baru
    const saveNewScore = async (player, score) => {
        try {
            // Dapatkan data leaderboard saat ini
            const existingData = await AsyncStorage.getItem('leaderboard');
            let currentLeaderboard = existingData ? JSON.parse(existingData) : [];
            
            // Tambahkan skor baru
            const newEntry = { name: player, score: score, timestamp: Date.now() };
            currentLeaderboard.push(newEntry);
            
            // Urutkan berdasarkan skor tertinggi
            currentLeaderboard.sort((a, b) => b.score - a.score);
            
            // Batasi jumlah entri (misalnya 10 teratas)
            const topScores = currentLeaderboard.slice(0, 10);

            // Simpan kembali ke AsyncStorage
            await AsyncStorage.setItem('leaderboard', JSON.stringify(topScores));
            
            // Perbarui state leaderboard
            setLeaderboard(topScores);
        } catch (error) {
            console.error("Gagal menyimpan skor:", error);
            Alert.alert("Error", "Gagal menyimpan skor ke leaderboard.");
        }
    };

    // Fungsi untuk mengambil data leaderboard
    const fetchLeaderboard = async () => {
        try {
            const storedData = await AsyncStorage.getItem('leaderboard');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setLeaderboard(parsedData);
            }
        } catch (error) {
            console.error("Gagal mengambil data leaderboard:", error);
        }
    };

    // Efek untuk menjalankan animasi dan menyimpan skor saat komponen dimuat
    useEffect(() => {
        // Jalankan animasi skor
        Animated.parallel([
            Animated.timing(animatedValues.game1dan2, {
                toValue: scoreGame1dan2,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(animatedValues.game3, {
                toValue: scoreGame3,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(animatedValues.total, {
                toValue: totalScore,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            })
        ]).start(() => {
            // Setelah animasi selesai, simpan skor ke leaderboard
            saveNewScore(playerName, totalScore);
        });
    }, [animatedValues, scoreGame1dan2, scoreGame3, totalScore, playerName]);

    // Efek untuk mendengarkan perubahan nilai animasi dan mengupdate state
    useEffect(() => {
        const listener1 = animatedValues.game1dan2.addListener(({ value }) => {
            setDisplayScores(prev => ({ ...prev, game1dan2: Math.round(value) }));
        });
        const listener2 = animatedValues.game3.addListener(({ value }) => {
            setDisplayScores(prev => ({ ...prev, game3: Math.round(value) }));
        });
        const listener3 = animatedValues.total.addListener(({ value }) => {
            setDisplayScores(prev => ({ ...prev, total: Math.round(value) }));
        });

        return () => {
            animatedValues.game1dan2.removeListener(listener1);
            animatedValues.game3.removeListener(listener2);
            animatedValues.total.removeListener(listener3);
        };
    }, [animatedValues]);
    
    // Render item untuk FlatList
    const renderLeaderboardItem = ({ item, index }) => (
        <View style={styles.leaderboardItem}>
            <Text style={styles.rankText}>#{index + 1}</Text>
            <Text style={styles.leaderboardPlayerName}>{item.name}</Text>
            <Text style={styles.leaderboardScore}>{item.score}</Text>
        </View>
    );

    return (
        <ImageBackground
            source={require('../assets/splashbg.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                
                <View style={styles.titleContainer}>
                    <Text style={styles.congratsText}>SELAMAT</Text>
                    <Text style={styles.playerNameText}>{playerName}</Text>
                </View>

                {/* Bagian Skor Animasi */}
                <View style={styles.scoreBox}>
                    <View style={styles.scoreRow}>
                        <Text style={styles.scoreLabel}>Skor Game 1 & 2</Text>
                        <Animated.Text style={styles.scoreValueSmall}>{displayScores.game1dan2}</Animated.Text>
                    </View>
                    <View style={styles.scoreRow}>
                        <Text style={styles.scoreLabel}>Skor Game 3</Text>
                        <Animated.Text style={styles.scoreValueSmall}>{displayScores.game3}</Animated.Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalScoreRow}>
                        <Text style={styles.totalScoreLabel}>Skor Total</Text>
                        <Animated.Text style={styles.totalScoreValue}>{displayScores.total}</Animated.Text>
                    </View>
                </View>
                
                {/* Judul Leaderboard */}
                <Text style={styles.subtitle}>Top Players Leaderboard</Text>

                {/* Daftar Leaderboard */}
                <FlatList
                    data={leaderboard}
                    renderItem={renderLeaderboardItem}
                    keyExtractor={(item, index) => index.toString()}
                    style={styles.leaderboardList}
                    contentContainerStyle={styles.leaderboardContent}
                    ListEmptyComponent={<Text style={styles.emptyListText}>Leaderboard masih kosong.</Text>}
                />

                {/* Tombol Navigasi (jika diperlukan) */}
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => navigation.navigate('MainMenu')}
                >
                    <Text style={styles.buttonText}>Kembali ke Menu Utama</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    congratsText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    playerNameText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#38BDF8',
        textAlign: 'center',
        textShadowColor: 'rgba(56, 189, 248, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    subtitle: {
        fontSize: 18,
        color: '#CBD5E1',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    scoreBox: {
        width: '90%',
        backgroundColor: '#1E293B',
        borderWidth: 2,
        borderColor: '#0EA5E9',
        borderRadius: 20,
        paddingHorizontal: 25,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#0EA5E9',
        shadowOpacity: 0.7,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 0 },
        elevation: 15,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    scoreLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#94A3B8',
    },
    scoreValueSmall: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(14, 165, 233, 0.3)',
        marginVertical: 15,
    },
    totalScoreRow: {
        alignItems: 'center',
        width: '100%',
    },
    totalScoreLabel: {
        fontSize: 22,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    totalScoreValue: {
        fontSize: 80,
        fontWeight: '900',
        color: '#38BDF8',
        marginTop: 5,
        fontVariant: ['tabular-nums'],
    },
    leaderboardList: {
        width: '100%',
        flexGrow: 0, // Penting agar tidak memenuhi seluruh layar
    },
    leaderboardContent: {
        paddingBottom: 20,
    },
    leaderboardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#0EA5E9',
    },
    rankText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#CBD5E1',
        width: 40,
    },
    leaderboardPlayerName: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 10,
    },
    leaderboardScore: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#38BDF8',
    },
    emptyListText: {
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#0EA5E9',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginTop: 30,
        shadowColor: '#0EA5E9',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default LeaderboardScreen;