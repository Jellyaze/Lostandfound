import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Generate Random Code
const generateCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Create Claim/Return Record
export const createClaimReturn = async (postId) => {
  try {
    const claimReturnId = `cr_${Date.now()}`;
    const claimCode = generateCode();
    const returnCode = generateCode();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24); // 24 hour expiration

    const claimReturnData = {
      claimReturnId,
      postId,
      claimCode,
      returnCode,
      claimProof: null,
      returnProof: null,
      claimConfirmed: false,
      returnConfirmed: false,
      claimerUserId: null,
      returnerUserId: null,
      codeExpiration: expirationTime,
      completed: false,
      createdAt: new Date()
    };

    await addDoc(collection(db, 'claimReturn'), claimReturnData);
    return { success: true, claimCode, returnCode, claimReturnId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get Claim/Return by Post ID
export const getClaimReturnByPostId = async (postId) => {
  try {
    const q = query(collection(db, 'claimReturn'), where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { success: true, data: { id: doc.id, ...doc.data() } };
    }
    return { success: false, error: 'Claim/Return record not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload Claim Proof
export const uploadClaimProof = async (claimReturnId, imageUri, userId) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `proofs/${claimReturnId}/claim.jpg`);
    await uploadBytes(storageRef, blob);
    const proofURL = await getDownloadURL(storageRef);

    // Find the document by claimReturnId
    const q = query(collection(db, 'claimReturn'), where('claimReturnId', '==', claimReturnId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        claimProof: proofURL,
        claimerUserId: userId
      });
      return { success: true, url: proofURL };
    }
    return { success: false, error: 'Claim/Return record not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload Return Proof
export const uploadReturnProof = async (claimReturnId, imageUri, userId) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `proofs/${claimReturnId}/return.jpg`);
    await uploadBytes(storageRef, blob);
    const proofURL = await getDownloadURL(storageRef);

    // Find the document by claimReturnId
    const q = query(collection(db, 'claimReturn'), where('claimReturnId', '==', claimReturnId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        returnProof: proofURL,
        returnerUserId: userId
      });
      return { success: true, url: proofURL };
    }
    return { success: false, error: 'Claim/Return record not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verify Claim Code
export const verifyClaimCode = async (postId, code) => {
  try {
    const result = await getClaimReturnByPostId(postId);
    if (!result.success) {
      return { success: false, error: 'Claim record not found' };
    }

    const claimReturn = result.data;
    
    // Check expiration
    const now = new Date();
    const expiration = claimReturn.codeExpiration.toDate ? claimReturn.codeExpiration.toDate() : new Date(claimReturn.codeExpiration);
    
    if (now > expiration) {
      return { success: false, error: 'Code has expired' };
    }

    if (claimReturn.claimCode === code) {
      // Find the document and update
      const q = query(collection(db, 'claimReturn'), where('postId', '==', postId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { claimConfirmed: true });
        
        // Update post status
        const postsQuery = query(collection(db, 'posts'), where('postId', '==', postId));
        const postsSnapshot = await getDocs(postsQuery);
        if (!postsSnapshot.empty) {
          const postRef = postsSnapshot.docs[0].ref;
          await updateDoc(postRef, { status: 'Claimed' });
        }
        
        return { success: true };
      }
    }
    return { success: false, error: 'Invalid code' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verify Return Code
export const verifyReturnCode = async (postId, code) => {
  try {
    const result = await getClaimReturnByPostId(postId);
    if (!result.success) {
      return { success: false, error: 'Return record not found' };
    }

    const claimReturn = result.data;
    
    // Check expiration
    const now = new Date();
    const expiration = claimReturn.codeExpiration.toDate ? claimReturn.codeExpiration.toDate() : new Date(claimReturn.codeExpiration);
    
    if (now > expiration) {
      return { success: false, error: 'Code has expired' };
    }

    if (claimReturn.returnCode === code) {
      // Find the document and update
      const q = query(collection(db, 'claimReturn'), where('postId', '==', postId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { 
          returnConfirmed: true,
          completed: true
        });
        
        // Update post status
        const postsQuery = query(collection(db, 'posts'), where('postId', '==', postId));
        const postsSnapshot = await getDocs(postsQuery);
        if (!postsSnapshot.empty) {
          const postRef = postsSnapshot.docs[0].ref;
          await updateDoc(postRef, { status: 'Returned' });
        }
        
        return { success: true };
      }
    }
    return { success: false, error: 'Invalid code' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


export const regenerateCodes = async (postId) => {
  try {
    const newClaimCode = generateCode();
    const newReturnCode = generateCode();
    const newExpiration = new Date();
    newExpiration.setHours(newExpiration.getHours() + 24);

    const q = query(collection(db, 'claimReturn'), where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        claimCode: newClaimCode,
        returnCode: newReturnCode,
        codeExpiration: newExpiration
      });
      return { success: true, claimCode: newClaimCode, returnCode: newReturnCode };
    }
    return { success: false, error: 'Claim/Return record not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};