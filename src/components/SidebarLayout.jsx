import { Outlet, Link, useNavigate } from "react-router-dom";

function SidebarLayout() {
  const navigate = useNavigate();

  // Çıkış yap butonuna basınca token'ı sil ve Login'e at
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#191919", color: "#fff", fontFamily: "sans-serif" }}>
      
      {/* SOL MENÜ (SIDEBAR) */}
      <div style={{ width: "240px", backgroundColor: "#202020", borderRight: "1px solid #333", padding: "20px", display: "flex", flexDirection: "column" }}>
        
        {/* Logo Alanı */}
        <h2 style={{ margin: 0, paddingBottom: "20px", borderBottom: "1px solid #333" }}>
          🎯 Proje Logo
        </h2>

        {/* Linkler */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
          <Link to="/dashboard" style={{ color: "#ddd", textDecoration: "none", fontSize: "16px" }}>🏠 Ana Sayfa</Link>
          <Link to="/meetings" style={{ color: "#ddd", textDecoration: "none", fontSize: "16px" }}>📅 Toplantılarım</Link>
          <Link to="#" style={{ color: "#ddd", textDecoration: "none", fontSize: "16px" }}>⚙️ Ayarlar</Link>
        </nav>

        {/* En alta yapışan Çıkış Butonu */}
        <div style={{ marginTop: "auto" }}>
          <button 
            onClick={handleLogout} 
            style={{ width: "100%", padding: "10px", backgroundColor: "#cc0000", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "15px" }}
          >
            🚪 Çıkış Yap
          </button>
        </div>
      </div>

      {/* SAĞ TARAFTAKİ ANA İÇERİK ALANI */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {/* <Outlet /> React Router'ın sihirli kelimesidir. Menüden ne seçilirse buraya o sayfa yüklenir! */}
        <Outlet /> 
      </div>

    </div>
  );
}

export default SidebarLayout;