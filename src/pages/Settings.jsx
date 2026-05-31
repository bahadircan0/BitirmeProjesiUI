import React, { useState, useEffect } from "react";
import axios from "axios";

function Settings() {
  const [userRole, setUserRole] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  
  const [name, setName] = useState(""); 
  const [surname, setSurname] = useState(""); 
  const [email, setEmail] = useState(""); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
        
        const role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decodedToken["role"];
        setUserRole(role);
        setIsApproved(decodedToken["isApproved"] === "true" || decodedToken["isApproved"] === true); 

        const userEmail = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decodedToken["email"];
        setEmail(userEmail || "");

        const fullNameClaim = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decodedToken["unique_name"];
        if (fullNameClaim) {
          const parts = fullNameClaim.trim().split(" ");
          if (parts.length > 1) {
            setSurname(parts[parts.length - 1]); 
            setName(parts.slice(0, parts.length - 1).join(" ")); 
          } else {
            setName(parts[0] || "");
            setSurname("");
          }
        }
      } catch (error) {
        console.error("Token çözümlenirken hata oluştu:", error);
      }
    }
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!name.trim() || !surname.trim()) {
      alert("Lütfen ad ve soyad alanlarını boş bırakmayınız.");
      return;
    }

    try {
      const response = await axios.put(
        "https://localhost:7080/api/User/update-profile", 
        { 
          name: name.trim(), 
          surname: surname.trim() 
        }, 
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      alert("✅ " + (response.data?.message || "Profil bilgileriniz başarıyla güncellendi!"));
      
    } catch (error) {
      console.error("Profil güncellenirken hata oluştu:", error);
      alert("❌ Hata: " + (error.response?.data?.message || error.response?.data || error.message));
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
        <h2 style={{ margin: 0, color: "#fff" }}>⚙️ Profil Ayarları</h2>
      </div>


      <div style={{ flex: 1, backgroundColor: "#202020", padding: "20px", borderRadius: "8px", border: "1px solid #333", overflowY: "auto" }}>
        
        <div style={settingsCardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#fff", borderBottom: "1px solid #444", paddingBottom: "12px" }}>Hesap Bilgileri</h3>
          
         
          <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
            <span style={{ backgroundColor: userRole === "Teacher" || userRole === "1" ? "#ea5455" : "#7367F0", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", fontWeight: "bold", color: "#fff" }}>
              Rol: {userRole === "Teacher" || userRole === "1" ? "Eğitmen (Teacher)" : "Öğrenci (Student)"}
            </span>
           
          </div>

     
          <label style={labelStyle}>Adınız</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={inputStyle} 
            placeholder="Adınızı giriniz"
          />

          <label style={labelStyle}>Soyadınız</label>
          <input 
            type="text" 
            value={surname} 
            onChange={(e) => setSurname(e.target.value)} 
            style={inputStyle} 
            placeholder="Soyadınızı giriniz"
          />
          

          <label style={labelStyle}>E-posta Adresiniz (Değiştirilemez)</label>
          <input 
            type="email" 
            value={email} 
            style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} 
            disabled 
          />
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <button onClick={handleSave} style={saveButtonStyle}>Değişiklikleri Kaydet</button>
          </div>

        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", marginBottom: "20px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#191919", color: "#fff", boxSizing: "border-box", outline: "none" };
const labelStyle = { color: "#ccc", fontSize: "13px", fontWeight: "600" };
const saveButtonStyle = { padding: "12px 24px", backgroundColor: "#28c76f", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" };
const settingsCardStyle = { backgroundColor: "#252525", padding: "30px", borderRadius: "12px", border: "1px solid #444", maxWidth: "600px" };

export default Settings;