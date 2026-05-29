import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function SidebarLayout() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decodedToken = JSON.parse(jsonPayload);
        
        const role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decodedToken["role"];
        
        setUserRole(role);
      } catch (error) {
        console.error("Token çözümlenemedi:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#191919", color: "#fff", fontFamily: "sans-serif" }}>
      
      <div style={{ width: "240px", backgroundColor: "#202020", borderRight: "1px solid #333", padding: "20px", display: "flex", flexDirection: "column" }}>
        
        <h2 style={{ margin: 0, paddingBottom: "20px", borderBottom: "1px solid #333" }}>
          🎯 
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
          <Link to="/dashboard" style={{ color: "#ddd", textDecoration: "none", fontSize: "16px" }}>🏠 Ana Sayfa</Link>
          <Link to="/meetings" style={{ color: "#ddd", textDecoration: "none", fontSize: "16px" }}>📅 Toplantılarım</Link>
          
          {userRole === "Student" && (
            <Link to="/my-teachers" style={{ color: "#ddd", textDecoration: "none", fontSize: "16px" }} className="menu-item">👨‍🏫 Hocalarım</Link>
          )}

          <Link to="/settings" style={{ color: "#ddd", textDecoration: "none", fontSize: "16px" }}>⚙️ Ayarlar</Link>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <button 
            onClick={handleLogout} 
            style={{ width: "100%", padding: "10px", backgroundColor: "#cc0000", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "15px" }}
          >
            🚪 Çıkış Yap
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        <Outlet /> 
      </div>

    </div>
  );
}

export default SidebarLayout;