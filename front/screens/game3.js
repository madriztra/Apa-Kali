import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Animated,
    Dimensions,
    ImageBackground,
    TouchableOpacity,
    Easing,
    StatusBar,
} from 'react-native';

// --- ASET & HELPER ---
const ITEMS_POOL = [
    { id: 'item1', image: require('../assets/assetgame3/kosmetik1.png') },
    { id: 'item2', image: require('../assets/assetgame3/kosmetik2.png') },
    { id: 'item3', image: require('../assets/assetgame3/kosmetik3.png') },
    { id: 'item4', image: require('../assets/assetgame3/kosmetik4.png') },
    { id: 'item5', image: require('../assets/assetgame3/kosmetik5.png') },
    { id: 'item6', image: require('../assets/assetgame3/kosmetik6.png') },
    { id: 'item7', image: require('../assets/assetgame3/kosmetik7.png') },
    { id: 'item8', image: require('../assets/assetgame3/kosmetik8.png') },
    { id: 'item9', image: require('../assets/assetgame3/kosmetik9.png') },
];
const BACKGROUND_IMAGE = require('../assets/game-bg.png');
const CARD_COVER_IMAGE = require('../assets/assetgame2/kotak2.png');

const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
const NUM_PAIRS = 9;

// --- Komponen Kartu ---
const CardComponent = React.memo(({ card, index, onPress, isChecking }) => {
    const flipAnimation = useRef(new Animated.Value(card.isFlipped || card.isMatched ? 180 : 0)).current;
    useEffect(() => {
        Animated.timing(flipAnimation, {
            toValue: card.isFlipped || card.isMatched ? 180 : 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [card.isFlipped, card.isMatched]);
    const frontAnimatedStyle = {
        transform: [{
            rotateY: flipAnimation.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] }),
        }],
    };
    const backAnimatedStyle = {
        transform: [{
            rotateY: flipAnimation.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] }),
        }],
    };
    return (
        <TouchableOpacity
            onPress={() => onPress(index)}
            activeOpacity={0.7}
            style={styles.cardWrapper}
            disabled={isChecking || card.isFlipped || card.isMatched}>
            <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
                <Image source={CARD_COVER_IMAGE} style={styles.cardCover} resizeMode="contain" />
            </Animated.View>
            <Animated.View style={[styles.cardFace, card.isMatched && styles.cardMatched, backAnimatedStyle]}>
                <Image source={card.image} style={styles.cardImage} resizeMode="contain" />
            </Animated.View>
        </TouchableOpacity>
    );
});


