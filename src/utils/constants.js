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
  querySnapshot.docs.forEach((element) => {
    results.push({
      quantity: 0,
      totalAmount: 0.0,
      goalQuantity: 0,
      productrefrence: element.ref,
      actualReference: element.ref,
      id: element.id,
    });
  });
  return results;
};

export function getCurrentMonthRange() {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  return { startDate: startOfMonth, endDate: endOfMonth };
}

export function getDatesInRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function getCurrentMonthAndYear() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${month}-${year}`;
  return formattedDate;
}
