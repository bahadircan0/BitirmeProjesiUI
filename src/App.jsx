import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings"; // 👈 YENİ SAYFAMIZI BURAYA ÇAĞIRDIK
import SidebarLayout from "./components/SidebarLayout";
import MeetingRoom from "./pages/MeetingRoom.jsx";
import MyTeachers from "./pages/MyTeachers.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


       <Route path="/meeting-room/:id" element={<MeetingRoom />} />

        {/* SIDEBAR'A (SOL MENÜYE) SAHİP OLAN SAYFALAR */}
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meetings" element={<Meetings />} /> 
          <Route path="/my-teachers" element={<MyTeachers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;