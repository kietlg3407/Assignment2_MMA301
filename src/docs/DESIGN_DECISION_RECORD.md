# Design Decision Record (DDR)

## DDR-01 — Expo Router
**Decision:** Use Expo Router file-based navigation.  
**Reason:** Existing project uses `expo-router/entry`; keeping it avoids mixing two root-navigation patterns.  
**Trade-off:** Routes must follow the `app/` folder conventions.

## DDR-02 — Context API for cart and wishlist
**Decision:** Use React Context to share cart/wishlist state across screens.  
**Reason:** The assignment has a small number of shared state domains; no additional state library is necessary.  
**Trade-off:** For a much larger app, state could be split into smaller contexts or moved to a dedicated state library.

## DDR-03 — AsyncStorage for local persistence
**Decision:** Persist cart and local wishlist snapshots in AsyncStorage.  
**Reason:** It is simple key-value storage suitable for this demo.  
**Trade-off:** It is not encrypted storage and is not a relational database.

## DDR-04 — DummyJSON as remote catalog
**Decision:** Use DummyJSON product endpoints.  
**Reason:** A public demo catalog permits development without creating a custom server.  
**Trade-off:** It is demo data and does not represent a real store's inventory or checkout.

## DDR-05 — Firebase Firestore wishlist
**Decision:** Save wishlist entries under an anonymously authenticated user's UID.  
**Reason:** Demonstrates a real cloud business state without asking the student to build a full registration UI.  
**Trade-off:** Anonymous identity is device/session dependent; production systems may need account linking and recovery.

## DDR-06 — Gemini through backend proxy
**Decision:** Keep Gemini API key on a small Express backend, not in the mobile client.  
**Reason:** Client-side `EXPO_PUBLIC_*` values can be extracted from the app.  
**Trade-off:** The backend must be running and reachable; public deployment should add auth, rate limiting, and monitoring.

## DDR-07 — Local notification on cart event
**Decision:** Request permission and show a local notification when a product is added.  
**Reason:** Demonstrates a business event and permission-denied path without needing a push server.  
**Trade-off:** This is not remote push messaging.
