import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidemenu from './components/Sidemenu';
import Dashboard from './components/Dashboard';
import BookAppointmentForm from './components/BookingAppoinmentForm';
import MyCalendar from './components/Mycalendar';

const App: React.FC = () => {
  return (
    <Router>
      <div className="d-flex" style={{ height: '100vh', backgroundColor: '#f8f9fa' }}>
        <Sidemenu />
        
        <main className="flex-fill overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/book-appointment" element={<BookAppointmentForm />} />
            <Route path="/my-calendar" element={<MyCalendar />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;