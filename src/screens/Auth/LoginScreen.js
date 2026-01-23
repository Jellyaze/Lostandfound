import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  loginWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
} from '../../services/authService';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) pan.setValue({ x: 0, y: g.dy });
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) {
          closePanel();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const openPanel = () => {
    Animated.timing(slideAnim, {
      toValue: height / 2,
      duration: 300,
      useNativeDriver: false,
    }).start();
    Animated.timing(logoAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closePanel = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(logoAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    pan.setValue({ x: 0, y: 0 });
    setShowEmailLogin(false);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await loginWithEmail(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Unknown error');
    }
  };

  const socialSignIn = async (fn, label) => {
    setLoading(true);
    const result = await fn();
    setLoading(false);

    if (!result.success) {
      Alert.alert(`${label} Failed`, result.error || 'Unknown error');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.Image
        source={require('../../../app/assets/seekerLg.png')}
        style={[styles.logo, { transform: [{ translateY: logoAnim }] }]}
      />

      <Animated.View style={{ transform: [{ translateY: logoAnim }] }}>
        <TouchableHighlight onPress={openPanel} underlayColor="white">
          <View style={styles.button}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </View>
        </TouchableHighlight>
      </Animated.View>

      <TouchableHighlight 
        onPress={() => navigation.navigate('Register')} 
        underlayColor="white"
      >
        <View>
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </View>
      </TouchableHighlight>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.panel, { top: Animated.add(slideAnim, pan.y) }]}
      >
        <View style={styles.dragHandle} />
        
        {!showEmailLogin ? (
          <>
            <Text style={styles.panelTitle}>Login with</Text>

            <TouchableHighlight
              onPress={() => setShowEmailLogin(true)}
              underlayColor="#45927f"
              style={styles.emailButton}
            >
              <Text style={styles.emailButtonText}>Email & Password</Text>
            </TouchableHighlight>

            <Text style={styles.orText}>OR</Text>

            <TouchableHighlight
              onPress={() => socialSignIn(signInWithGoogle, 'Google Sign In')}
              underlayColor="#50A296"
              disabled={loading}
            >
              <Image
                source={require('../../../app/assets/googleoption.png')}
                style={styles.option}
              />
            </TouchableHighlight>

            <TouchableHighlight
              onPress={() => socialSignIn(signInWithFacebook, 'Facebook Sign In')}
              underlayColor="#50A296"
              disabled={loading}
            >
              <Image
                source={require('../../../app/assets/fboption.png')}
                style={styles.option}
              />
            </TouchableHighlight>

            <TouchableHighlight
              onPress={() => socialSignIn(signInWithApple, 'Apple Sign In')}
              underlayColor="#50A296"
              disabled={loading}
            >
              <Image
                source={require('../../../app/assets/appleoption.png')}
                style={styles.option}
              />
            </TouchableHighlight>
          </>
        ) : (
          <ScrollView style={styles.emailLoginContainer}>
            <Text style={styles.panelTitle}>Email Login</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#ccc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableHighlight
              onPress={handleEmailLogin}
              underlayColor="#45927f"
              style={styles.loginButton}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Logging in...' : 'LOGIN'}
              </Text>
            </TouchableHighlight>

            <TouchableHighlight
              onPress={() => setShowEmailLogin(false)}
              underlayColor="#50A296"
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back to options</Text>
            </TouchableHighlight>
          </ScrollView>
        )}

        {loading && <ActivityIndicator color="white" style={styles.loader} />}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D0E1D7',
  },
  logo: {
    width: 310,
    height: 200,
    marginBottom: 15,
  },
  button: {
    width: 150,
    alignItems: 'center',
    backgroundColor: '#50A296',
    marginBottom: 15,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    padding: 15,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerText: {
    color: '#50A296',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  panel: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: height / 2,
    backgroundColor: '#50A296',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
    marginBottom: 15,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emailButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 10,
    width: 335,
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#50A296',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    color: 'white',
    fontSize: 14,
    marginVertical: 10,
  },
  option: {
    height: 50,
    width: 335,
    marginVertical: 10,
  },
  emailLoginContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
  },
  loginButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#50A296',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loader: {
    marginTop: 20,
  },
});