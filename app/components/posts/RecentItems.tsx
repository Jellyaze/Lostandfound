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
      <View style={styles.header}>
        <Text style={styles.title}>Recent Items</Text>
        <Text style={styles.subtitle}>Latest updates</Text>
      </View>

      <FlatList
        data={horizontalData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const imageUrl = (item as Post).image_urls && (item as Post).image_urls.length > 0
            ? (item as Post).image_urls[0]
            : (item as LightItem).image || require('../../assets/lostitem.png');

          return (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('ViewPost', { postId: item.id })}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
                  style={styles.image}
                />
              </View>
              <Text style={styles.itemText} numberOfLines={2}>
                {(item as Post).title ?? (item as LightItem).name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  item: {
    marginHorizontal: 6,
    width: 120,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.border ?? 'rgba(0,0,0,0.06)',
    shadowColor: Colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: 120,
    height: 120,
  },
  itemText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 18,
  },
});
