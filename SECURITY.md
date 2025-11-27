# Security Guide for LitScope

## API Key Visibility
You noticed that your API keys (`VITE_FIREBASE_API_KEY`, `VITE_GOOGLE_BOOKS_API_KEY`) are visible in the browser network tab. **This is normal for client-side applications**, but you must take steps to prevent abuse.

### 1. Securing Firebase
Since the API key is public, we secure the data using **Firestore Security Rules**.

1.  I have created a `firestore.rules` file in your project root.
2.  You need to deploy these rules to Firebase.
    *   If you have the Firebase CLI installed:
        ```bash
        firebase deploy --only firestore:rules
        ```
    *   Alternatively, copy the content of `firestore.rules` and paste it into the **Firestore Database > Rules** tab in the [Firebase Console](https://console.firebase.google.com/).

### 2. Securing Google Books API Key
The Google Books API key can be used by anyone who finds it unless you restrict it.

1.  Go to the [Google Cloud Console Credentials page](https://console.cloud.google.com/apis/credentials).
2.  Find your **Google Books API Key**.
3.  Click the **Edit** (pencil) icon.
4.  Under **Application restrictions**, select **Websites (HTTP referrers)**.
5.  Add the following items to **Website restrictions**:
    *   `http://localhost:5173/*` (for development)
    *   `https://your-production-domain.com/*` (for your live site)
6.  Click **Save**.

Now, even if someone steals your key, they cannot use it from their own website or script.
