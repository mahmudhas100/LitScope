import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";

const Home = () => {
  const navigate = useNavigate();

  const handleCreateClub = () => {
    const user = auth.currentUser;
    if (user) {
      navigate("/create-club");
    } else {
      navigate("/login");
    }
  };

  const handleJoinClub = () => {
    const user = auth.currentUser;
    if (user) {
      navigate("/clubs");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-12 md:pt-40 md:pb-20">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-neutral-800 sm:text-5xl md:text-6xl">
              <span className="block">Welcome to</span>
              <span className="block text-primary-600">LitScope</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-neutral-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Join virtual book discussions, connect with readers worldwide, and
              explore literature together.
            </p>
            <div className="mt-10 flex gap-4 justify-center">
              <button
                onClick={handleCreateClub}
                className="px-8 py-3 rounded-xl border-2 border-primary-600 text-primary-600 font-medium hover:bg-primary-50 transition duration-150 ease-in-out transform hover:scale-105"
              >
                Create Club
              </button>
              <button
                onClick={handleJoinClub}
                className="px-8 py-3 rounded-xl border-2 border-primary-600 text-white bg-black font-medium hover:bg-black-50 transition duration-150 ease-in-out transform hover:scale-105"
              >
                Join a Club
              </button>
            </div>
          </div>
          {/* Feature Cards */}
          <div className="mt-32 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Create Book Clubs</h3>
              <p className="text-gray-600 leading-relaxed">
                Start your own reading community. Choose books, set reading schedules, and lead engaging discussions with fellow readers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Live Discussions</h3>
              <p className="text-gray-600 leading-relaxed">
                Participate in real-time book discussions. Share insights, debate interpretations, and discover new perspectives.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Reading Progress</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your reading journey, set goals, and celebrate milestones with your book club members.
              </p>
            </div>
          </div>
          {/* Call to Action */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-neutral-800">
              Ready to start your reading journey?
            </h2>
            <p className="mt-4 text-neutral-600">
              Join our community of book lovers today
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="mt-5 px-8 py-3 bg-primary-600 text-black font-semibold rounded-lg hover:bg-primary-00 transition duration-150 ease-in-out transform hover:scale-105"
            >
              Get Started by signing up
            </button>
          </div>
        </div>
      </div>
      <footer className="bg-neutral-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">LitScope</h3>
              <p className="text-sm text-gray-600">
                Connecting readers worldwide through virtual book discussions.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="/about" className="hover:text-blue-600">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-blue-600">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-blue-600">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-blue-600">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-blue-600">
                    X
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>support@litscope.com</li>
                <li>+8801234-567890</li>
                <li>123 Reading Street</li>
                <li>Bookville, BK 12345</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p>© {new Date().getFullYear()} LitScope. All rights reserved.</p>
              <p className="mt-2">Made with 📚 for book lovers everywhere</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
