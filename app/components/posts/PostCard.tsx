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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image
            source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
            style={styles.image}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>

          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconEmoji}>📍</Text>
            </View>
            <Text style={styles.detailText} numberOfLines={1}>{locationName}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconEmoji}>📅</Text>
            </View>
            <Text style={styles.detailText}>{formatDate(rawDate)}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconEmoji}>🕐</Text>
            </View>
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
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border ?? 'rgba(0,0,0,0.06)',
    shadowColor: Colors.text?.primary ?? '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: 110,
    height: 110,
    backgroundColor: Colors.border ?? 'rgba(0,0,0,0.05)',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  iconWrapper: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  iconEmoji: {
    fontSize: 14,
  },
  detailText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
    fontWeight: '500',
  },
});
