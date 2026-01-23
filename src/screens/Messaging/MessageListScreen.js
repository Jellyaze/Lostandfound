import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subscribeToChats, deleteChat } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';

export default function MessageListScreen({ navigation }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToChats(user.uid, (fetchedChats) => {
      setChats(fetchedChats);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteChat = (chatId) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteChat(chatId);
            if (!result.success) {
              Alert.alert('Error', 'Failed to delete conversation');
            }
          }
        }
      ]
    );
  };

  const getOtherUserInfo = (chat) => {
    const otherUserIndex = chat.users[0] === user.uid ? 1 : 0;
    return {
      name: chat.userNames[otherUserIndex],
      photo: chat.userPhotos[otherUserIndex],
      userId: chat.users[otherUserIndex]
    };
  };

  const renderChat = ({ item }) => {
    const otherUser = getOtherUserInfo(item);
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('Chat', {
          chatId: item.chatId,
          otherUserName: otherUser.name,
          otherUserPhoto: otherUser.photo
        })}
        onLongPress={() => handleDeleteChat(item.chatId)}
      >
        <Image source={{ uri: otherUser.photo }} style={styles.userPhoto} />
        <View style={styles.chatInfo}>
          <Text style={styles.userName}>{otherUser.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
        <Text style={styles.time}>
          {item.lastMessageTime?.toDate ? 
            new Date(item.lastMessageTime.toDate()).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={require('../../../app/assets/messlogo.png')} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start a conversation by contacting item owners</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0E1D7'
  },
  header: {
    padding: 20,
    backgroundColor: '#50A296'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  listContent: {
    padding: 10
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15
  },
  chatInfo: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  lastMessage: {
    fontSize: 14,
    color: '#666'
  },
  time: {
    fontSize: 12,
    color: '#999'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyIcon: {
    width: 80,
    height: 80,
    tintColor: '#ccc',
    marginBottom: 20
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  }
});