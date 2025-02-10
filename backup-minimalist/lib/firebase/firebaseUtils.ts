import { auth, db, storage } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

// Auth utilities
export const loginUser = (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = (): Promise<void> => {
  return signOut(auth);
};

// Firestore utilities
export const createDocument = async (collectionName: string, docId: string, data: any): Promise<void> => {
  await setDoc(doc(db, collectionName, docId), data);
};

export const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateDocument = async (collectionName: string, docId: string, data: any): Promise<void> => {
  await updateDoc(doc(db, collectionName, docId), data);
};

export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
  await deleteDoc(doc(db, collectionName, docId));
};

// Storage utilities
export const uploadFile = async (path: string, file: File): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}; 