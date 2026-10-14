import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db, ensureAnonymousUser } from './firebase';

// Tạo tham chiếu tới wishlist riêng của user đã đăng nhập Anonymous.
async function userWishlistCollection() {
  const user = await ensureAnonymousUser();
  return collection(db, 'users', user.uid, 'wishlist');
}

export async function getRemoteWishlist() {
  const ref = await userWishlistCollection();
  const snapshot = await getDocs(ref);
  // Firestore trả snapshot; đổi các document thành mảng object để context dùng.
  return snapshot.docs.map((item) => item.data());
}

export async function saveRemoteWishlistProduct(product) {
  const ref = await userWishlistCollection();
  // ID sản phẩm cũng là ID document, nên lưu lại cùng sản phẩm sẽ ghi đè thay vì tạo bản sao.
  await setDoc(doc(ref, String(product.id)), {
    id: product.id,
    title: product.title,
    price: product.price,
    thumbnail: product.thumbnail || '',
    updatedAt: new Date().toISOString(),
  });
}

export async function removeRemoteWishlistProduct(productId) {
  const ref = await userWishlistCollection();
  // Chỉ xóa document tương ứng với sản phẩm người dùng bỏ yêu thích.
  await deleteDoc(doc(ref, String(productId)));
}
