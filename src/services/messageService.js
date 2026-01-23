import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Create or Get Chat
export const createOrGetChat = async (currentUserId, otherUserId, currentUserName, otherUserName, currentUserPhoto, otherUserPhoto) => {
  try {
    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('users', 'array-contains', currentUserId));
    const querySnapshot = await getDocs(q);
    
    let existingChat = null;
    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      if (chatData.users.includes(otherUserId)) {
        existingChat = { id: doc.id, ...chatData };
      }
    });

    if (existingChat) {
      return { success: true, chatId: existingChat.id, data: existingChat };
    }

    // Create new chat
    const chatId = `chat_${Date.now()}`;
    const newChat = {
      chatId,
      users: [currentUserId, otherUserId],
      userNames: [currentUserName, otherUserName],
      userPhotos: [currentUserPhoto, otherUserPhoto],
      lastMessage: '',
      lastMessageTime: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'chats', chatId), newChat);
    return { success: true, chatId, data: newChat };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send Text Message
export const sendMessage = async (chatId, senderId, senderName, text) => {
  try {
    const messageData = {
      senderId,
      senderName,
      text,
      createdAt: new Date()
    };

    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
    
    // Update chat last message
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: text,
      lastMessageTime: new Date(),
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send Image Message
export const sendImageMessage = async (chatId, senderId, senderName, imageUri) => {
  try {
    // Upload image
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const messageId = `msg_${Date.now()}`;
    const storageRef = ref(storage, `messages/${chatId}/${messageId}.jpg`);
    await uploadBytes(storageRef, blob);
    const imageURL = await getDownloadURL(storageRef);

    const messageData = {
      senderId,
      senderName,
      image: imageURL,
      text: '[Image]',
      createdAt: new Date()
    };

    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
    
    // Update chat last message
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: '[Image]',
      lastMessageTime: new Date(),
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send File Message
export const sendFileMessage = async (chatId, senderId, senderName, fileUri, fileName) => {
  try {
    // Upload file
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const messageId = `msg_${Date.now()}`;
    const storageRef = ref(storage, `messages/${chatId}/${messageId}_${fileName}`);
    await uploadBytes(storageRef, blob);
    const fileURL = await getDownloadURL(storageRef);

    const messageData = {
      senderId,
      senderName,
      file: fileURL,
      text: `[File: ${fileName}]`,
      createdAt: new Date()
    };

    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
    
    // Update chat last message
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: `[File: ${fileName}]`,
      lastMessageTime: new Date(),
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get User Chats
export const getUserChats = async (userId) => {
  try {
    const q = query(
      collection(db, 'chats'), 
      where('users', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const chats = [];
    querySnapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: chats };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get Chat Messages
export const getChatMessages = async (chatId) => {
  try {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete Chat
export const deleteChat = async (chatId) => {
  try {
    // Delete all messages first
    const messagesSnapshot = await getDocs(collection(db, 'chats', chatId, 'messages'));
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Delete chat document
    await deleteDoc(doc(db, 'chats', chatId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time Chat Listener
export const subscribeToChats = (userId, callback) => {
  const q = query(
    collection(db, 'chats'),
    where('users', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const chats = [];
    querySnapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    callback(chats);
  });
};

// Real-time Messages Listener
export const subscribeToMessages = (chatId, callback) => {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};