import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateClub from './components/clubs/CreateClub';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Home from './pages/Home.jsx';
import ClubsList from './components/clubs/ClubList.jsx';
import ClubPage from './components/clubs/ClubPage'
import Sidebar from './components/shared/Sidebar.jsx';
import Navbar from './components/shared/Navbar'
import MyClubs from './components/clubs/MyClubs.jsx';
import Profile from './components/profile/Profile.jsx';
import BookPage from './components/books/BookPage.jsx';
import PrivateRoute from './components/shared/PrivateRoute.jsx';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex mt-16">
          <Sidebar />
          <div className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/my-clubs" element={<PrivateRoute><MyClubs /></PrivateRoute>} />
              <Route path="/create-club" element={<CreateClub />} />
              <Route path="/clubs" element={<ClubsList />} />
              <Route path="/clubs/:clubId" element={<ClubPage />} />
              <Route path="/book/:bookId" element={<BookPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
