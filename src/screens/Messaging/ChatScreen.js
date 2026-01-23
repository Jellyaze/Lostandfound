import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { subscribeToMessages, sendMessage, sendImageMessage, sendFileMessage } from '../../services/messageService';
import { getUserProfile } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen({ route, navigation }) {
  const { chatId, otherUserName, otherUserPhoto } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadUserProfile();
    const unsubscribe = subscribeToMessages(chatId, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  const loadUserProfile = async () => {
    const result = await getUserProfile(user.uid);
    if (result.success) {
      setUserProfile(result.data);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !userProfile || sending) return;

    setSending(true);
    const result = await sendMessage(chatId, user.uid, userProfile.name, inputText.trim());
    setSending(false);

    if (result.success) {
      setInputText('');
    } else {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleSendImage = async () => {
    if (!userProfile || sending) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSending(true);
      const sendResult = await sendImageMessage(chatId, user.uid, userProfile.name, result.assets[0].uri);
      setSending(false);

      if (!sendResult.success) {
        Alert.alert('Error', 'Failed to send image');
      }
    }
  };

  const handleSendFile = async () => {
    if (!userProfile || sending) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
    });

    if (result.type === 'success') {
      setSending(true);
      const sendResult = await sendFileMessage(chatId, user.uid, userProfile.name, result.uri, result.name);
      setSending(false);

      if (!sendResult.success) {
        Alert.alert('Error', 'Failed to send file');
      }
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === user.uid;

    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        {!isMyMessage && (
          <Image source={{ uri: otherUserPhoto }} style={styles.messageUserPhoto} />
        )}
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.messageImage} />
          ) : (
            <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
              {item.text}
            </Text>
          )}
          <Text style={styles.messageTime}>
            {item.createdAt?.toDate ? 
              new Date(item.createdAt.toDate()).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={{ uri: otherUserPhoto }} style={styles.headerUserPhoto} />
          <Text style={styles.headerTitle}>{otherUserName}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleSendImage} style={styles.attachButton} disabled={sending}>
            <Text style={styles.attachButtonText}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSendFile} style={styles.attachButton} disabled={sending}>
            <Text style={styles.attachButtonText}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!sending}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={sending || !inputText.trim()}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0E1D7'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#50A296'
  },
  headerButton: {
    color: 'white',
    fontSize: 16
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerUserPhoto: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  messagesList: {
    padding: 15
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%'
  },
  myMessage: {
    alignSelf: 'flex-end'
  },
  otherMessage: {
    alignSelf: 'flex-start'
  },
  messageUserPhoto: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8
  },
  messageBubble: {
    borderRadius: 15,
    padding: 12,
    maxWidth: '100%'
  },
  myMessageBubble: {
    backgroundColor: '#50A296'
  },
  otherMessageBubble: {
    backgroundColor: 'white'
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4
  },
  myMessageText: {
    color: 'white'
  },
  otherMessageText: {
    color: '#333'
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 4
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.5)',
    alignSelf: 'flex-end'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  attachButton: {
    padding: 8,
    marginRight: 5
  },
  attachButtonText: {
    fontSize: 24
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#50A296',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});