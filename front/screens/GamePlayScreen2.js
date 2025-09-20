import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Animated,
    ImageBackground,
    Easing,
    TouchableOpacity,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* -------------------------------------------
    HOOK RESPONSIVE
--------------------------------------------*/
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

function useResponsive() {
    const [screen, setScreen] = useState(Dimensions.get('window'));
    useEffect(() => {
        const sub = Dimensions.addEventListener('change', ({ window }) => setScreen(window));
        return () => {
            if (typeof sub?.remove === 'function') sub.remove();
        };
    }, []);
    const widthScale = useCallback((size) => (screen.width / guidelineBaseWidth) * size, [screen.width]);
    const heightScale = useCallback((size) => (screen.height / guidelineBaseHeight) * size, [screen.height]);
    const moderateScale = useCallback((size, factor = 0.5) => size + (widthScale(size) - size) * factor, [widthScale]);
    return { screenWidth: screen.width, screenHeight: screen.height, widthScale, heightScale, moderateScale };
}

/* -------------------------------------------
    ASET & KONFIGURASI GAME
--------------------------------------------*/
const ALL_FOOD_ITEMS = [
    { id: 'food1', image: require('../assets/assetgame2/makanan1.png'), category: 'makanan' },
    { id: 'food2', image: require('../assets/assetgame2/makanan2.png'), category: 'makanan' },
    { id: 'food3', image: require('../assets/assetgame2/makanan3.png'), category: 'makanan' },
    { id: 'food4', image: require('../assets/assetgame2/makanan4.png'), category: 'makanan' },
    { id: 'food5', image: require('../assets/assetgame2/makanan5.png'), category: 'makanan' },
    { id: 'food6', image: require('../assets/assetgame2/makanan6.png'), category: 'makanan' },
    { id: 'food7', image: require('../assets/assetgame2/makanan7.png'), category: 'makanan' },
    { id: 'food8', image: require('../assets/assetgame2/makanan8.png'), category: 'makanan' },
    { id: 'food9', image: require('../assets/assetgame2/makanan9.png'), category: 'makanan' },
    { id: 'food10', image: require('../assets/assetgame2/makanan10.png'), category: 'makanan' },
    { id: 'food11', image: require('../assets/assetgame2/makanan11.png'), category: 'makanan' },
    { id: 'food12', image: require('../assets/assetgame2/makanan12.png'), category: 'makanan' },
    { id: 'food13', image: require('../assets/assetgame2/makanan13.png'), category: 'makanan' },
    { id: 'food14', image: require('../assets/assetgame2/makanan14.png'), category: 'makanan' },
    { id: 'food15', image: require('../assets/assetgame2/makanan15.png'), category: 'makanan' },
    { id: 'food16', image: require('../assets/assetgame2/makanan16.png'), category: 'makanan' },
    { id: 'food17', image: require('../assets/assetgame2/makanan17.png'), category: 'makanan' },
    { id: 'food18', image: require('../assets/assetgame2/makanan18.png'), category: 'makanan' },
    { id: 'food19', image: require('../assets/assetgame2/makanan19.png'), category: 'makanan' },
    { id: 'food20', image: require('../assets/assetgame2/makanan20.png'), category: 'makanan' },
    { id: 'food21', image: require('../assets/assetgame2/makanan21.png'), category: 'makanan' },
    { id: 'food22', image: require('../assets/assetgame2/makanan22.png'), category: 'makanan' },
    { id: 'food23', image: require('../assets/assetgame2/makanan23.png'), category: 'makanan' },
    { id: 'food24', image: require('../assets/assetgame2/makanan24.png'), category: 'makanan' },
    { id: 'food25', image: require('../assets/assetgame2/makanan25.png'), category: 'makanan' },
];

const ALL_AVOID_ITEMS = [
    { id: 'item1', image: require('../assets/herbal.png'), category: 'obat' },
    { id: 'item3', image: require('../assets/herbal2.png'), category: 'obat' },
    { id: 'item5', image: require('../assets/herbal4.png'), category: 'obat' },
    { id: 'item16', image: require('../assets/pil.png'), category: 'obat' },
    { id: 'item18', image: require('../assets/pil2.png'), category: 'obat' },
    { id: 'item20', image: require('../assets/pil4.png'), category: 'obat' },
    { id: 'item28', image: require('../assets/sirup.png'), category: 'obat' },
    { id: 'item30', image: require('../assets/sirup3.png'), category: 'obat' },
];

