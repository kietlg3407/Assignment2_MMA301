import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ShopProvider } from '../context/ShopContext';

// Layout gốc của Expo Router: mọi màn hình bên dưới đều dùng chung ShopProvider.
export default function RootLayout() {
  return (
    <ShopProvider>
      <StatusBar style="dark" />
      {/* Mỗi Stack.Screen tương ứng với một route trong thư mục src/app. */}
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#2563eb' }, headerTintColor: '#fff', contentStyle: { backgroundColor: '#f8fafc' } }}>
        <Stack.Screen name="index" options={{ title: 'ShopMate' }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Chi tiết sản phẩm' }} />
        <Stack.Screen name="cart" options={{ title: 'Giỏ hàng' }} />
        <Stack.Screen name="wishlist" options={{ title: 'Sản phẩm yêu thích' }} />
        <Stack.Screen name="ai" options={{ title: 'AI gợi ý sản phẩm' }} />
        <Stack.Screen name="settings" options={{ title: 'Cài đặt' }} />
      </Stack>
    </ShopProvider>
  );
}
