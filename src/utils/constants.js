import { collection, doc, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../firebase_setup/firebase';

const firestore = getFirestore(app);

export function useUserRoles() {
  const permissions = localStorage.getItem('permissions').split(',');

  return permissions;
}

export const variationJson = async () => {
  const querySnapshot = await getDocs(collection(firestore, 'Variation'));
  const results = [];
  querySnapshot.docs.map(async (element) => {
    results.push({
      quantity: 0,
      totalAmount: 0.0,
      goalQuantity: 0,
      productrefrence: element.ref,
    });
  });
  return results;
};
