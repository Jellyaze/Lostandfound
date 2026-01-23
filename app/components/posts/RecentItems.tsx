import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Post } from '../../services/postService';
import { Colors } from '../../constants/Colors';

type LightItem = {
  id: string;
  name?: string;
  time?: string;
  date?: string;
  location?: string;
  image?: any;
  title?: string;
  image_urls?: string[];
  location_name?: string;
  date_lost_found?: string;
};

interface RecentItemsProps {
  horizontalData: (Post | LightItem)[];
  navigation: any;
}

export default function RecentItems({ horizontalData, navigation }: RecentItemsProps) {
  if (!horizontalData || horizontalData.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Items</Text>
      <FlatList
        data={horizontalData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const imageUrl = (item as Post).image_urls && (item as Post).image_urls.length > 0
            ? (item as Post).image_urls[0]
            : (item as LightItem).image || require('../../assets/lostitem.png');

          return (
            <TouchableOpacity 
              style={styles.item}
              onPress={() => navigation.navigate('ViewPost', { postId: item.id })}
            >
              <Image 
                source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl} 
                style={styles.image} 
              />
              <Text style={styles.itemText} numberOfLines={1}>{(item as Post).title ?? (item as LightItem).name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingLeft: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text.primary,
  },
  item: {
    marginRight: 15,
    width: 100,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  itemText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    color: Colors.text.secondary,
  },
});