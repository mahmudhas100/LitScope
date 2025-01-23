import { db, storage } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Create Club
export const createClub = async (clubData, imageFile) => {
  try {
    let imageUrl = '';
    if (imageFile) {
      const storageRef = ref(storage, `clubImages/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const docRef = await addDoc(collection(db, 'clubs'), {
      ...clubData,
      imageUrl,
      createdAt: new Date(),
      members: [],
      threads: []
    });

    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Read Clubs
export const getClubs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'clubs'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Update Club
export const updateClub = async (clubId, updatedData, newImageFile) => {
  try {
    let imageUrl = updatedData.imageUrl;
    if (newImageFile) {
      const storageRef = ref(storage, `clubImages/${Date.now()}_${newImageFile.name}`);
      const snapshot = await uploadBytes(storageRef, newImageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    await updateDoc(doc(db, 'clubs', clubId), {
      ...updatedData,
      imageUrl,
      updatedAt: new Date()
    });
  } catch (error) {
    throw error;
  }
};

// Delete Club
export const deleteClub = async (clubId) => {
  try {
    await deleteDoc(doc(db, 'clubs', clubId));
  } catch (error) {
    throw error;
  }
};
