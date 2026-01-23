import React, { useState, useRef } from 'react';
import { View, Text, TouchableHighlight, StyleSheet, Image, Animated, PanResponder, Dimensions, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { validateEmail } from '../../utils/validation';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
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

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Image
        source={require('../../assets/seekerLg.png')}
        style={[styles.logo, { transform: [{ translateY: logoAnim }] }]}
      />

      <Animated.View style={[styles.loginForm, { transform: [{ translateY: logoAnim }] }]}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableHighlight 
          onPress={handleLogin} 
          underlayColor={Colors.primaryLight}
          disabled={loading}
        >
          <View style={styles.button}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>LOGIN</Text>
            )}
          </View>
        </TouchableHighlight>
      </Animated.View>

      <TouchableHighlight onPress={openPanel} underlayColor="transparent">
        <View>
          <Text style={styles.createAccountText}>Create an Account with</Text>
        </View>
      </TouchableHighlight>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.panel, { top: Animated.add(slideAnim, pan.y) }]}
      >
        <View style={styles.panelHandle} />
        <Text style={styles.panelTitle}>Create an account with</Text>
        <TouchableHighlight onPress={() => navigation.navigate('Register')} underlayColor={Colors.primaryLight}>
          <Image source={require('../../assets/googleoption.png')} style={styles.option}/>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigation.navigate('Register')} underlayColor={Colors.primaryLight}>
          <Image source={require('../../assets/fboption.png')} style={styles.option}/>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigation.navigate('Register')} underlayColor={Colors.primaryLight}>
          <Image source={require('../../assets/appleoption.png')} style={styles.option}/>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigation.navigate('Register')} underlayColor={Colors.primaryLight}>
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
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  logo: { 
    width: 310, 
    height: 200, 
    marginBottom: 15 
  },
  loginForm: {
    width: '80%',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: Colors.white,
  },
  button: { 
    width: '100%', 
    alignItems: 'center', 
    backgroundColor: Colors.primary, 
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
  },
  buttonText: { 
    textAlign: 'center', 
    padding: 15, 
    color: Colors.white,
    fontWeight: 'bold',
  },
  createAccountText: {
    color: Colors.text.secondary,
    marginTop: 10,
  },
  panel: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: height / 2,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.white,
    borderRadius: 3,
    marginBottom: 10,
  },
  panelTitle: { 
    color: Colors.white,
    textAlign: 'center',
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 20,
  },
  option: { 
    height: 50,
    width: 335,
    marginTop: 10,
    marginBottom: 10,
  },
  emailButton: {
    width: 335,
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  emailButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});