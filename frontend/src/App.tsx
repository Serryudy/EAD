import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidemenu from './components/Sidemenu';
import Dashboard from './components/Dashboard/Dashboard';
import BookAppointmentForm from './components/BookAppointment/BookAppointmentForm';
import MyCalendar from './components/Calendar/MyCalendar';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboad' ;
import EmployeeAppoinment from './components/Dashboard/EmployeeAppoinment';
import EmployeeAppoinmentDetails from './components/Dashboard/EmployeeAppoinmentDetails'; 
import EmpNotes from './components/Dashboard/EmpNotes';

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
            <Route path='/employeedashboard' element={<EmployeeDashboard/>}/>
            <Route path='/employeeappointment' element={<EmployeeAppoinment/>}/>
            <Route path='/empnotes' element={<EmpNotes/>}/>
            <Route path='/employeeappointment/:appointmentId' element={<EmployeeAppoinmentDetails/>}/>
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;