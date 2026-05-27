import React, { useState, useEffect } from "react";
import axios from "axios";

function MyTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTeacherEmail, setNewTeacherEmail] = useState("");

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  
  const isStudent = userRole === "Student" || userRole === "2";

  
  const fetchMyTeachers = async () => {
    try {
      const response = await axios.get("https://localhost:7080/api/User/my-teachers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(response.data);
    } catch (err) {
      console.error("Hocalar yüklenirken hata:", err);
    }
  };

 
  useEffect(() => {
    if (token && isStudent) {
      fetchMyTeachers();
    }
    
  }, [token, isStudent]);

  
  const handleAddTeacher = async () => {
    if (!newTeacherEmail.trim()) {
      alert("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    const payload = {
      teacherEmail: newTeacherEmail.trim()
    };

    try {
      const response = await axios.post("https://localhost:7080/api/User/add-new-teacher", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(response.data || "Hoca başarıyla listenize eklendi! ✅"); 
      setModalOpen(false); 
      setNewTeacherEmail(""); 
      fetchMyTeachers(); 
    } catch (err) {
      
      alert("Hata: " + (err.response?.data || err.message));
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
        <h2 style={{ margin: 0, color: "#fff" }}>👨‍🏫 Hocalarım</h2>
        {isStudent && (
          <button onClick={() => setModalOpen(true)} style={buttonBaseStyle}>
            + Yeni Hoca Ekle
          </button>
        )}
      </div>

     
      <div style={{ flex: 1, backgroundColor: "#202020", padding: "20px", borderRadius: "8px", border: "1px solid #333", overflowY: "auto" }}>
        {teachers.length === 0 ? (
          <div style={{ color: "#aaa", textAlign: "center", marginTop: "40px", fontSize: "16px" }}>
            Henüz kayıtlı olduğunuz bir hoca bulunmamaktadır.<br/>
            Sağ üstteki butondan hoca ekleyebilirsiniz.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
            {teachers.map((teacher) => (
              <div key={teacher.recordId} style={teacherCardStyle}>
                <div style={avatarStyle}>
                  {teacher.name?.[0]}{teacher.surname?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 5px 0", color: "#fff", fontSize: "16px" }}>{teacher.name} {teacher.surname}</h4>
                  <p style={{ margin: 0, color: "#888", fontSize: "13px" }}>✉️ {teacher.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    
      {modalOpen && (
        <div style={overlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ marginBottom: "20px", color: "#fff", borderBottom: "1px solid #444", paddingBottom: "12px" }}>
              Hoca Ekle
            </h3>

            <label style={labelStyle}>Hocanın E-posta Adresi</label>
            <input 
              type="email" 
              value={newTeacherEmail} 
              placeholder="hoca@example.com"
              style={inputStyle} 
              onChange={(e) => setNewTeacherEmail(e.target.value)} 
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={handleAddTeacher} style={saveButtonStyle}>Ekle</button>
              <button onClick={() => { setModalOpen(false); setNewTeacherEmail(""); }} style={cancelButtonStyle}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#191919", color: "#fff", boxSizing: "border-box", outline: "none" };
const labelStyle = { color: "#ccc", fontSize: "13px", fontWeight: "600" };
const overlayStyle = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 };
const modalBoxStyle = { backgroundColor: "#252525", padding: "30px", borderRadius: "12px", width: "400px", border: "1px solid #444", boxShadow: "0 15px 35px rgba(0,0,0,0.5)" };
const buttonBaseStyle = { padding: "10px 20px", backgroundColor: "#7367F0", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const saveButtonStyle = { flex: 1, padding: "12px", backgroundColor: "#28c76f", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const cancelButtonStyle = { flex: 1, padding: "12px", backgroundColor: "#ea5455", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };

const teacherCardStyle = { display: "flex", alignItems: "center", gap: "15px", padding: "15px", backgroundColor: "#2a2a2a", borderRadius: "8px", border: "1px solid #444", transition: "transform 0.2s", cursor: "default" };
const avatarStyle = { width: "45px", height: "45px", borderRadius: "50%", backgroundColor: "#7367F0", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px", fontWeight: "bold", textTransform: "uppercase" };

export default MyTeachers;