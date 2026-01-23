import React, { useRef } from 'react';
import { View, Text, TouchableHighlight, StyleSheet, Image, Animated, PanResponder, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
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

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/seekerLg.png")}
        style={[styles.logo, { transform: [{ translateY: logoAnim }] }]}
      />

      <Animated.View style={{ transform: [{ translateY: logoAnim }] }}>
        <TouchableHighlight onPress={() => navigation.navigate('Home')} underlayColor="white">
          <View style={styles.button}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </View>
        </TouchableHighlight>
      </Animated.View>

      <TouchableHighlight onPress={openPanel} underlayColor="white">
        <View>
          <Text>Create an Account with</Text>
        </View>
      </TouchableHighlight>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.panel, { top: Animated.add(slideAnim, pan.y) }]}
      >
        <Text style={styles.panelTitle}>Create an account with</Text>
        <TouchableHighlight onPress={() => navigation.navigate('Register')} underlayColor="#50A296">
          <Image source={require("../assets/googleoption.png")} style={styles.option}/>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigation.navigate('Register')} underlayColor="#50A296">
          <Image source={require("../assets/fboption.png")} style={styles.option}/>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigation.navigate('Register')} underlayColor="#50A296">
          <Image source={require("../assets/appleoption.png")} style={styles.option}/>
        </TouchableHighlight>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  logo: { 
    width: 310, 
    height: 200, 
    marginBottom: 15 
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
    padding: 15, color: 'white' 
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
  panelTitle: { 
    color: "#fff",
    textAlign: 'center',
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 20 ,
  },
  option: { 
    height: 50,
    width: 335,
    marginTop:10,
    marginBottom:10
  },
});
