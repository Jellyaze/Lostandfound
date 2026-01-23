import React, { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet,Image,TouchableHighlight,TextInput,TouchableWithoutFeedback,ScrollView } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from 'react-native-dropdown-picker';

export default function RegisterScreen({ navigation }) {
  const [profileImage, setProfileImage] = useState(null);

  const [frontIdImage, setFrontIdImage] = useState(null);
  const [backIdImage, setBackIdImage] = useState(null);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    {id: 1, label: 'Civilian', value: 'Civilian'},
    {id: 2, label: 'Blue-collar', value: 'Blue-collar'},
    {id: 3, label: 'White-collar', value: 'White-collar'},
    {id: 4, label: 'Official', value: 'Official'}
  ]);

  const [open2, setOpen2] = useState(false);
  const [value2, setValue2] = useState(null);
  const [items2, setItems2] = useState([
    {id: 1, label: 'Male', value: 'Male'},
    {id: 2, label: 'Female', value: 'Female'},
    {id: 3, label: 'Other', value: 'Other'}
  ]);

  const [inputText, setNameText] = useState('');
  const [secondText, setAgeText] = useState('');
  const [thirdText, setConNOText] = useState('');

  const numMo = (text) => {
    const numericValue = text.replace(/[^0-9-]/g, ''); 
    setConNOText(numericValue);
  };

  const pickImage = async (setImage) => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    alert("Permission to access gallery is required!");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.una}>Create Profile</Text>

      <View style={styles.circle}>
        <Image
         source={
         profileImage
          ? { uri: profileImage }
          : require("../assets/proflogo.png")
        }
        style={styles.image}
        />
      </View>

      <TouchableHighlight onPress={() => pickImage(setProfileImage)} underlayColor="#58b1a3ff">
       <View style={styles.addp}>
        <Text>Add photo</Text>
       </View>
      </TouchableHighlight>

      <View style={styles.bastalabel}>
        <Text style={styles.labeltxt}>label</Text>
        <View style={styles.dpb}>
        <DropDownPicker style={styles.dp1}
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          listMode="SCROLLVIEW"
          placeholder="Select"
        /></View>

        <Text style={styles.labeltxt}>Name</Text>
        <TextInput
        style={styles.input}
        onChangeText={setNameText}
        value={inputText}
        placeholder="Name"
        />
        <View style={styles.aggentxt}>
        <Text style={styles.labeltxt}>Age</Text>
        <Text style={styles.labeltxt}>Gender</Text>
              </View>
        <View style={styles.aggen}>
          <View style={styles.agItem}>
          <TextInput
            style={styles.inputSmall}
            keyboardType="numeric"
            onChangeText={setAgeText}
            value={secondText}
            placeholder="Age"
          />
          </View>
        <View style={styles.agItem}>
          <DropDownPicker style={styles.dpSmall}
        open={open2}
        value={value2}
        items={items2}
        setOpen={setOpen2}
        setValue={setValue2}
        setItems={setItems2}
        listMode="SCROLLVIEW"
        placeholder="Select"
        />
        </View>
        </View>

        <Text style={styles.labeltxt}>Contact no.</Text>
        <TextInput
        style={styles.input}
        keyboardType="numeric"
        onChangeText={setConNOText}
        value={thirdText}
        placeholder="Contact no."
        />

        <View style={styles.idencss}>
          <View style={styles.idenitem}>
            <Text style={styles.identxt}>Front</Text>
            <Image
             source={
             frontIdImage
              ? { uri: frontIdImage }
              : require("../assets/idenlogo.png")
            }
            style={styles.idenp}
            />
            <TouchableHighlight onPress={() => pickImage(setFrontIdImage)} underlayColor="#58b1a3ff">
             <View style={styles.addp}>
              <Text>Add photo</Text>
             </View>
            </TouchableHighlight>
          </View>
          <View style={styles.idenitem}>
            <Text style={styles.identxt}>Back</Text>
            <Image
            source={
             backIdImage
             ? { uri: backIdImage }
             : require("../assets/idenlogo.png")
            }
            style={styles.idenp}
            />
            <TouchableHighlight onPress={() => pickImage(setBackIdImage)} underlayColor="#58b1a3ff">
             <View style={styles.addp}>
              <Text>Add photo</Text>
             </View>
            </TouchableHighlight>
          </View>
        </View>

     </View>

     <View>
      <TouchableWithoutFeedback onPress={() => navigation.navigate('Home')}>
             <Image source={require("../assets/createbtnlogo.png")} style={styles.createbtn}/>
            </TouchableWithoutFeedback>
     </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  una: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  circle: {
    marginTop: 10,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#50A296',
    overflow: "hidden",
    marginBottom:10,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: "cover",
  },
  addp: {
    alignItems: 'center',
    width:120,
    borderWidth: 2,
    borderColor: '#50A296',
    borderRadius: 5,
    padding:5,
    marginTop:5,
  },
  bastalabel: {
    backgroundColor: '#50A296',
    width: 340,
    height: 600,
    borderRadius: 5,
    marginTop: 20,
  },
  labeltxt: {
    marginTop: 5,
    marginLeft: 30,
    color: '#fff',
  },
  dp1: {
    width:'100%',
    zIndex: 2000
  },
  dpb: {
    width:280,
    alignSelf:'center',
  },
  input: {
    height: 50,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: 280,
    backgroundColor:'#fff',
    alignSelf:'center',
  },
  aggentxt: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: 280,
    gap:95,
    
  },
  aggen: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignSelf:'center', 
    width: 280,
    marginTop: 10,

  },
  agItem: {
    width: '48%',
  },
  inputSmall: {
    height: 50,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: '100%',
    backgroundColor: '#fff',
  },
  dpSmall: {
    width: '100%',
    height: 40,
    zIndex: 1000
  },
  idencss: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf:'center',
    width: 280,
    backgroundColor:'#fff',
    borderRadius: 5,
    marginTop: 10,
  },
  idenp: {
    height:190,
    width:120,
    resizeMode: "cover"
  },
  identxt: {
    alignSelf:'center',
  },
  idenitem: {
    margin:10,
  },
  createbtn: {
    height:70,
    width:500,
    marginTop:50,
  },
  scrollContent: {
    alignItems: 'center'
}
});
