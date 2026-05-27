import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";


function Meetings() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newMeeting, setNewMeeting] = useState({ title: "", description: "", start: "", end: "" });
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [events, setEvents] = useState([]);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const isTeacher = userRole === "Teacher" || userRole === "1";

  let teacherId = null;
  if (token) {
    const decoded = jwtDecode(token);
    teacherId = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"];
  }

  const formatToInput = (dateStr) => {
    const d = new Date(dateStr);
    const z = d.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(d - z);
    return localDate.toISOString().slice(0, 16);
  };

  const fetchMeetings = async () => {
    try {
      const response = await axios.get("https://localhost:7080/api/Meeting/GetMeetings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (err) { console.error("Yükleme hatası:", err); }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get("https://localhost:7080/api/User/GetMyStudents", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (err) { console.error("Öğrenci listesi hatası:", err); }
  };

  useEffect(() => {
    if (token) {
      fetchMeetings();
      if (isTeacher) fetchStudents();
    }
  }, [isTeacher, token]);

  const handleDateSelect = (selectInfo) => {
    if (!isTeacher) return;
    const start = new Date(selectInfo.startStr);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setNewMeeting({ title: "", description: "", start: formatToInput(start), end: formatToInput(end) });
    setSelectedStudents([]);
    setModalOpen(true);
  };

  const openEmptyModal = () => {
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    setNewMeeting({ title: "", description: "", start: formatToInput(now), end: formatToInput(later) });
    setSelectedStudents([]);
    setModalOpen(true);
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const saveMeeting = async () => {
    const payload = {
      teacherId: parseInt(teacherId),
      title: newMeeting.title,
      description: newMeeting.description,
      startTime: newMeeting.start,
      endTime: newMeeting.end,
      participantIds: selectedStudents
    };
    try {
      await axios.post("https://localhost:7080/api/Meeting/AddMeeting", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Toplantı başarıyla oluşturuldu! ✅");
      setModalOpen(false);
      fetchMeetings();
    } catch (err) {
      alert("Hata: " + (err.response?.data || err.message));
    }
  };

  
  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id,           // bunu ekle
      title: info.event.title,
      description: info.event.extendedProps.description,
      start: info.event.start,
      end: info.event.end,
      dailyRoomUrl: info.event.extendedProps.dailyRoomUrl,
    });
    setDetailModalOpen(true);
  };

  const navigate = useNavigate();
 const joinMeeting = async () => {
   if (selectedEvent?.id) {
    navigate(`/meeting-room/${selectedEvent.id}`);
       return;
  }
  try {
    const response = await axios.get(
      `https://localhost:7080/api/Meeting/GetMeetingToken/${selectedEvent.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    window.open(response.data.joinUrl, "_blank");
  } catch (err) {
    alert("Katılım hatası: " + (err.response?.data || err.message));
  }
};

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("tr-TR", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
        <h2 style={{ margin: 0, color: "#fff" }}>📅 Toplantılarım</h2>
        {isTeacher && (
          <button onClick={openEmptyModal} style={buttonBaseStyle}>
            + Yeni Toplantı Oluştur
          </button>
        )}
      </div>

      <div style={{ flex: 1, backgroundColor: "#202020", padding: "20px", borderRadius: "8px", border: "1px solid #333" }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={trLocale}
          selectable={isTeacher}
          select={handleDateSelect}
          events={events}
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          height="100%"
          eventClick={handleEventClick}
          buttonText={{ today: "Bugün", month: "Ay", week: "Hafta", day: "Gün" }}
        />
      </div>

   
      {detailModalOpen && selectedEvent && (
        <div style={overlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ marginBottom: "20px", color: "#fff", borderBottom: "1px solid #444", paddingBottom: "12px" }}>
              📋 Toplantı Detayı
            </h3>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Konu</span>
              <span style={detailValueStyle}>{selectedEvent.title}</span>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Açıklama</span>
              <span style={detailValueStyle}>{selectedEvent.description || "Açıklama yok"}</span>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Başlangıç</span>
              <span style={detailValueStyle}>{formatDate(selectedEvent.start)}</span>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Bitiş</span>
              <span style={detailValueStyle}>{formatDate(selectedEvent.end)}</span>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={joinMeeting} style={joinButtonStyle}>
                🎥 Toplantıya Katıl
              </button>
              <button onClick={() => setDetailModalOpen(false)} style={cancelButtonStyle}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      
      {modalOpen && (
        <div style={overlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ marginBottom: "20px", color: "#fff" }}>Toplantı Planla</h3>

            <label style={labelStyle}>Toplantı Konusu</label>
            <input type="text" value={newMeeting.title} style={inputStyle} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} />

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Başlangıç</label>
                <input type="datetime-local" value={newMeeting.start} style={inputStyle} onChange={(e) => setNewMeeting({ ...newMeeting, start: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Bitiş</label>
                <input type="datetime-local" value={newMeeting.end} style={inputStyle} onChange={(e) => setNewMeeting({ ...newMeeting, end: e.target.value })} />
              </div>
            </div>

            <label style={labelStyle}>Açıklama</label>
            <textarea value={newMeeting.description} style={{ ...inputStyle, height: "60px", resize: "none" }} onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })} />

            <label style={labelStyle}>Katılımcıları Seç</label>
            <div style={studentListContainerStyle}>
              {students.length > 0 ? students.map(s => (
                <div key={s.recordId} style={studentItemStyle}>
                  <input
                    type="checkbox"
                    id={`stud-${s.recordId}`}
                    checked={selectedStudents.includes(s.recordId)}
                    onChange={() => toggleStudent(s.recordId)}
                    style={{ marginRight: "10px", cursor: "pointer", width: "18px", height: "18px" }}
                  />
                  <label htmlFor={`stud-${s.recordId}`} style={{ cursor: "pointer", flex: 1 }}>{s.name} {s.surname}</label>
                </div>
              )) : <span style={{ color: "#777", fontSize: "12px" }}>Öğrenci bulunamadı.</span>}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={saveMeeting} style={saveButtonStyle}>Oluştur</button>
              <button onClick={() => setModalOpen(false)} style={cancelButtonStyle}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#191919", color: "#fff", boxSizing: "border-box" };
const labelStyle = { color: "#ccc", fontSize: "13px", fontWeight: "600" };
const overlayStyle = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 };
const modalBoxStyle = { backgroundColor: "#252525", padding: "30px", borderRadius: "12px", width: "500px", border: "1px solid #444", boxShadow: "0 15px 35px rgba(0,0,0,0.5)" };
const studentListContainerStyle = { maxHeight: "140px", overflowY: "auto", backgroundColor: "#191919", padding: "12px", borderRadius: "8px", border: "1px solid #444" };
const studentItemStyle = { display: "flex", alignItems: "center", marginBottom: "10px", color: "#eee", fontSize: "14px", borderBottom: "1px solid #2a2a2a", paddingBottom: "5px" };
const buttonBaseStyle = { padding: "10px 20px", backgroundColor: "#7367F0", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const saveButtonStyle = { flex: 1, padding: "12px", backgroundColor: "#28c76f", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const cancelButtonStyle = { flex: 1, padding: "12px", backgroundColor: "#ea5455", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const joinButtonStyle = { flex: 1, padding: "12px", backgroundColor: "#7367F0", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" };
const detailRowStyle = { display: "flex", gap: "12px", marginBottom: "12px", alignItems: "flex-start" };
const detailLabelStyle = { color: "#888", fontSize: "13px", minWidth: "80px", paddingTop: "2px" };
const detailValueStyle = { color: "#fff", fontSize: "14px", flex: 1 };

export default Meetings;