// =================================================================
// --- KOMPONEN UTAMA GAME 3 ---
// =================================================================
export default function Game3Screen({ route, navigation }) {
    // [TERIMA DATA] Menerima total skor dari Game 1&2 dan playerName
    const previousTotalScore = route.params?.totalScore || 0;
    const playerName = route.params?.playerName || 'Pemain';

    // --- State yang digunakan ---
    const [showRules, setShowRules] = useState(true);
    const [isGameOver, setIsGameOver] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isPreGame, setIsPreGame] = useState(false);
    const [countdownText, setCountdownText] = useState('3');
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const intervalRef = useRef(null);
    
    // --- Logika setup untuk game kartu ---
    const setupGame = useCallback(() => {
        const uniqueItems = shuffleArray(ITEMS_POOL).slice(0, NUM_PAIRS);
        const pairedItems = [...uniqueItems, ...uniqueItems];
        const shuffled = shuffleArray(pairedItems);
        setCards(shuffled.map((item, index) => ({
            key: `${index}-${item.id}`, id: item.id, image: item.image,
            isFlipped: false, isMatched: false,
        })));
        setFlippedIndices([]);
        setIsChecking(false);
        setIsGameOver(false);
        setTimeElapsed(0);
        setShowRules(true);
        setIsPreGame(false);
    }, []);

    useEffect(() => { setupGame(); }, [setupGame]);

    // --- Handler untuk memulai game dari popup aturan ---
    const handleStartGame = () => {
        setShowRules(false);
        setIsPreGame(true);
    };

    // --- Handler tombol "Lanjut" untuk mengirim data ke halaman Skor ---
    const handleContinue = () => {
        // [PENTING] Mengirim rincian skor dan waktu, bukan hanya total
        navigation.navigate('Skor', { 
            scoreGame1dan2: previousTotalScore, // Ini adalah total skor dari Game 1 & 2
            timeGame3: timeElapsed,             // Waktu penyelesaian Game 3 dalam milidetik
            playerName: playerName 
        });

        setTimeout(() => {
            setupGame();
        }, 500);
    };

    // --- Logika Countdown & Timer ---
    useEffect(() => {
        if (!isPreGame) return;
        let count = 3;
        setCountdownText(String(count));
        const countdownInterval = setInterval(() => {
            count -= 1;
            if (count > 0) setCountdownText(String(count));
            else if (count === 0) setCountdownText('MULAI!');
            else { clearInterval(countdownInterval); setIsPreGame(false); }
        }, 1000);
        return () => clearInterval(countdownInterval);
    }, [isPreGame]);

    useEffect(() => {
        if (isGameOver || isPreGame || showRules) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        intervalRef.current = setInterval(() => {
            setTimeElapsed(prevTime => prevTime + 50);
        }, 50);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) };
    }, [isGameOver, isPreGame, showRules]);
    
    // --- Logika Pengecekan Kartu ---
    useEffect(() => {
        if (flippedIndices.length === 2) {
            setIsChecking(true);
            const [firstIndex, secondIndex] = flippedIndices;
            if (cards[firstIndex].id === cards[secondIndex].id) {
                setTimeout(() => {
                    setCards(prev => prev.map((c, i) => (i === firstIndex || i === secondIndex) ? { ...c, isMatched: true } : c));
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 500);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map((c, i) => (i === firstIndex || i === secondIndex) ? { ...c, isFlipped: false } : c));
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    }, [flippedIndices, cards]);
    
    // --- Logika Akhir Game ---
    useEffect(() => {
        if (!isGameOver && cards.length > 0 && cards.every(card => card.isMatched)) {
            setIsGameOver(true);
        }
    }, [cards, isGameOver]);
    
    // --- Handler Klik Kartu ---
    const handleCardPress = (index) => {
        if (isChecking || cards[index].isFlipped) return;
        setCards(prev => prev.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
        setFlippedIndices(prev => [...prev, index]);
    };

    return (
        <View style={styles.fullScreenBg}>
            <StatusBar barStyle="light-content" />
            <ImageBackground source={BACKGROUND_IMAGE} style={StyleSheet.absoluteFill} resizeMode="cover" />
            
            <View style={styles.gameContainer} pointerEvents={isPreGame || showRules ? 'none' : 'auto'}>
                <View style={styles.frameOuter}>
                    <View style={styles.frameInner}>
                        <View style={styles.topSection}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>WAKTU</Text>
                                <Text style={styles.timerText}>{`${Math.floor(timeElapsed / 60000)}`.padStart(2, '0')}:{`${Math.floor((timeElapsed % 60000) / 1000)}`.padStart(2, '0')}</Text>
                            </View>
                        </View>
                        <View style={styles.middleSection}>
                            <View style={styles.cardGridContainer}>
                                {cards.map((card, index) => (
                                    <CardComponent key={card.key} card={card} index={index} onPress={handleCardPress} isChecking={isChecking}/>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            
            {/* POPUP ATURAN MAIN */}
            {showRules && (
                <View style={styles.popupOverlay}>
                    <View style={styles.popupCard}>
                        <Text style={styles.popupTitle}>Aturan Main</Text>
                        <Text style={styles.rulesText}>
                            Buka dan cocokkan semua pasangan kartu dengan gambar yang sama secepat mungkin!
                        </Text>
                        <TouchableOpacity style={styles.popupButton} onPress={handleStartGame}>
                            <Text style={styles.popupButtonText}>Mulai</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* OVERLAY COUNTDOWN */}
            {isPreGame && (
                <View style={styles.countdownOverlay}>
                    <Text style={styles.countdownText}>{countdownText}</Text>
                </View>
            )}

            {/* POPUP KETIKA GAME SELESAI */}
            {isGameOver && (
                <View style={styles.popupOverlay}>
                    <View style={styles.popupCard}>
                        <Text style={styles.popupTitle}>Babak Selesai!</Text>
                        <Text style={styles.rulesText}>
                            Waktu Anda: {`${Math.floor(timeElapsed / 60000)}`.padStart(2, '0')}:{`${Math.floor((timeElapsed % 60000) / 1000)}`.padStart(2, '0')}
                        </Text>
                        <TouchableOpacity style={styles.popupButton} onPress={handleContinue}>
                            <Text style={styles.popupButtonText}>Lihat Skor Total</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

// --- Stylesheet ---
const NEON_GREEN = '#39FF14';
const DARK_BLUE = '#0d1b2a';
const MID_BLUE = '#1b263b';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const moderateScale = (size, factor = 0.5) => size + ((SCREEN_WIDTH / 375) * size - size) * factor;
const cardMargin = moderateScale(5);
const numColumns = 4;
const cardSize = ((SCREEN_WIDTH * 0.9) - (moderateScale(15) * 2) - (cardMargin * numColumns * 2)) / numColumns;

const styles = StyleSheet.create({
    fullScreenBg: { flex: 1, backgroundColor: DARK_BLUE, overflow: 'hidden' },
    gameContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    countdownOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    countdownText: { fontSize: moderateScale(100), fontWeight: 'bold', color: '#FFFFFF', textShadowColor: 'rgba(57, 255, 20, 0.7)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
    frameOuter: { width: '90%', height: '92%', borderRadius: moderateScale(30), backgroundColor: MID_BLUE, borderWidth: 2, borderColor: `rgba(57, 255, 20, 0.2)` },
    frameInner: { flex: 1, borderRadius: moderateScale(28), backgroundColor: DARK_BLUE, padding: moderateScale(15) },
    topSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: moderateScale(5), marginBottom: moderateScale(5), borderBottomWidth: 1, borderBottomColor: `rgba(57, 255, 20, 0.3)` },
    infoBox: { backgroundColor: 'rgba(0,0,0,0.25)', paddingVertical: moderateScale(5), paddingHorizontal: moderateScale(15), borderRadius: moderateScale(12), borderWidth: 1, borderColor: 'rgba(57, 255, 20, 0.4)', alignItems: 'center', minWidth: '60%' },
    infoLabel: { color: '#a0aec0', fontSize: moderateScale(12), fontWeight: '600', marginBottom: moderateScale(2) },
    timerText: { fontSize: moderateScale(24), fontWeight: 'bold', color: '#FFFFFF', fontVariant: ['tabular-nums'] },
    middleSection: { flex: 1, borderRadius: moderateScale(20), marginTop: moderateScale(15), justifyContent: 'center' },
    cardGridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
    cardWrapper: { width: cardSize, height: cardSize, margin: cardMargin },
    cardFace: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: moderateScale(8), borderWidth: 1, borderColor: `rgba(57, 255, 20, 0.4)`, backfaceVisibility: 'hidden' },
    cardMatched: { backgroundColor: 'rgba(57, 255, 20, 0.15)', borderColor: NEON_GREEN },
    cardImage: { width: '85%', height: '85%' },
    cardCover: { width: '100%', height: '100%', opacity: 0.7 },
    popupOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    popupCard: { width: '85%', backgroundColor: MID_BLUE, borderRadius: 20, paddingVertical: 30, paddingHorizontal: 25, alignItems: 'center', borderWidth: 1, borderColor: `rgba(57, 255, 20, 0.3)` },
    popupTitle: { fontSize: moderateScale(28), fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
    rulesText: { fontSize: moderateScale(16), color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', marginBottom: 30, lineHeight: moderateScale(24) },
    popupButton: { backgroundColor: NEON_GREEN, paddingVertical: 15, paddingHorizontal: 60, borderRadius: 30 },
    popupButtonText: { color: DARK_BLUE, fontSize: moderateScale(18), fontWeight: 'bold' },
});