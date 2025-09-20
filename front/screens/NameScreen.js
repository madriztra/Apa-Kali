import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Animated,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Image,
    TouchableWithoutFeedback,
    Keyboard,
    Pressable,
    Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedBg = Animated.createAnimatedComponent(ImageBackground);

// --- FUNGSI & HELPER UNTUK RESPONSIVE & WEB COMPATIBILITY ---
const guidelineBaseWidth = 375;
const scale = (size) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const useSafeNativeDriver = Platform.OS !== 'web';

export default function NameScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showAdminInput, setShowAdminInput] = useState(false);

    const formOpacity = useRef(new Animated.Value(0)).current;
    const formTranslateY = useRef(new Animated.Value(moderateScale(20))).current;
    const adminOpacity = useRef(new Animated.Value(0)).current;
    const adminTranslateY = useRef(new Animated.Value(moderateScale(10))).current;

    useEffect(() => {
        if (Platform.OS === 'web') {
            const preventZoom = (e) => {
                if ((e.touches && e.touches.length > 1) || e.ctrlKey) {
                    e.preventDefault();
                }
            };
            document.addEventListener('touchmove', preventZoom, { passive: false });
            document.addEventListener('wheel', preventZoom, { passive: false });
            return () => {
                document.removeEventListener('touchmove', preventZoom);
                document.removeEventListener('wheel', preventZoom);
            };
        }
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(formOpacity, {
                toValue: 1,
                delay: 300,
                duration: 500,
                useNativeDriver: useSafeNativeDriver,
            }),
            Animated.timing(formTranslateY, {
                toValue: 0,
                delay: 300,
                duration: 500,
                useNativeDriver: useSafeNativeDriver,
            }),
        ]).start();
    }, []);

    const revealAdminInput = () => {
        setShowAdminInput(true);
        Animated.parallel([
            Animated.timing(adminOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: useSafeNativeDriver,
            }),
            Animated.timing(adminTranslateY, {
                toValue: 0,
                duration: 400,
                useNativeDriver: useSafeNativeDriver,
            }),
        ]).start();
    };

    const handleSubmit = () => {
        if (name.trim()) {
            navigation.navigate('AturanMainScreen', { playerName: name });
        }
    };
    
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <AnimatedBg
                source={require('../assets/splashbg.png')}
                style={styles.background}
                resizeMode="cover"
            >
                <Pressable
                    onPress={() => {
                        navigation.goBack();
                    }}
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
                >
                    <Image
                        source={require('../assets/back-button.png')}
                        style={styles.backIcon}
                        resizeMode="contain"
                    />
                </Pressable>

                <KeyboardAvoidingView
                    style={styles.wrapper}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <Animated.View
                        style={[
                            styles.formContainer,
                            { opacity: formOpacity, transform: [{ translateY: formTranslateY }] },
                        ]}
                    >
                        <Text style={styles.label}>masukkan nama kamu</Text>
                        <TextInput
                            placeholder="nama kamu"
                            placeholderTextColor="#64748B"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />
                    </Animated.View>
                </KeyboardAvoidingView>
            </AnimatedBg>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    // --- BACKGROUND & LAYOUT ---
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },
    wrapper: {
        width: '100%',
        paddingHorizontal: moderateScale(20),
        alignItems: 'center',
        justifyContent: 'center',
    },

    // --- MAIN FORM CONTAINER (TECH UI) ---
    formContainer: {
        width: '100%',
        maxWidth: moderateScale(400),
        backgroundColor: '#1E293B',
        borderWidth: moderateScale(2),
        borderColor: '#0EA5E9',
        borderRadius: moderateScale(20),
        padding: moderateScale(30),
        alignItems: 'center',
        zIndex: 2,
        ...Platform.select({
            native: {
                shadowColor: '#0EA5E9',
                shadowOpacity: 0.6,
                shadowRadius: moderateScale(15),
                shadowOffset: { width: 0, height: 0 },
                elevation: moderateScale(12),
            },
            default: {
                boxShadow: '0 0 25px rgba(14, 165, 233, 0.5)',
            }
        }),
    },

    // --- TEXT & LABELS ---
    label: {
        fontSize: moderateScale(22),
        fontWeight: '800',
        marginBottom: moderateScale(15),
        color: '#F0F9FF',
        textTransform: 'uppercase',
        letterSpacing: moderateScale(1.5),
        textAlign: 'center',
        textShadowColor: 'rgba(14, 165, 233, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: moderateScale(10),
    },

    // --- INPUT FIELD ---
    input: {
        backgroundColor: '#0F172A',
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(14),
        fontSize: moderateScale(16),
        borderWidth: moderateScale(1.5),
        borderColor: '#38BDF8',
        color: '#FFFFFF',
        marginBottom: moderateScale(25),
        width: '100%',
        maxWidth: moderateScale(360),
    },

    // --- SUBMIT BUTTON ---
    okButton: {
        backgroundColor: '#38BDF8',
        paddingVertical: moderateScale(16),
        borderRadius: moderateScale(12),
        width: '100%',
        alignItems: 'center',
        zIndex: 3,
        borderBottomWidth: moderateScale(3),
        borderBottomColor: 'rgba(14, 165, 233, 0.8)',
        ...Platform.select({
            native: {
                shadowColor: '#38BDF8',
                shadowOpacity: 0.8,
                shadowOffset: { width: 0, height: moderateScale(4) },
                shadowRadius: moderateScale(20),
                elevation: moderateScale(10),
            },
            default: {
                boxShadow: `0 ${moderateScale(4)}px ${moderateScale(25)}px rgba(56, 189, 248, 0.6)`,
            }
        }),
    },
    okButtonText: {
        color: '#0F172A',
        fontWeight: '900',
        fontSize: moderateScale(20),
        textTransform: 'uppercase',
        letterSpacing: moderateScale(1.5),
    },

    // --- ADMIN LINK ---
    adminLinkText: {
        marginTop: moderateScale(15),
        fontSize: moderateScale(14),
        color: '#94A3B8',
        textDecorationLine: 'underline',
    },

    // --- BACK BUTTON ---
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? moderateScale(20) : moderateScale(50),
        left: moderateScale(20),
        zIndex: 99,
    },
    backIcon: {
        width: moderateScale(85),
        height: moderateScale(85),
    },
});

