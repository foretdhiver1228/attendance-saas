import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AttendanceTracker from './components/AttendanceTracker';
import SignUp from './components/SignUp';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard'; // Import AdminDashboard

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AttendanceTracker />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* New Admin Dashboard Route */}
      </Routes>
    </Router>
  );
}

export default App;