import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/Colors';
import { validateEmail } from '../../utils/validation';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<null | 'google' | 'facebook' | 'apple'>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) pan.setValue({ x: 0, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.timing(slideAnim, { toValue: height, duration: 200, useNativeDriver: false }).start();
          Animated.timing(logoAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
          pan.setValue({ x: 0, y: 0 });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const openPanel = () => {
    Animated.timing(slideAnim, { toValue: height / 2, duration: 300, useNativeDriver: false }).start();
    Animated.timing(logoAnim, { toValue: -150, duration: 300, useNativeDriver: false }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  const handleGoogle = async () => {
    try {
      setOauthLoading('google');
      const { error } = await signInWithGoogle();
      if (error) Alert.alert('Google Login Failed', error.message || String(error));
    } finally {
      setOauthLoading(null);
    }
  };

  const handleFacebook = async () => {
    try {
      setOauthLoading('facebook');
      const { error } = await signInWithFacebook();
      if (error) Alert.alert('Facebook Login Failed', error.message || String(error));
    } finally {
      setOauthLoading(null);
    }
  };

  const handleApple = async () => {
    try {
      setOauthLoading('apple');
      const { error } = await signInWithApple();
      if (error) Alert.alert('Apple Login Failed', error.message || String(error));
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.Image
            source={require('../../assets/seekerLg.png')}
            style={[styles.logo, { transform: [{ translateY: logoAnim }] }]}
            resizeMode="contain"
          />

          <Animated.View style={[styles.loginForm, { transform: [{ translateY: logoAnim }] }]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <TouchableHighlight
              onPress={handleLogin}
              underlayColor={colors.primaryDark}
              disabled={loading}
              style={[styles.button, loading && styles.buttonDisabled]}
            >
              <View style={styles.buttonInner}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>LOGIN</Text>}
              </View>
            </TouchableHighlight>
          </Animated.View>

          <TouchableHighlight onPress={openPanel} underlayColor="transparent">
            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>Don't have an account? </Text>
              <Text style={styles.createAccountLink}>Sign Up</Text>
            </View>
          </TouchableHighlight>
        </ScrollView>
      </KeyboardAvoidingView>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.panel, { top: Animated.add(slideAnim, pan.y) }]}
      >
        <View style={styles.panelHandle} />
        <Text style={styles.panelTitle}>Create an account with</Text>

        <TouchableHighlight
          onPress={handleGoogle}
          underlayColor="transparent"
          disabled={oauthLoading !== null}
        >
          <View style={[styles.optionBtn, oauthLoading === 'google' && styles.optionDisabled]}>
            {oauthLoading === 'google' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Image
                source={require('../../assets/googleoption.png')}
                style={styles.optionImg}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={handleFacebook}
          underlayColor="transparent"
          disabled={oauthLoading !== null}
        >
          <View style={[styles.optionBtn, oauthLoading === 'facebook' && styles.optionDisabled]}>
            {oauthLoading === 'facebook' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Image
                source={require('../../assets/fboption.png')}
                style={styles.optionImg}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={handleApple}
          underlayColor="transparent"
          disabled={oauthLoading !== null}
        >
          <View style={[styles.optionBtn, oauthLoading === 'apple' && styles.optionDisabled]}>
            {oauthLoading === 'apple' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Image
                source={require('../../assets/appleoption.png')}
                style={styles.optionImg}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => navigation.navigate('Register')}
          underlayColor="transparent"
          disabled={oauthLoading !== null}
        >
          <View style={styles.emailButton}>
            <Text style={styles.emailButtonText}>Sign up with Email</Text>
          </View>
        </TouchableHighlight>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 280,
    height: 180,
    marginBottom: 32,
  },
  loginForm: {
    width: '85%',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 56,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonInner: {
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },

  createAccountContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  createAccountText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  createAccountLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  panel: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: height / 2,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  panelHandle: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3,
    marginBottom: 20,
  },
  panelTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },

  optionBtn: {
    width: 335,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  optionImg: {
    width: '100%',
    height: '100%',
  },
  optionDisabled: {
    opacity: 0.75,
  },

  emailButton: {
    width: '90%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emailButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});
