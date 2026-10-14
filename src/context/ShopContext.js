import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveRemoteWishlistProduct, removeRemoteWishlistProduct, getRemoteWishlist } from '../services/wishlist';
import { ensureAnonymousUser, isFirebaseConfigured } from '../services/firebase';

const STORAGE_KEY = '@shopmate/state-v1';
const ShopContext = createContext(null);

// Provider giữ state dùng chung giữa các màn hình và phục hồi state cục bộ khi mở app.
export function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ready, setReady] = useState(false);
  const [firebaseMessage, setFirebaseMessage] = useState('Firebase chưa cấu hình');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Chờ đọc xong AsyncStorage trước khi cho screen dùng dữ liệu mặc định rỗng.
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && alive) {
          const saved = JSON.parse(raw);
          setCart(Array.isArray(saved.cart) ? saved.cart : []);
          setFavorites(Array.isArray(saved.favorites) ? saved.favorites : []);
        }
      } catch (error) {
        console.warn('Restore local state failed:', error.message);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Ghi lại cart/favorites mỗi khi thay đổi; không ghi đè dữ liệu trước khi restore xong.
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, favorites })).catch((error) => {
      console.warn('Persist state failed:', error.message);
    });
  }, [cart, favorites, ready]);

  const addToCart = useCallback((product) => {
    setCart((old) => {
      const found = old.find((item) => item.id === product.id);
      // Nếu sản phẩm đã có thì tăng quantity; nếu chưa thì thêm với quantity ban đầu là 1.
      if (found) return old.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...old, { id: product.id, title: product.title, price: product.price, thumbnail: product.thumbnail, quantity: 1 }];
    });
  }, []);

  const changeQuantity = useCallback((productId, delta) => {
    // Lọc item có quantity <= 0 để giảm từ 1 sẽ bỏ sản phẩm khỏi cart.
    setCart((old) => old.map((item) => item.id === productId ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  }, []);
  const removeFromCart = useCallback((productId) => setCart((old) => old.filter((item) => item.id !== productId)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback(async (product) => {
    const exists = favorites.some((item) => item.id === product.id);
    // Cập nhật local ngay để UI phản hồi nhanh; thao tác cloud được xử lý sau đó.
    setFavorites((old) => exists ? old.filter((item) => item.id !== product.id) : [...old, { id: product.id, title: product.title, price: product.price, thumbnail: product.thumbnail || '' }]);
    if (!isFirebaseConfigured) {
      setFirebaseMessage('Đã lưu cục bộ; cấu hình Firebase để đồng bộ cloud.');
      return;
    }
    try {
      if (exists) await removeRemoteWishlistProduct(product.id);
      else await saveRemoteWishlistProduct(product);
      setFirebaseMessage('Wishlist đã đồng bộ với Firebase.');
    } catch (error) {
      setFirebaseMessage(`Firebase lỗi: ${error.message}. Dữ liệu vẫn được lưu trên thiết bị.`);
    }
  }, [favorites]);

  const syncFavoritesFromFirebase = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setFirebaseMessage('Firebase chưa cấu hình; đang hiển thị dữ liệu cục bộ.');
      return;
    }
    try {
      // Đọc cloud theo UID hiện tại, sau đó giữ lại item local chưa có ở cloud.
      const user = await ensureAnonymousUser();
      const remote = await getRemoteWishlist();
      const remoteIds = new Set(remote.map((item) => String(item.id)));
      const localOnly = favorites.filter((item) => !remoteIds.has(String(item.id)));
      await Promise.all(localOnly.map((item) => saveRemoteWishlistProduct(item)));

      // Dùng ID dạng chuỗi làm khóa để tránh trùng sản phẩm do khác kiểu number/string.
      const merged = new Map(remote.map((item) => [String(item.id), item]));
      for (const item of favorites) {
        if (!merged.has(String(item.id))) merged.set(String(item.id), item);
      }
      setFavorites([...merged.values()]);
      setFirebaseMessage(
        remote.length === 0 && favorites.length === 0
          ? `Tài khoản Firebase hiện tại không có wishlist (UID: ${user.uid}). Dữ liệu trước đó có thể nằm dưới UID khác.`
          : `Đã đồng bộ ${merged.size} sản phẩm (UID: ${user.uid}).`,
      );
    } catch (error) {
      setFirebaseMessage(`Không tải được Firebase: ${error.message}`);
    }
  }, [favorites]);

  // Tổng số lượng và tổng tiền là dữ liệu suy ra từ cart, không phải state riêng.
  const value = useMemo(() => ({
    cart, favorites, ready, firebaseMessage, addToCart, changeQuantity, removeFromCart, clearCart,
    toggleFavorite, syncFavoritesFromFirebase,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }), [cart, favorites, ready, firebaseMessage, addToCart, changeQuantity, removeFromCart, clearCart, toggleFavorite, syncFavoritesFromFirebase]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const value = useContext(ShopContext);
  // Báo lỗi sớm nếu một screen được render ngoài ShopProvider.
  if (!value) throw new Error('useShop phải được gọi bên trong ShopProvider');
  return value;
}
