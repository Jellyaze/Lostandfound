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
  limit,
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Create Post
export const createPost = async (postData, imageUri, userId, userName, userPhoto) => {
  try {
    // Upload image first
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const postId = `post_${Date.now()}`;
    const storageRef = ref(storage, `posts/${postId}/image.jpg`);
    await uploadBytes(storageRef, blob);
    const photoURL = await getDownloadURL(storageRef);

    // Create post document
    const post = {
      ...postData,
      postId,
      photo: photoURL,
      userId,
      userName,
      userPhoto,
      status: 'Active',
      createdAt: new Date()
    };

    await addDoc(collection(db, 'posts'), post);
    return { success: true, postId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get All Posts
export const getAllPosts = async (caseType = null) => {
  try {
    let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    if (caseType) {
      q = query(collection(db, 'posts'), where('caseType', '==', caseType), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: posts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get Recent Posts
export const getRecentPosts = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'posts'), 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: posts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get Post by ID
export const getPostById = async (postId) => {
  try {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (postDoc.exists()) {
      return { success: true, data: { id: postDoc.id, ...postDoc.data() } };
    }
    return { success: false, error: 'Post not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get User Posts
export const getUserPosts = async (userId) => {
  try {
    const q = query(
      collection(db, 'posts'), 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: posts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update Post
export const updatePost = async (postId, updates) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete Post
export const deletePost = async (postId, photoURL) => {
  try {
    // Delete image from storage
    if (photoURL) {
      const imageRef = ref(storage, photoURL);
      await deleteObject(imageRef);
    }
    
    // Delete post document
    await deleteDoc(doc(db, 'posts', postId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Search Posts
export const searchPosts = async (filters) => {
  try {
    let q = collection(db, 'posts');
    const constraints = [];

    if (filters.caseType) {
      constraints.push(where('caseType', '==', filters.caseType));
    }
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters.location) {
      constraints.push(where('location', '==', filters.location));
    }
    if (filters.date) {
      constraints.push(where('date', '==', filters.date));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    q = query(q, ...constraints);

    const querySnapshot = await getDocs(q);
    const posts = [];
    querySnapshot.forEach((doc) => {
      const postData = { id: doc.id, ...doc.data() };
      
      // Filter by tags if provided
      if (filters.tags && filters.tags.length > 0) {
        const postTags = postData.tags || [];
        const hasMatchingTag = filters.tags.some(tag => 
          postTags.some(postTag => postTag.toLowerCase().includes(tag.toLowerCase()))
        );
        if (hasMatchingTag) {
          posts.push(postData);
        }
      } else {
        posts.push(postData);
      }
    });

    return { success: true, data: posts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time Posts Listener
export const subscribeToPost = (callback, caseType = null) => {
  let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  
  if (caseType) {
    q = query(collection(db, 'posts'), where('caseType', '==', caseType), orderBy('createdAt', 'desc'));
  }

  return onSnapshot(q, (querySnapshot) => {
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    callback(posts);
  });
};