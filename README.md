# 🎯 MyTrackDesk

> **A smart and simple all-in-one personal tracker to organize and monitor everything that matters in your life.**

---

## 📝 Description

**MyTrackDesk** is a comprehensive tracking platform that helps you stay organized and in control of your daily life. Built with modern web technologies, it provides a clean, customizable space to track various aspects of your personal and professional journey.

Whether you're monitoring your health, managing finances, tracking entertainment, or organizing tasks—**MyTrackDesk** offers an intuitive dashboard to visualize your progress and achieve your goals.

---

## ✨ Current Features

- 🔐 **User Authentication** (Register, Login, Forgot Password)
- 🏋️ **Weight Tracker** with progress visualization and filtering
- 📊 **Interactive Charts** for data insights
- 📱 **Fully Responsive** design (Mobile, Tablet, Desktop)
- 🎨 **Modern UI** with gradient themes and smooth animations
- ☁️ **Cloud Storage** with Firebase Firestore
- 🔒 **Secure Authentication** with Firebase Auth

---

## 🚀 Coming Soon

### 💰 Finance & Budget
- Expense Tracker
- Income Tracker
- Budget Planner
- Savings Goal Tracker
- Investment Tracker
- Sales Tracker
- Expense + Profit/Loss Tracker

### 🏥 Health & Wellness
- Blood Sugar Tracker
- Blood Test Tracker

### 🎬 Entertainment
- Movie Watchlist
- TV Series Progress Tracker

### 🛠️ Productivity & Work
- To-Do List / Task Manager
- Work Hours / Timesheet Tracker
- Skill Development Tracker

### 🌍 Travel & Lifestyle
- Visited Places Tracker
- Packing List

### 🔐 Utilities
- Password Manager (simple, non-sensitive)
- Domain & Hosting Renewal Tracker

---

## 🛠️ Tech Stack

**Frontend:**
- React 18.3.1
- React Router DOM 7.7.0
- TailwindCSS 3.4.17
- Recharts (for data visualization)
- Lucide React (icons)

**Backend & Database:**
- Firebase Authentication
- Firebase Firestore

**UI/UX:**
- React Toastify for notifications
- Custom animations and transitions
- Glassmorphism effects

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnshumanBharatiya/mytrackdesk.git
   cd mytrackdesk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Copy your Firebase config

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. **Run the application**
   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Firebase Security Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weights/{docId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 📸 Screenshots

### Authentication Pages
Beautiful gradient-themed login and registration pages with glassmorphism effects.

### Dashboard
Modern sidebar navigation with dropdown menus and user profile management.

### Weight Tracker
- **Enter Weight**: Clean form with unit selection and notes
- **Track Weight**: Interactive charts, filters, and detailed history table

---

## 🎨 Features Highlight

- **Smart Chart Scaling**: Automatically adjusts Y-axis for better visualization of small weight changes
- **Advanced Filters**: Filter data by date range and weight range
- **Responsive Design**: Seamless experience across all devices
- **Persistent Login**: Stay logged in even after closing the browser
- **Real-time Updates**: Changes reflect immediately across the app

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Anshuman Bharatiya**

- GitHub: [@AnshumanBharatiya](https://github.com/AnshumanBharatiya)
- Repository: [mytrackdesk](https://github.com/AnshumanBharatiya/mytrackdesk)

---

## 🙏 Acknowledgments

- Firebase for backend services
- TailwindCSS for styling
- Recharts for data visualization
- Lucide React for beautiful icons

---

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by Anshuman Bharatiya

</div>
