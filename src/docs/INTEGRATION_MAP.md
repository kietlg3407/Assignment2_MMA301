# Integration Map

```text
ProductListScreen ──fetch──> DummyJSON API
       │                         │
       ├── Context API ──> Cart + Wishlist state
       │                     │
       │                     └── AsyncStorage (restore/save)
       │
       ├── Wishlist service ──> Firebase Auth (anonymous)
       │                         └── Cloud Firestore users/{uid}/wishlist
       │
       ├── Add-to-cart event ──> expo-notifications (permission + local notification)
       │
       └── AI screen ──> Express backend ──> Gemini API
                           │
                           └── returns IDs; client validates IDs against loaded catalog
```

Failure paths: API errors show retry; AsyncStorage errors are logged and the app continues; Firebase failures preserve local wishlist; notification denial does not block cart; Gemini/backend errors are shown in the AI screen.