const ALL_GAME_ITEMS = [...ALL_FOOD_ITEMS, ...ALL_AVOID_ITEMS];

const CATCHER_IMAGE = require('../assets/assetgame2/kotak2.png');
const BACKGROUND_IMAGE = require('../assets/game-bg.png');

const GAME_DURATION_MS = 60000;
const INITIAL_ITEM_FALL_DURATION = 4000;
const FINAL_ITEM_FALL_DURATION = 2000;
const SPAWN_INTERVAL_MIN = 500;
const SPAWN_INTERVAL_MAX = 1000;
const VERY_DANGEROUS_SPAWN_CHANCE = 0.1;
const AVOID_ITEM_SPAWN_CHANCE = 0.4;

const NEON_GREEN = '#39FF14';
const DARK_BLUE = '#0d1b2a';
const MID_BLUE = '#1b263b';
const RED_DANGER = '#FF4D4D';


/* -------------------------------------------
    FallingItem Component
--------------------------------------------*/
const FallingItem = memo(({ itemObject, onMiss, gameAreaHeight }) => {
    useEffect(() => {
        if (gameAreaHeight <= 0) return;
        const listenerId = itemObject.positionY.addListener(({ value }) => {
            if (value >= gameAreaHeight && !itemObject.isBeingRemoved) {
                onMiss(itemObject.key);
            }
        });
        return () => {
            itemObject.positionY.removeListener(listenerId);
        };
    }, [itemObject, onMiss, gameAreaHeight]);

    useEffect(() => {
        if (itemObject.item.type === 'veryDangerous') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(itemObject.wrapperScale, { toValue: 1.1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(itemObject.wrapperScale, { toValue: 1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            ).start();
        }
    }, [itemObject.item.type, itemObject.wrapperScale]);

    return (
        <Animated.View
            style={[
                itemObject.styles.itemWrapper,
                itemObject.item.type === 'veryDangerous' && {
                    backgroundColor: RED_DANGER,
                    borderColor: '#FF0000',
                    shadowColor: RED_DANGER,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: 15,
                },
                {
                    transform: [
                        { translateX: itemObject.positionX },
                        { translateY: itemObject.positionY },
                        { scale: itemObject.scale },
                        { scale: itemObject.wrapperScale },
                    ],
                    opacity: itemObject.opacity,
                },
            ]}
        >
            <Image source={itemObject.item.image} style={itemObject.styles.gridItemImage} resizeMode="contain" />
        </Animated.View>
    );
});

/* -------------------------------------------
    GamePlayScreen Component
--------------------------------------------*/
export default function GamePlayScreen2({ route, navigation }) {
    const { screenWidth, screenHeight, widthScale, heightScale, moderateScale } = useResponsive();

    const CATCHER_WIDTH = Math.max(moderateScale(110), screenWidth * 0.28);
    const CATCHER_HEIGHT = Math.max(moderateScale(200), screenHeight * 0.09);
    const ITEM_SIZE = Math.max(moderateScale(70), Math.min(screenWidth, screenHeight) * 0.12);
    const CATCHER_BOTTOM = heightScale(-40);
    
    const playerName = route.params?.playerName || 'Pemain';
    const scoreGame1 = route.params?.scoreGame1 || 0;

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPreGame, setIsPreGame] = useState(true);
    const [fallingItems, setFallingItems] = useState([]);
    const [catcherFacingRight, setCatcherFacingRight] = useState(true);
    const [showRules, setShowRules] = useState(true);
    const [countdownText, setCountdownText] = useState('');
    const [notificationText, setNotificationText] = useState('');
    const [notificationType, setNotificationType] = useState('normal'); 
    const notificationOpacity = useRef(new Animated.Value(0)).current;

    const animatedScore = useRef(new Animated.Value(0)).current;
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        const listener = animatedScore.addListener(({ value }) => {
            setDisplayScore(Math.round(value));
        });
        return () => animatedScore.removeListener(listener);
    }, [animatedScore]);

    useEffect(() => {
        Animated.timing(animatedScore, {
            toValue: score,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [score, animatedScore]);

    const gameAreaLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const catcherPosition = useRef(new Animated.Value(0)).current;
    const lastCatcherPosition = useRef(0);
    const catcherScale = useRef(new Animated.Value(1)).current;
    const leftBtnScale = useRef(new Animated.Value(1)).current;
    const rightBtnScale = useRef(new Animated.Value(1)).current;
    const scoreScale = useRef(new Animated.Value(1)).current;
    const moveInterval = useRef(null);
    const activeItems = useRef({});
    const nextItemId = useRef(0);
    const isInitialLayoutDone = useRef(false);
    const countdownTimers = useRef([]);
    const timeLeftRef = useRef(GAME_DURATION_MS);

    // --- STYLESHEET RESPONSIVE ---
    const styles = useMemo(() => StyleSheet.create({
        fullScreenBg: { flex: 1, backgroundColor: DARK_BLUE, overflow: 'hidden' },
        gameContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
        frameOuter: { width: widthScale(340), height: heightScale(650), borderRadius: moderateScale(30), backgroundColor: MID_BLUE, overflow: 'hidden', borderWidth: moderateScale(3), borderColor: NEON_GREEN, shadowColor: NEON_GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: moderateScale(15), elevation: moderateScale(30), marginBottom: heightScale(110) },
        frameInner: { flex: 1, borderRadius: moderateScale(28), backgroundColor: DARK_BLUE, padding: moderateScale(5) },
        topSection: { paddingHorizontal: moderateScale(20), paddingVertical: moderateScale(12), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(27, 38, 59, 0.7)', borderRadius: moderateScale(15), marginHorizontal: moderateScale(10), marginTop: moderateScale(5), borderWidth: moderateScale(1), borderColor: NEON_GREEN, shadowColor: NEON_GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: moderateScale(8), elevation: moderateScale(15) },
        objectiveTextContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(27, 38, 59, 0.7)', borderRadius: moderateScale(15), marginHorizontal: moderateScale(10), marginBottom: moderateScale(5), paddingVertical: moderateScale(8), borderWidth: moderateScale(1), borderColor: NEON_GREEN, shadowColor: NEON_GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: moderateScale(8), elevation: moderateScale(15) },
        timerText: { fontSize: moderateScale(22), fontWeight: 'bold', color: '#fff', fontVariant: ['tabular-nums'] },
        scoreText: { fontSize: moderateScale(22), fontWeight: '900', color: NEON_GREEN },
        objectiveText: { color: '#FFF', fontSize: moderateScale(18), fontWeight: 'bold', textTransform: 'uppercase' },
        gameArea: { flex: 1, position: 'relative', overflow: 'hidden' },
        catcher: { width: CATCHER_WIDTH, height: CATCHER_HEIGHT, position: 'absolute', bottom: CATCHER_BOTTOM },
        catcherImage: { flex: 1, width: '100%', height: '100%' },
        itemWrapper: { position: 'absolute', width: ITEM_SIZE, height: ITEM_SIZE, backgroundColor: 'rgba(173, 216, 230, 0.25)', borderRadius: ITEM_SIZE / 2, borderWidth: moderateScale(2), borderColor: 'rgba(255, 255, 255, 0.4)', justifyContent: 'center', alignItems: 'center' },
        gridItemImage: { width: '80%', height: '80%' },
        controlsContainer: { position: 'absolute', bottom: heightScale(20), left: widthScale(20), right: widthScale(20), height: heightScale(90), backgroundColor: 'rgba(27, 38, 59, 0.8)', borderRadius: moderateScale(25), borderWidth: moderateScale(2), borderColor: NEON_GREEN, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: widthScale(20), shadowColor: NEON_GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: moderateScale(10), elevation: moderateScale(20) },
        controlButtonWrapper: { transform: [{ scale: 1 }] },
        arrowBtn: { backgroundColor: 'transparent', borderWidth: moderateScale(3), borderColor: NEON_GREEN, width: moderateScale(65), height: moderateScale(65), borderRadius: moderateScale(35), justifyContent: 'center', alignItems: 'center', shadowColor: NEON_GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: moderateScale(10), elevation: moderateScale(20) },
        arrowText: { fontSize: moderateScale(35), fontWeight: 'bold', color: NEON_GREEN, lineHeight: moderateScale(40) },
        overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
        popupContainer: { width: widthScale(300), backgroundColor: MID_BLUE, borderRadius: moderateScale(20), padding: moderateScale(25), borderWidth: moderateScale(2), borderColor: NEON_GREEN, alignItems: 'center' },
        popupTitle: { fontSize: moderateScale(28), fontWeight: 'bold', color: '#fff', marginBottom: moderateScale(15) },
        popupText: { fontSize: moderateScale(16), color: '#eee', textAlign: 'center', marginBottom: moderateScale(10) },
        finalScoreText: { fontSize: moderateScale(70), fontWeight: '900', color: NEON_GREEN, textShadowColor: NEON_GREEN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: moderateScale(20), marginVertical: moderateScale(15) },
        popupButton: { marginTop: moderateScale(15), backgroundColor: NEON_GREEN, paddingVertical: moderateScale(12), paddingHorizontal: moderateScale(40), borderRadius: moderateScale(15) },
        popupButtonText: { fontSize: moderateScale(18), fontWeight: 'bold', color: DARK_BLUE },
        countdown: { fontSize: moderateScale(90), fontWeight: '900', color: '#fff', textShadowColor: NEON_GREEN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: moderateScale(20) },
        notificationContainer: { position: 'absolute', top: '40%', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: moderateScale(30), paddingVertical: moderateScale(15), borderRadius: moderateScale(20), borderWidth: moderateScale(2), zIndex: 20 },
        notificationText: { fontSize: moderateScale(28), fontWeight: '900', textTransform: 'uppercase' },
    }), [CATCHER_WIDTH, CATCHER_HEIGHT, ITEM_SIZE, CATCHER_BOTTOM, moderateScale, heightScale, widthScale]);

    const triggerNotification = useCallback((message, type = 'normal') => {
        setNotificationText(message);
        setNotificationType(type);
        Animated.sequence([
            Animated.timing(notificationOpacity, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
            Animated.delay(1000),
            Animated.timing(notificationOpacity, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
        ]).start();
    }, [notificationOpacity]);
    
    const startGameSequence = useCallback(() => {
        setShowRules(false);
        countdownTimers.current.push(setTimeout(() => setCountdownText('3'), 500));
        countdownTimers.current.push(setTimeout(() => setCountdownText('2'), 1500));
        countdownTimers.current.push(setTimeout(() => setCountdownText('1'), 2500));
        countdownTimers.current.push(setTimeout(() => setCountdownText('START!'), 3500));
        countdownTimers.current.push(setTimeout(() => {
            setCountdownText('');
            setIsPreGame(false);
        }, 4500));
    }, []);

    useEffect(() => {
        if (isPreGame) return;
        scoreScale.setValue(1.3);
        Animated.spring(scoreScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    }, [score, isPreGame]);

    useEffect(() => {
        const listenerId = catcherPosition.addListener(({ value }) => { lastCatcherPosition.current = value; });
        return () => {
            catcherPosition.removeListener(listenerId);
            countdownTimers.current.forEach(clearTimeout);
        };
    }, [catcherPosition]);

    useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

    const handlePressInDirection = useCallback((direction, scaleValue) => {
        Animated.spring(scaleValue, { toValue: 0.9, useNativeDriver: true, friction: 5 }).start();
        if (direction === 1) setCatcherFacingRight(false);
        else if (direction === -1) setCatcherFacingRight(true);
    }, []);

    const handleSingleTap = useCallback((direction) => {
        const step = screenWidth * 0.1;
        const maxX = Math.max(0, gameAreaLayout.current.width - CATCHER_WIDTH);
        let newX = lastCatcherPosition.current + (direction * step);
        newX = Math.max(0, Math.min(newX, maxX));
        if (direction === 1) setCatcherFacingRight(false);
        else if (direction === -1) setCatcherFacingRight(true);
        Animated.timing(catcherPosition, { toValue: newX, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start();
    }, [screenWidth, CATCHER_WIDTH, catcherPosition]);

    const moveContinuously = useCallback((direction) => {
        const step = screenWidth * 0.04;
        const maxX = Math.max(0, gameAreaLayout.current.width - CATCHER_WIDTH);
        let newX = lastCatcherPosition.current + (direction * step);
        newX = Math.max(0, Math.min(newX, maxX));
        if (direction === 1) setCatcherFacingRight(false);
        else if (direction === -1) setCatcherFacingRight(true);
        catcherPosition.setValue(newX);
    }, [screenWidth, CATCHER_WIDTH, catcherPosition]);

    const startContinuousMove = useCallback((direction) => {
        if (moveInterval.current) clearInterval(moveInterval.current);
        if (direction === 1) setCatcherFacingRight(false);
        else if (direction === -1) setCatcherFacingRight(true);
        moveContinuously(direction);
        moveInterval.current = setInterval(() => moveContinuously(direction), 50);
    }, [moveContinuously]);

    const stopContinuousMove = useCallback(() => {
        if (moveInterval.current) {
            clearInterval(moveInterval.current);
            moveInterval.current = null;
        }
    }, []);

    const handlePressOut = useCallback((scaleValue) => {
        Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
        stopContinuousMove();
    }, [stopContinuousMove]);

    const onGameAreaLayout = useCallback((e) => {
        gameAreaLayout.current = e.nativeEvent.layout;
        if (!isInitialLayoutDone.current && gameAreaLayout.current.width > 0) {
            const centerX = (gameAreaLayout.current.width - CATCHER_WIDTH) / 2;
            catcherPosition.setValue(centerX);
            lastCatcherPosition.current = centerX;
            isInitialLayoutDone.current = true;
        }
    }, [CATCHER_WIDTH, catcherPosition]);

    const removeItem = useCallback((key) => {
        const itemToRemove = activeItems.current[key];
        if (itemToRemove) {
            itemToRemove.positionX.stopAnimation();
            itemToRemove.positionY.stopAnimation();
            itemToRemove.opacity.stopAnimation();
            itemToRemove.scale.stopAnimation();
            itemToRemove.wrapperScale.stopAnimation();
            itemToRemove.positionX.removeAllListeners();
            itemToRemove.positionY.removeAllListeners();
            delete activeItems.current[key];
        }
        setFallingItems(prev => prev.filter(item => item.key !== key));
    }, []);

    const handleItemAction = useCallback((key, action) => {
        const item = activeItems.current[key];
        if (!item || item.isBeingRemoved) return;
        item.isBeingRemoved = true;

        if (action === 'catch') {
            const caughtItem = item.item;
            if (caughtItem.type === 'veryDangerous') {
                setScore(prev => Math.max(0, prev - 20));
                triggerNotification('-20', 'danger');
            } else if (caughtItem.category === 'makanan') {
                setScore(prev => prev + 10);
                triggerNotification('+10', 'normal');
            } else {
                setScore(prev => Math.max(0, prev - 5));
                triggerNotification('-5', 'danger');
            }
        } else {
            triggerNotification('Miss!', 'danger');
        }
        
        Animated.parallel([
            Animated.timing(item.scale, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(item.opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => removeItem(key));
    }, [removeItem, triggerNotification]);

    const spawnNewItem = useCallback(() => {
        if (isGameOver || isPreGame || !gameAreaLayout.current.width) return;
        
        const isVeryDangerous = Math.random() < VERY_DANGEROUS_SPAWN_CHANCE;

        let baseItem;
        if (isVeryDangerous) {
            baseItem = ALL_AVOID_ITEMS[Math.floor(Math.random() * ALL_AVOID_ITEMS.length)];
        } else {
            if (Math.random() < AVOID_ITEM_SPAWN_CHANCE) {
                baseItem = ALL_AVOID_ITEMS[Math.floor(Math.random() * ALL_AVOID_ITEMS.length)];
            } else {
                baseItem = ALL_FOOD_ITEMS[Math.floor(Math.random() * ALL_FOOD_ITEMS.length)];
            }
        }
        
        const itemData = { ...baseItem, type: isVeryDangerous ? 'veryDangerous' : 'normal' };
        const startX = Math.random() * (gameAreaLayout.current.width - ITEM_SIZE);
        const itemId = `item-${nextItemId.current++}`;
        const newItem = {
            key: itemId, item: itemData, positionY: new Animated.Value(-ITEM_SIZE), positionX: new Animated.Value(startX),
            opacity: new Animated.Value(1), scale: new Animated.Value(1),
            wrapperScale: new Animated.Value(1),
            styles: { itemWrapper: styles.itemWrapper, gridItemImage: styles.gridItemImage },
            jsValues: { x: startX, y: -ITEM_SIZE }, isBeingRemoved: false,
        };
        newItem.positionX.addListener(({ value }) => { newItem.jsValues.x = value; });
        newItem.positionY.addListener(({ value }) => { newItem.jsValues.y = value; });
        activeItems.current[itemId] = newItem;
        setFallingItems(prev => [...prev, newItem]);

        const gameProgress = (GAME_DURATION_MS - timeLeftRef.current) / GAME_DURATION_MS;
        const currentFallDuration = INITIAL_ITEM_FALL_DURATION - (INITIAL_ITEM_FALL_DURATION - FINAL_ITEM_FALL_DURATION) * gameProgress;
        
        const fallAnim = Animated.timing(newItem.positionY, {
            toValue: gameAreaLayout.current.height,
            duration: currentFallDuration * (Math.random() * 0.4 + 0.8),
            easing: Easing.linear,
            useNativeDriver: true
        });

        let zigzagAnim;
        if (itemData.type === 'veryDangerous') {
            const zigzagRange = gameAreaLayout.current.width / 2 - ITEM_SIZE;
            const initialZigzagOffset = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * zigzagRange * 0.2 + zigzagRange * 0.1);
            const targetX1 = Math.max(0, Math.min(gameAreaLayout.current.width - ITEM_SIZE, startX + initialZigzagOffset));
            const targetX2 = Math.max(0, Math.min(gameAreaLayout.current.width - ITEM_SIZE, startX - initialZigzagOffset));
            zigzagAnim = Animated.loop(Animated.sequence([
                Animated.timing(newItem.positionX, { toValue: targetX1, duration: Math.random() * 600 + 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(newItem.positionX, { toValue: targetX2, duration: Math.random() * 600 + 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]));
        } else {
            zigzagAnim = Animated.loop(Animated.sequence([
                Animated.timing(newItem.positionX, { toValue: Math.min(gameAreaLayout.current.width - ITEM_SIZE, Math.max(0, startX + (Math.random() * ITEM_SIZE * 1.5))), duration: Math.random() * 800 + 800, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(newItem.positionX, { toValue: startX, duration: Math.random() * 800 + 800, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(newItem.positionX, { toValue: Math.min(gameAreaLayout.current.width - ITEM_SIZE, Math.max(0, startX - (Math.random() * ITEM_SIZE * 1.5))), duration: Math.random() * 800 + 800, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(newItem.positionX, { toValue: startX, duration: Math.random() * 800 + 800, easing: Easing.linear, useNativeDriver: true }),
            ]));
        }

        Animated.parallel([fallAnim, zigzagAnim]).start(({ finished }) => {
            if (finished) handleItemAction(itemId, 'miss');
        });
    }, [isGameOver, isPreGame, ITEM_SIZE, styles, handleItemAction, triggerNotification]);

    const checkCollision = useCallback(() => {
        if (!gameAreaLayout.current.width) return;

        const HITBOX_WIDTH_PERCENTAGE = 0.8;
        const HITBOX_VERTICAL_OFFSET = 0.35;
        const HITBOX_HEIGHT_PERCENTAGE = 0.5;

        const hitboxWidth = CATCHER_WIDTH * HITBOX_WIDTH_PERCENTAGE;
        const horizontalPadding = (CATCHER_WIDTH - hitboxWidth) / 2;
        const catcherComponentTopY = gameAreaLayout.current.height - CATCHER_BOTTOM - CATCHER_HEIGHT;

        const catcherBounds = {
            x: lastCatcherPosition.current + horizontalPadding,
            y: catcherComponentTopY + (CATCHER_HEIGHT * HITBOX_VERTICAL_OFFSET),
            width: hitboxWidth,
            height: CATCHER_HEIGHT * HITBOX_HEIGHT_PERCENTAGE,
        };

        for (const key in activeItems.current) {
            const item = activeItems.current[key];
            if (item.isBeingRemoved) continue;
            
            const itemCenterX = item.jsValues.x + ITEM_SIZE / 2;
            const itemCenterY = item.jsValues.y + ITEM_SIZE / 2;

            if (
                itemCenterX > catcherBounds.x &&
                itemCenterX < catcherBounds.x + catcherBounds.width &&
                itemCenterY > catcherBounds.y &&
                itemCenterY < catcherBounds.y + catcherBounds.height
            ) {
                handleItemAction(key, 'catch');
            }
        }
    }, [CATCHER_WIDTH, CATCHER_HEIGHT, CATCHER_BOTTOM, ITEM_SIZE, handleItemAction]);

    useEffect(() => {
        let gameTimer, spawnTimer, collisionChecker;
        if (!isPreGame && !isGameOver) {
            const timerInterval = 50;
            gameTimer = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - timerInterval;
                    if (newTime <= 0) {
                        setIsGameOver(true);
                        return 0;
                    }
                    return newTime;
                });
            }, timerInterval);
            spawnTimer = setInterval(spawnNewItem, Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN) + SPAWN_INTERVAL_MIN);
            collisionChecker = setInterval(checkCollision, 16);
        }
        if (isGameOver) {
             Object.keys(activeItems.current).forEach(key => removeItem(key));
        }
        return () => {
            clearInterval(gameTimer);
            clearInterval(spawnTimer);
            clearInterval(collisionChecker);
        };
    }, [isPreGame, isGameOver, spawnNewItem, checkCollision, removeItem]);

    const formatTime = useCallback((ms) => {
        if (ms <= 0) return '0.00s';
        const seconds = Math.floor(ms / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        return `${seconds}.${milliseconds}s`;
    }, []);

    const resetGame = () => {
        setScore(0);
        setTimeLeft(GAME_DURATION_MS);
        setIsGameOver(false);
        setIsPreGame(true);
        setFallingItems([]);
        setShowRules(true);
        activeItems.current = {};
        nextItemId.current = 0;
        if (gameAreaLayout.current.width > 0) {
            const centerX = (gameAreaLayout.current.width - CATCHER_WIDTH) / 2;
            catcherPosition.setValue(centerX);
            lastCatcherPosition.current = centerX;
        }
    };
    
    const notificationContainerStyle = {
        borderColor: notificationType === 'danger' ? RED_DANGER : NEON_GREEN,
    };
    const notificationTextStyle = {
        color: notificationType === 'danger' ? RED_DANGER : NEON_GREEN,
    };

    return (
        <View style={styles.fullScreenBg}>
            <StatusBar barStyle="light-content" />
            <ImageBackground source={BACKGROUND_IMAGE} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <SafeAreaView style={styles.gameContainer}>
                <View style={styles.frameOuter}>
                    <View style={styles.frameInner}>
                        <View style={styles.topSection}>
                            <Animated.View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ scale: scoreScale }] }}>
                                <Text style={styles.scoreText}>Skor: {displayScore}</Text>
                            </Animated.View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.timerText}>Waktu: {formatTime(timeLeft)}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.objectiveTextContainer}>
                            <Text style={styles.objectiveText}>Tangkap: <Text style={{ color: NEON_GREEN }}>MAKANAN/MINUMAN</Text></Text>
                        </View>

                        <View style={styles.gameArea} onLayout={onGameAreaLayout}>
                            {fallingItems.map((item) => (
                                <FallingItem key={item.key} itemObject={item} onMiss={() => handleItemAction(item.key, 'miss')} gameAreaHeight={gameAreaLayout.current.height} />
                            ))}
                            <Animated.View style={[styles.notificationContainer, notificationContainerStyle, { opacity: notificationOpacity, transform: [{ scale: notificationOpacity.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]}>
                                <Text style={[styles.notificationText, notificationTextStyle]}>{notificationText}</Text>
                            </Animated.View>
                            <Animated.View style={[ styles.catcher, { transform: [ { translateX: catcherPosition }, { scale: catcherScale }, { scaleX: catcherFacingRight ? 1 : -1 } ] } ]}>
                                <Image source={CATCHER_IMAGE} style={styles.catcherImage} resizeMode="contain" />
                            </Animated.View>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
            <View style={styles.controlsContainer}>
                <Animated.View style={[styles.controlButtonWrapper, { transform: [{ scale: leftBtnScale }] }]}>
                    <TouchableOpacity style={styles.arrowBtn} onPress={() => handleSingleTap(-1)} onLongPress={() => startContinuousMove(-1)} onPressIn={() => handlePressInDirection(-1, leftBtnScale)} onPressOut={() => handlePressOut(leftBtnScale)} delayLongPress={150} activeOpacity={0.8} >
                        <Text style={styles.arrowText}>{'◀'}</Text>
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={[styles.controlButtonWrapper, { transform: [{ scale: rightBtnScale }] }]}>
                    <TouchableOpacity style={styles.arrowBtn} onPress={() => handleSingleTap(1)} onLongPress={() => startContinuousMove(1)} onPressIn={() => handlePressInDirection(1, rightBtnScale)} onPressOut={() => handlePressOut(rightBtnBtnScale)} delayLongPress={150} activeOpacity={0.8} >
                        <Text style={styles.arrowText}>{'▶'}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
            
            {showRules && (
                <View style={styles.overlay}>
                    <View style={styles.popupContainer}>
                        <Text style={styles.popupTitle}>Aturan Main</Text>
                        <Text style={styles.popupText}>Tangkap semua item <Text style={{ color: NEON_GREEN, fontWeight: 'bold' }}>MAKANAN/MINUMAN</Text> untuk mendapat <Text style={{ color: NEON_GREEN, fontWeight: 'bold' }}>+10 poin</Text>.</Text>
                        <Text style={styles.popupText}>Menangkap <Text style={{color: '#eee', fontWeight: 'bold' }}>OBAT</Text> akan mengurangi <Text style={{ color: '#ff4d4d', fontWeight: 'bold' }}>-5 poin</Text>.</Text>
                        <Text style={styles.popupText}><Text style={{ color: RED_DANGER, fontWeight: 'bold' }}>HINDARI item berdenyut merah</Text> atau skormu berkurang <Text style={{ color: RED_DANGER, fontWeight: 'bold' }}>-20 poin</Text>!</Text>
                        <TouchableOpacity style={styles.popupButton} onPress={startGameSequence}>
                            <Text style={styles.popupButtonText}>Mulai</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {countdownText !== '' && (
                <View style={styles.overlay}>
                    <Text style={styles.countdown}>{countdownText}</Text>
                </View>
            )}

            {isGameOver && (
                <View style={styles.overlay}>
                    <View style={styles.popupContainer}>
                        <Text style={styles.popupTitle}>PERMAINAN SELESAI</Text>
                        <Text style={styles.popupText}>Skor Babak Ini: {score}</Text>
                        <Text style={styles.popupText}>Skor Sebelumnya: {scoreGame1}</Text>
                        <Text style={styles.popupTitle}>Total Skor Anda</Text>
                        <Text style={styles.finalScoreText}>{score + scoreGame1}</Text>
                        
                        <TouchableOpacity 
                            style={styles.popupButton} 
                            onPress={() => navigation.navigate('Game3', { 
                                totalScore: score + scoreGame1,
                                playerName: playerName 
                            })}
                        >
                            <Text style={styles.popupButtonText}>Lanjut</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}
