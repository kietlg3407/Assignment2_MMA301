# Requirement Traceability Matrix (RTM)

| ID | Requirement | Implementation | Verification to perform |
|---|---|---|---|
| R01 | Remote product catalog | `src/services/products.js`, `app/index.js` | Online success; offline/error and retry |
| R02 | FlatList pagination | `app/index.js` | Scroll to end; no duplicate items; final page |
| R03 | Search and refresh | `app/index.js` | Search hit/miss; pull-to-refresh |
| R04 | Product detail | `app/product/[id].js` | Valid ID; invalid/missing ID |
| R05 | Cart add/update/remove | `src/context/ShopContext.js`, `app/cart.js` | Add same product twice; +/- quantity; remove |
| R06 | Correct derived count/total | `ShopContext.js` | Compare count and sum with manual calculation |
| R07 | Local persistence | `ShopContext.js` | Restart app and confirm cart/wishlist restored |
| R08 | Firebase business use case | `src/services/firebase.js`, `src/services/wishlist.js`, `app/wishlist.js` | Anonymous auth + Firestore sync; offline/permission failure |
| R09 | Gemini business context | `server/server.js`, `src/services/gemini.js`, `app/ai.js` | Real catalog context; valid/invalid model output; API failure |
| R10 | Notification permission/event | `src/services/notifications.js`, product add handlers | Grant/deny permission; add product |
| R11 | Graceful failure states | List/detail/AI/Firebase modules | Disconnect network; observe user feedback and no crash |
| R12 | Android release evidence | EAS Build steps in README | Build and install artifact; record actual result |
