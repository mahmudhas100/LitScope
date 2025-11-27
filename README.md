# 📚 LitScope — Virtual Reading Club Web App

![Badge](https://img.shields.io/badge/React-18.0-blue?style=flat&logo=react)
![Badge](https://img.shields.io/badge/Firebase-Cloud-orange?style=flat&logo=firebase)
![Badge](https://img.shields.io/badge/Status-Active-success?style=flat)
![Badge](https://img.shields.io/badge/License-OpenSource-green?style=flat)

**LitScope** is a virtual reading club platform developed with **React + Firebase**, designed to connect book lovers through interactive reading tables and book discussions.
The app enables users to create clubs, join discussions, and communicate in a comfortable, minimal reading-friendly interface.

> "Think of it as a warm, cozy reading corner — but online."

---

## ✨ Features

| Feature | What It Does | Why It Matters |
|--------|--------------|----------------|
| 🔐 **Secure Login/Signup** | Firebase Authentication system | Personalized accounts + secure access |
| 🏠 **Home Dashboard** | Shows all user-created reading tables/clubs | Easy browsing + instant participation |
| ➕ **Create Clubs** | Host book discussions with custom topics | Encourages engagement + social reading |
| 💬 **Discussion Interface** | Separate spaces for book conversation | Structured & distraction-free discussion |
| ☁ **Cloud Firestore** | Stores user & club data in real-time | No reload needed — data syncs instantly |
| 🎨 **Warm UI Design** | Minimal soft theme for reading comfort | Reduces strain during long reading sessions |

---

## 🧩 Tech Stack

| Layer | Technologies Used |
|-------|------------------|
| **Frontend** | React (Vite), TailwindCSS |
| **Backend** | Firebase Authentication + Firestore |
| **State Management** | React Context / Hooks |
| **Deployment** | Firebase Hosting |
| **Dev Tools** | VS Code, Git, Firebase CLI |

---

## 📁 Project Structure

```bash
LitScope/
├── src/
│   ├── components/
│   │   ├── auth/       # Login, SignUp
│   │   ├── clubs/      # ClubList, CreateClub, etc.
│   │   └── shared/     # Navbar, Sidebar, etc.
│   ├── firebase/       # Firebase config
│   ├── pages/          # Home, etc.
│   ├── App.jsx
│   └── main.jsx
├── public/
└── ...
```

---

## ⚙ Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mahmudhas100/LitScope.git
    cd LitScope
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Firebase:**
    Create a `.env` file in the root directory and add your Firebase credentials:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deployment

To deploy to Firebase Hosting:

```bash
npm run build
firebase deploy
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📑 Presentation

You can download the project presentation here:
📥 **[Download Presentation](./LitScope-Presentation.pptx)**