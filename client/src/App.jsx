import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import Lenis from 'lenis';

// Pages
const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const RoomDetails = lazy(() => import('./pages/RoomDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const About = lazy(() => import('./pages/About'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminRooms = lazy(() => import('./pages/admin/AdminRooms'));
const AdminAddRoom = lazy(() => import('./pages/admin/AdminAddRoom'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminAddProperty = lazy(() => import('./pages/admin/AdminAddProperty'));
const AdminReservationRegister = lazy(() => import('./pages/admin/AdminReservationRegister'));
const AdminSiteContent = lazy(() => import('./pages/admin/AdminSiteContent'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminAvailability = lazy(() => import('./pages/admin/AdminAvailability'));

import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8, // Reduced from 1.2 for snappier feel
      easing: (t) => 1 - Math.pow(1 - t, 3), // Cubic out for smoother stop
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 0.8, // Reduced for control
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Integrate with internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute('href'));
      });
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Site Layout */}
          <Route element={
            <div className="flex flex-col min-h-screen bg-slate-50 text-secondary font-sans selection:bg-primary/20">
              <Navbar />
              <main className="flex-grow">
                <Outlet />
              </main>
              <Footer />
            </div>
          }>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/rooms" element={<Search />} /> {/* Alias for search */}
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Route>

          {/* Protected Admin Layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="rooms" element={<AdminRooms />} />
              <Route path="rooms/add" element={<AdminAddRoom />} />
              <Route path="rooms/edit/:id" element={<AdminAddRoom />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="properties/add" element={<AdminAddProperty />} />
              <Route path="properties/edit/:id" element={<AdminAddProperty />} />
              <Route path="register" element={<AdminReservationRegister />} />
              <Route path="content" element={<AdminSiteContent />} />

              <Route path="messages" element={<AdminMessages />} />
              <Route path="availability" element={<AdminAvailability />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
