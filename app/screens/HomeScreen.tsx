import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity,Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../components/ui/SearchBar';
import LostFoundToggle from '../components/ui/LostFoundToggle';
import RecentItems from '../components/posts/RecentItems';
import ItemList from '../components/posts/ItemList';

const lostItems = [
  { id: '1', name: 'Wallet', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '2', name: 'Keys', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '3', name: 'Bag', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '4', name: 'Bag', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '5', name: 'Bag', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '6', name: 'Bag', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '7', name: 'Bag', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
];

const foundItems = [
  { id: '1', name: 'Phone', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '2', name: 'Bag', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '3', name: 'Shoes', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '4', name: 'Shoes', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '5', name: 'Shoes', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '6', name: 'Shoes', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
  { id: '7', name: 'Shoes', time: '1:00 PM', date: 'September 21,2025', location: 'Ologapo City', image: require('../assets/lostitem.png') },
];

export default function HomeScreen({ navigation }) {

  const [isLost, setIsLost] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');

  const data = isLost ? lostItems : foundItems;
  const recentData = data;

  const filteredData =
    searchText.length > 0
      ? data.filter(item =>
          item.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : [];

  return (
    <SafeAreaView style={styles.container}>
     <View style={styles.container}>
      <SearchBar
          isLost={isLost}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          searchText={searchText}
          setSearchText={setSearchText} navigation={undefined}      />

      {!isSearching && <LostFoundToggle isLost={isLost} setIsLost={setIsLost} />}

      {!isSearching && <RecentItems horizontalData={recentData} navigation={navigation} />}

      <ItemList data={isSearching ? filteredData : data} navigation={navigation} />

      {!isSearching && (
        <View style={styles.footer}>
                <View style={styles.foota}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image source={require("../assets/homelogo.png")} style={styles.footbtn}/>
          </TouchableOpacity>
                
          <TouchableOpacity onPress={() => navigation.navigate('PostItem')}>
          <Image source={require("../assets/storyplogo.png")} style={styles.footbtn}/>
          </TouchableOpacity>
                
          <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
          <Image source={require("../assets/messlogo.png")} style={styles.footbtn}/>
          </TouchableOpacity>
                
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={require("../assets/taologo.png")} style={styles.footbtn}/>
          </TouchableOpacity>
                </View>
        </View>
      )}

    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor:'#D0E1D7',
  },
  footer: {
    height:50,
    width:'100%',
    backgroundColor:'#ffffffff',
    padding:10,
  },
  foota: {
    justifyContent:'space-between',
    flexDirection: 'row',
    width:'80%',
    alignSelf:'center',
  },
  footbtn: {
    height:30,
    width:30
  },
});
