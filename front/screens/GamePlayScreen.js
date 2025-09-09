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

// --- FUNGSI & HELPER UNTUK RESPONSIVE ---
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const widthScale = size => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const heightScale = size => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (widthScale(size) - size) * factor;

// --- Komponen untuk Animasi Angka Skor ---
const AnimatedScore = ({ value }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [currentScore, setCurrentScore] = useState(0);

    useEffect(() => {
        const listener = animatedValue.addListener(({ value }) => {
            setCurrentScore(Math.round(value));
        });
        return () => animatedValue.removeListener(listener);
    }, [animatedValue]);

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    }, [value, animatedValue]);

    return <Text style={styles.scoreValueText}>{currentScore}</Text>;
};


// --- ASET GAME ---
const ITEMS_POOL = [
    { id: 'item1', image: require('../assets/herbal.png') },
    { id: 'item2', image: require('../assets/herbal1.png') },
    { id: 'item3', image: require('../assets/herbal2.png') },
    { id: 'item4', image: require('../assets/herbal3.png') },
    { id: 'item5', image: require('../assets/herbal4.png') },
    { id: 'item6', image: require('../assets/herbal5.png') },
    { id: 'item7', image: require('../assets/herbal6.png') },
    { id: 'item8', image: require('../assets/herbal7.png') },
    { id: 'item9', image: require('../assets/herbal8.png') },
    { id: 'item10', image: require('../assets/herbal9.png') },
    { id: 'item11', image: require('../assets/herbal10.png') },
    { id: 'item12', image: require('../assets/herbal11.png') },
    { id: 'item13', image: require('../assets/herbal12.png') },
    { id: 'item14', image: require('../assets/herbal13.png') },
    { id: 'item15', image: require('../assets/herbal14.png') },
    { id: 'item16', image: require('../assets/pil.png') },
    { id: 'item17', image: require('../assets/pil1.png') },
    { id: 'item18', image: require('../assets/pil2.png') },
    { id: 'item19', image: require('../assets/pil3.png') },
    { id: 'item20', image: require('../assets/pil4.png') },
    { id: 'item21', image: require('../assets/pil5.png') },
    { id: 'item22', image: require('../assets/pil6.png') },
    { id: 'item23', image: require('../assets/pil7.png') },
    { id: 'item24', image: require('../assets/pil8.png') },
    { id: 'item25', image: require('../assets/pil9.png') },
    { id: 'item26', image: require('../assets/pil10.png') },
    { id: 'item27', image: require('../assets/pil11.png') },
    { id: 'item28', image: require('../assets/sirup.png') },
    { id: 'item29', image: require('../assets/sirup2.png') },
    { id: 'item30', image: require('../assets/sirup3.png') },
    { id: 'item31', image: require('../assets/sirup4.png') },
    { id: 'item32', image: require('../assets/sirup5.png') },
    { id: 'item33', image: require('../assets/sirup6.png') },
    { id: 'item34', image: require('../assets/sirup7.png') },
    { id: 'item35', image: require('../assets/sirup8.png') },
    { id: 'item36', image: require('../assets/sirup9.png') },
    { id: 'item37', image: require('../assets/sirup10.png') },
    { id: 'item38', image: require('../assets/sirup11.png') },
    { id: 'item39', image: require('../assets/sirup12.png') },
];

const DROP_ZONE_IMAGE = require('../assets/assetgame2/kotak2.png');
const BACKGROUND_IMAGE = require('../assets/game-bg.png');

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// --- Konstanta untuk pengaturan game ---
const NORMAL_SPEED = 2500;
const FAST_SPEED = 1000;
const GAME_DURATION_MS = 60000;
const PENALTY_TIME_MS = 1500;
const NUM_ROWS_TO_DISPLAY = 5;
const ITEMS_PER_ROW = 3;

