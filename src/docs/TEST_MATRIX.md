# Test Matrix — fill actual result after running

Do not mark Pass until the test has been executed on your environment. Add screenshot/log references in the Evidence column.

| ID | Type | Steps | Expected result | Actual result | Evidence |
|---|---|---|---|---|---|
| T01 | Normal | Launch app with Internet | Product catalog appears | Not run | — |
| T02 | Negative | Disable Internet and reload catalog | Error message; retry available; app does not crash | Not run | — |
| T03 | Normal | Search a known product keyword | Matching products appear | Not run | — |
| T04 | Edge | Search a nonsense keyword | Empty state appears | Not run | — |
| T05 | Normal | Pull down to refresh | First page reloads | Not run | — |
| T06 | Normal | Scroll to bottom | Next page loads without duplicate IDs | Not run | — |
| T07 | Normal | Open a valid product | Detail and product fields appear | Not run | — |
| T08 | Negative | Open a malformed product ID | Friendly error state appears | Not run | — |
| T09 | Normal | Add the same product twice | Quantity becomes 2; count/total update | Not run | — |
| T10 | Edge | Decrease quantity from 1 | Item is removed; quantity never stays at 0 | Not run | — |
| T11 | Normal | Force close/reopen app | Cart and local favorites restore | Not run | — |
| T12 | Normal | Configure Firebase and sync wishlist | Wishlist appears in Firestore and reloads | Not run | — |
| T13 | Negative | Firebase config missing/offline | Message shown; local wishlist remains | Not run | — |
| T14 | Normal | In Settings, grant notification permission and send a test; then add a product to cart | Test notification and add-to-cart business notification appear on device | Not run | — |
| T15 | Negative | Deny notification permission and add item | Cart still works; no crash | Not run | — |
| T16 | Normal | Run Gemini recommendation with backend configured | Returned IDs match products in submitted catalog | Not run | — |
| T17 | Negative | Stop backend / use invalid Gemini key | AI screen shows error; app remains usable | Not run | — |
