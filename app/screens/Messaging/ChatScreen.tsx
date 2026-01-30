import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext';
import {
  getMessages,
  sendMessage,
  sendImageMessage,
  sendFileMessage,
  markMessagesAsRead,
  subscribeToMessages,
  editMessage,
  deleteMessage,
  setTypingIndicator,
  subscribeToTypingIndicators,
} from '../../services/messageService';
import { Message } from '../../types/message.types';
import { colors } from '../../constants/Colors';
import MessageBubble from '../../components/messaging/MessageBubble';
import TypingIndicator from '../../components/messaging/TypingIndicator';
import ImagePickerModal from '../../components/messaging/ImagePickerModal';
import { getFileSize } from '../../services/uploadService';

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId, otherUserId } = route.params;
  const { user } = useAuth() as any;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMessages();
    markAsRead();

    const messageChannel = subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      if (newMessage.sender_id !== user?.id) {
        markAsRead();
      }
    });

    const typingChannel = subscribeToTypingIndicators(
      conversationId,
      user?.id || '',
      (typing) => {
        setIsTyping(typing);
      }
    );

    return () => {
      messageChannel.unsubscribe();
      typingChannel.unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId]);

  const loadMessages = async () => {
    const { data, error } = await getMessages(conversationId);
    if (!error && data) {
      setMessages(data);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const markAsRead = async () => {
    if (user) {
      await markMessagesAsRead(conversationId, user.id);
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);

    if (user) {
      setTypingIndicator(conversationId, user.id, text.length > 0);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingIndicator(conversationId, user.id, false);
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    setLoading(true);

    if (editingMessageId) {
      const { error } = await editMessage(editingMessageId, inputText.trim());
      if (error) {
        Alert.alert('Error', 'Failed to edit message');
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === editingMessageId
              ? { ...msg, content: inputText.trim(), is_edited: true }
              : msg
          )
        );
        setEditingMessageId(null);
      }
    } else {
      const { error } = await sendMessage(conversationId, user.id, inputText.trim());
      if (error) {
        Alert.alert('Error', 'Failed to send message');
      }
    }

    setLoading(false);
    setInputText('');
    setTypingIndicator(conversationId, user.id, false);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  const handleImageSelected = async (uri: string) => {
    if (!user) return;

    setLoading(true);
    const { error } = await sendImageMessage(conversationId, user.id, uri);
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to send image');
    } else {
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) return;

      const file = result.assets[0];
      const fileSize = await getFileSize(file.uri);

      if (fileSize > 10 * 1024 * 1024) {
        Alert.alert('Error', 'File size must be less than 10MB');
        return;
      }

      if (!user) return;

      setLoading(true);
      const { error } = await sendFileMessage(
        conversationId,
        user.id,
        file.uri,
        file.name,
        file.mimeType || 'application/octet-stream',
        fileSize
      );
      setLoading(false);

      if (error) {
        Alert.alert('Error', 'Failed to send file');
      } else {
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      }
    } catch (error) {
      console.error('File picker error:', error);
    }
  };

  const handleMessageLongPress = (message: Message) => {
    if (message.sender_id !== user?.id) return;

    Alert.alert(
      'Message Options',
      '',
      [
        {
          text: 'Edit',
          onPress: () => {
            if (message.message_type === 'text') {
              setInputText(message.content);
              setEditingMessageId(message.id);
            } else {
              Alert.alert('Info', 'Only text messages can be edited');
            }
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Message',
              'Are you sure you want to delete this message?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    const { error } = await deleteMessage(message.id);
                    if (!error) {
                      setMessages(prev => prev.filter(m => m.id !== message.id));
                    } else {
                      Alert.alert('Error', 'Failed to delete message');
                    }
                  },
                },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleImagePress = (url: string) => {
    setSelectedImageUrl(url);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;

    return (
      <MessageBubble
        message={item}
        isMyMessage={isMyMessage}
        onLongPress={() => handleMessageLongPress(item)}
        onImagePress={handleImagePress}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Chat</Text>
            <Text style={styles.headerSubtitle}>User {otherUserId.substring(0, 8)}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Options',
              '',
              [
                { text: 'Search Messages', onPress: () => Alert.alert('Coming Soon', 'Search functionality will be added soon') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
          style={styles.moreButton}
          activeOpacity={0.7}
        >
          <Text style={styles.moreButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          showsVerticalScrollIndicator={false}
        />

        {editingMessageId && (
          <View style={styles.editingBanner}>
            <Text style={styles.editingText}>Editing message</Text>
            <TouchableOpacity
              onPress={() => {
                setEditingMessageId(null);
                setInputText('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelEdit}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setImagePickerVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.attachIcon}>📷</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleFilePick}
            activeOpacity={0.8}
          >
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder={editingMessageId ? "Edit message..." : "Type a message..."}
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>{editingMessageId ? '✓' : '➤'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ImagePickerModal
        visible={imagePickerVisible}
        onClose={() => setImagePickerVisible(false)}
        onImageSelected={handleImageSelected}
      />

      <Modal
        visible={!!selectedImageUrl}
        transparent
        onRequestClose={() => setSelectedImageUrl(null)}
      >
        <TouchableOpacity
          style={styles.imageModalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedImageUrl(null)}
        >
          <Image
            source={{ uri: selectedImageUrl || '' }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  headerSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontWeight: '500' },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: { fontSize: 20, color: colors.textPrimary },

  content: { flex: 1 },
  messagesList: { padding: 16, flexGrow: 1 },

  editingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  editingText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  cancelEdit: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachIcon: { fontSize: 18 },

  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 110,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },

  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: { width: '100%', height: '100%' },
});