export default function GamePlayScreen({ route, navigation }) {
    // [TAMBAHKAN INI] Terima playerName dari layar sebelumnya
    const playerName = route.params?.playerName || 'Pemain';

    const [score, setScore] = useState(0);
    const [gameItems, setGameItems] = useState([]);
    const [targetItem, setTargetItem] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [dropZoneColor, setDropZoneColor] = useState('rgba(57, 255, 20, 0.1)');
    const [flyingItems, setFlyingItems] = useState([]);
    const [animationSpeed, setAnimationSpeed] = useState(NORMAL_SPEED);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS);
    const [isPreGame, setIsPreGame] = useState(true);
    const [countdownText, setCountdownText] = useState('3');

    const dropZoneCenter = useRef({ x: 0, y: 0 }).current;
    const loopAnimationValue = useRef(new Animated.Value(0)).current;
    const dropZoneRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const dropZoneScale = useRef(new Animated.Value(1)).current;
    const scoreScale = useRef(new Animated.Value(1)).current;
    const intervalRef = useRef(null);

    const selectNewTarget = (excludeId = null) => {
        const availableItems = excludeId
            ? gameItems.filter(i => i.id !== excludeId)
            : gameItems;

        if (availableItems.length > 0) {
            const newTarget = availableItems[Math.floor(Math.random() * availableItems.length)];
            setTargetItem({ ...newTarget });
        } else {
            setIsGameOver(true);
        }
    };

    useEffect(() => {
        const activeItems = shuffleArray(ITEMS_POOL).slice(0, NUM_ROWS_TO_DISPLAY * ITEMS_PER_ROW);
        setGameItems(activeItems.map(item => ({ ...item, uniqueKey: `${item.id}_${Math.random()}` })));
        
        if (activeItems.length > 0) {
            const newTarget = activeItems[Math.floor(Math.random() * activeItems.length)];
            setTargetItem({ ...newTarget });
        }
    }, []);

    useEffect(() => {
        if (!isPreGame) return;
        let count = 3;
        setCountdownText(String(count));
        const countdownInterval = setInterval(() => {
            count -= 1;
            if (count > 0) {
                setCountdownText(String(count));
            } else if (count === 0) {
                setCountdownText('MULAI!');
            } else {
                clearInterval(countdownInterval);
                setIsPreGame(false);
            }
        }, 1000);
        return () => clearInterval(countdownInterval);
    }, [isPreGame]);
    
    useEffect(() => {
        if (isGameOver || isPreGame) return;
        loopAnimationValue.setValue(0);
        const loop = Animated.loop(Animated.timing(loopAnimationValue, { toValue: 1, duration: animationSpeed, easing: Easing.linear, useNativeDriver: false }));
        loop.start();
        return () => loop.stop();
    }, [animationSpeed, isGameOver, isPreGame]);
    
    useEffect(() => {
        if (isGameOver || isPreGame) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                const newTimeLeft = prevTime - 50;
                if (newTimeLeft <= 0) {
                    clearInterval(intervalRef.current);
                    setIsGameOver(true);
                    return 0;
                }
                return newTimeLeft;
            });
        }, 50);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isGameOver, isPreGame]);

    const handleDropZoneLayout = useCallback(() => {
        if (dropZoneRef.current && !isLayoutReady) {
            dropZoneRef.current.measure((x, y, width, height, pageX, pageY) => {
                if (width > 0 && height > 0) {
                    dropZoneCenter.x = pageX + (width / 2);
                    dropZoneCenter.y = pageY + (height / 2);
                    setIsLayoutReady(true);
                }
            });
        }
    }, [isLayoutReady]);
    
    useEffect(() => {
        if (!isPreGame) {
            scoreScale.setValue(1.2);
            Animated.spring(scoreScale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }).start();
        }
    }, [score]);


    const handleItemTap = (tappedItem, pressEvent) => {
        if (isGameOver || isPreGame || !targetItem || !isLayoutReady) return;
        Animated.sequence([
            Animated.timing(dropZoneScale, { toValue: 1.15, duration: 150, useNativeDriver: true }),
            Animated.spring(dropZoneScale, { toValue: 1, friction: 3, useNativeDriver: true })
        ]).start();
        const itemSize = moderateScale(55, 0.4);
        const { pageX, pageY } = pressEvent;
        const newFlyer = { id: Date.now(), image: tappedItem.image, position: new Animated.ValueXY({ x: pageX - itemSize / 2, y: pageY - itemSize / 2 }), rotation: new Animated.Value(0), };
        setFlyingItems(prev => [...prev, newFlyer]);
        Animated.parallel([
            Animated.timing(newFlyer.position, { toValue: { x: dropZoneCenter.x - itemSize / 2, y: dropZoneCenter.y - itemSize / 2 }, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: false, }),
            Animated.timing(newFlyer.rotation, { toValue: 2, duration: 800, easing: Easing.linear, useNativeDriver: false, })
        ]).start(() => {
            setFlyingItems(prev => prev.filter(f => f.id !== newFlyer.id));
        });
        const isCorrect = tappedItem.id === targetItem.id;
        setDropZoneColor(isCorrect ? 'rgba(74, 222, 128, 0.4)' : 'rgba(248, 113, 113, 0.4)');
        setTimeout(() => setDropZoneColor('rgba(57, 255, 20, 0.1)'), 400);
        if (isCorrect) {
            setScore(prev => prev + 10);
            selectNewTarget(targetItem.id);
        } else {
            setScore(prev => Math.max(0, prev - 5));
            setTimeLeft(prevTime => Math.max(0, prevTime - PENALTY_TIME_MS));
            setAnimationSpeed(FAST_SPEED);
            setTimeout(() => {
                setAnimationSpeed(NORMAL_SPEED);
            }, 2500);
        }
    };
    
    const handleNext = () => {
        // [PERBAIKI DI SINI] Kirim skor DARI GAME INI dan playerName ke Game 2
        navigation.replace('GamePlayScreen2', { 
            scoreGame1: score,
            playerName: playerName
        });
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        const milliseconds = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
        return `${minutes}:${seconds}:${milliseconds}`;
    };
    
    const itemWidthWithMargin = moderateScale(60, 0.4) + moderateScale(10, 0.2) * 2;
    const totalRowWidth = itemWidthWithMargin * ITEMS_PER_ROW; 

    const itemsPerRow = ITEMS_PER_ROW;
    const numRows = NUM_ROWS_TO_DISPLAY;

    const rows = Array.from({ length: numRows }).map((_, rowIndex) => {
        const start = rowIndex * itemsPerRow;
        const end = start + itemsPerRow;
        const translateX = loopAnimationValue.interpolate({
            inputRange: [0, 1],
            outputRange: rowIndex % 2 === 0 ? [0, -totalRowWidth] : [0, totalRowWidth]
        });
        return {
            items: gameItems.slice(start, end),
            anim: translateX
        };
    });

    return (
        <View style={styles.fullScreenBg}>
            <StatusBar barStyle="light-content" />
            <ImageBackground source={BACKGROUND_IMAGE} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <View style={styles.gameContainer} pointerEvents={isPreGame || isGameOver ? 'none' : 'auto'}>
                <View style={styles.frameOuter}>
                    <View style={styles.frameInner}>
                        <View style={styles.topSection}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>WAKTU</Text>
                                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                            </View>
                            <Animated.View style={[styles.infoBox, { transform: [{ scale: scoreScale }] }]}>
                                <Text style={styles.infoLabel}>SKOR</Text>
                                <AnimatedScore value={score} />
                            </Animated.View>
                        </View>
                        <Text style={styles.instructionText}>
                            Tap item sesuai dengan kotak yang dicari
                        </Text>
                        <View style={styles.middleSection}>
                            <View style={styles.animationContainer}>
                                {rows.map((row, rowIndex) => (
                                    <Animated.View key={rowIndex} style={[styles.itemRow, { transform: [{ translateX: row.anim }] }]}>
                                        {Array.from({ length: 7 }).map((_, repeatIndex) => (
                                            <React.Fragment key={`${rowIndex}-${repeatIndex}`}>
                                                {row.items.map((item, itemIndex) => (
                                                    <TouchableOpacity
                                                        accessible={false}
                                                        key={`${item.uniqueKey}-${rowIndex}-${repeatIndex}-${itemIndex}`}
                                                        style={styles.gridItem}
                                                        onPress={(event) => handleItemTap(item, event.nativeEvent)} >
                                                        <Image source={item.image} style={styles.gridItemImage} resizeMode="contain" />
                                                    </TouchableOpacity>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </Animated.View>
                                ))}
                            </View>
                        </View>
                        <View style={styles.bottomSection}>
                            <View style={styles.targetDisplayBox}>
                                <Text style={[styles.boxLabel, { top: heightScale(5) }]}>CARI OBAT INI</Text>
                                {targetItem && <Image source={targetItem.image} style={styles.targetItemImage} resizeMode="contain" />}
                            </View>
                            <Animated.View style={[styles.dropZoneBox, { backgroundColor: dropZoneColor, transform: [{ scale: dropZoneScale }] }]}>
                                <View
                                    ref={dropZoneRef}
                                    onLayout={handleDropZoneLayout}
                                    style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }} >
                                    <Image source={DROP_ZONE_IMAGE} style={styles.dropZoneImage} resizeMode="contain" />
                                </View>
                            </Animated.View>
                        </View>
                    </View>
                </View>
            </View>
            {isPreGame && (
                <View style={styles.countdownOverlay}>
                    <Text style={styles.countdownText}>{countdownText}</Text>
                </View>
            )}

            {isGameOver && (
                <View style={styles.popupOverlay}>
                    <View style={styles.popupCard}>
                        <Text style={styles.popupTitle}>Permainan Selesai</Text>
                        <Text style={styles.popupScoreLabel}>Skor Babak Ini</Text>
                        <Text style={styles.popupScoreValue}>{score}</Text>
                        <TouchableOpacity style={styles.popupButton} onPress={handleNext}>
                            <Text style={styles.popupButtonText}>Lanjut</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.overlayContainer} pointerEvents="none">
                {flyingItems.map(flyer => {
                    const interpolatedRotate = flyer.rotation.interpolate({ inputRange: [0, 2], outputRange: ['0deg', '720deg'] });
                    const flyerStyle = { ...flyer.position.getLayout(), transform: [{ rotate: interpolatedRotate }] };
                    return (
                        <Animated.View key={flyer.id} style={[styles.flyingItem, flyerStyle]}>
                            <Image source={flyer.image} style={styles.flyingItemImage} />
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}

// --- Stylesheet ---
const NEON_GREEN = '#39FF14';
const DARK_BLUE = '#0d1b2a';
const MID_BLUE = '#1b263b';

const styles = StyleSheet.create({
    fullScreenBg: {
        flex: 1,
        backgroundColor: DARK_BLUE,
        overflow: 'hidden',
    },
    gameContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
    },
    countdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    countdownText: {
        fontSize: moderateScale(100),
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(57, 255, 20, 0.7)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    frameOuter: {
        width: widthScale(340), // Responsive width
        height: heightScale(747), // Responsive height
        borderRadius: moderateScale(30),
        backgroundColor: MID_BLUE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: heightScale(10) },
        shadowOpacity: 0.5,
        shadowRadius: moderateScale(20),
        borderWidth: widthScale(2),
        borderColor: `rgba(57, 255, 20, 0.2)`,
        elevation: moderateScale(20),
    },
    frameInner: {
        flex: 1,
        borderRadius: moderateScale(28),
        backgroundColor: DARK_BLUE,
        padding: moderateScale(15),
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: heightScale(5),
        marginBottom: heightScale(5),
        borderBottomWidth: widthScale(1),
        borderBottomColor: `rgba(57, 255, 20, 0.3)`,
    },
    infoBox: {
        backgroundColor: 'rgba(0,0,0,0.25)',
        paddingVertical: heightScale(5),
        paddingHorizontal: widthScale(15),
        borderRadius: moderateScale(12),
        borderWidth: widthScale(1),
        borderColor: 'rgba(57, 255, 20, 0.4)',
        alignItems: 'center',
        minWidth: widthScale(140),
    },
    infoLabel: {
        color: '#a0aec0',
        fontSize: moderateScale(12),
        fontWeight: '600',
        marginBottom: heightScale(2),
    },
    timerText: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
    scoreValueText: {
        fontSize: moderateScale(28),
        fontWeight: '900',
        color: NEON_GREEN,
        textShadowColor: NEON_GREEN,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: moderateScale(15),
    },
    instructionText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: moderateScale(14),
        fontWeight: '500',
        textAlign: 'center',
    },
    middleSection: {
        flex: 4.8,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: moderateScale(20),
        marginTop: heightScale(15),
        borderWidth: widthScale(1),
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'space-around',
    },
    animationContainer: {
        width: '500%',
        height: '100%',
        justifyContent: 'space-around',
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: '-50%' }],
    },
    itemRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridItem: {
        width: moderateScale(60, 0.4),
        height: moderateScale(60, 0.4),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: moderateScale(10),
        marginHorizontal: moderateScale(10, 0.2),
    },
    gridItemImage: {
        width: '80%',
        height: '80%',
    },
    bottomSection: {
        flex: 2.5,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: heightScale(15),
    },
    boxLabel: {
        color: NEON_GREEN,
        fontSize: moderateScale(14),
        fontWeight: '700',
        textShadowColor: NEON_GREEN,
        textShadowRadius: moderateScale(8),
        textAlign: 'center',
    },
    targetDisplayBox: {
        width: widthScale(140),
        height: heightScale(140),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: moderateScale(20),
        borderWidth: widthScale(2),
        borderColor: MID_BLUE,
        padding: moderateScale(5),
    },
    targetItemImage: {
        width: '70%',
        height: '70%',
        marginTop: heightScale(10),
    },
    dropZoneBox: {
        width: widthScale(140),
        height: heightScale(140),
        borderRadius: moderateScale(20),
        borderWidth: widthScale(1),
        borderColor: `rgba(57, 255, 20, 0.5)`,
    },
    dropZoneImage: {
        width: '100%',
        height: '100%',
        opacity: 0.9,
    },
    flyingItem: {
        position: 'absolute',
        width: moderateScale(55, 0.4),
        height: moderateScale(55, 0.4),
        zIndex: 2000,
    },
    flyingItemImage: {
        width: '100%',
        height: '100%',
    },
    popupOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    popupCard: {
        width: widthScale(300),
        backgroundColor: MID_BLUE,
        borderRadius: moderateScale(20),
        paddingVertical: heightScale(30),
        paddingHorizontal: widthScale(25),
        alignItems: 'center',
        borderWidth: widthScale(1),
        borderColor: `rgba(57, 255, 20, 0.3)`,
        shadowColor: NEON_GREEN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: moderateScale(15),
        elevation: moderateScale(20),
    },
    popupTitle: {
        fontSize: moderateScale(28),
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: heightScale(25),
    },
    popupScoreLabel: {
        fontSize: moderateScale(18),
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: heightScale(5),
    },
    popupScoreValue: {
        fontSize: moderateScale(60),
        fontWeight: 'bold',
        color: NEON_GREEN,
        marginBottom: heightScale(35),
        textShadowColor: 'rgba(57, 255, 20, 0.7)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: moderateScale(20),
    },
    popupButton: {
        backgroundColor: NEON_GREEN,
        paddingVertical: heightScale(15),
        paddingHorizontal: widthScale(60),
        borderRadius: moderateScale(30),
        shadowColor: NEON_GREEN,
        shadowOffset: { width: 0, height: heightScale(4) },
        shadowOpacity: 0.8,
        shadowRadius: moderateScale(10),
        elevation: moderateScale(10),
    },
    popupButtonText: {
        color: DARK_BLUE,
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
});

export default GamePlayScreen;
