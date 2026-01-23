import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Post } from '../../services/postService';
import { Colors } from '../../constants/Colors';
import { formatDate, formatTime } from '../../utils/formatDate';

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

interface PostCardProps {
  post: Post | LightItem;
  onPress: () => void;
}

export default function PostCard({ post, onPress }: PostCardProps) {
  const imageUrl = (post as Post).image_urls && (post as Post).image_urls.length > 0
    ? (post as Post).image_urls[0]
    : (post as LightItem).image || require('../../assets/lostitem.png');

  const title = (post as Post).title ?? (post as LightItem).name ?? 'Untitled';
  const locationName = (post as Post).location_name ?? (post as LightItem).location ?? 'Unknown location';

  const rawDate = (post as Post).date_lost_found ??
    ((post as LightItem).date ? `${(post as LightItem).date} ${(post as LightItem).time ?? ''}`.trim() : undefined);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <Image 
          source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl} 
          style={styles.image} 
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.detailRow}>
            <Image source={require('../../assets/loclogo.png')} style={styles.icon}/>
            <Text style={styles.detailText} numberOfLines={1}>{locationName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Image source={require('../../assets/datelogo.png')} style={styles.icon}/>
            <Text style={styles.detailText}>{formatDate(rawDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Image source={require('../../assets/timelogo.png')} style={styles.icon}/>
            <Text style={styles.detailText}>{formatTime(rawDate)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 5,
  },
  image: {
    width: 119,
    height: 98,
    borderRadius: 10,
    marginRight: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  icon: {
    width: 13,
    height: 13,
    marginRight: 8,
  },
  detailText: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
});