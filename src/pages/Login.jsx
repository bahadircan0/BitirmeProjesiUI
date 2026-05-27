import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 
function Login() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
 
  const navigate = useNavigate();

 
  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(""); 

    try {
      
      const response = await axios.post("https://localhost:7080/api/Auth/login", {
        email: email,
        password: password,
      });

    
      const token = response.data.token;
      const decoded = jwtDecode(token);
        const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", userRole);


      
     
      navigate("/dashboard");

    } catch (err) {
      
      setError(err.response?.data || "Giriş yapılamadı. E-posta veya şifre hatalı.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
      <div style={{ padding: "30px", border: "1px solid #ccc", borderRadius: "8px", width: "300px" }}>
        <h2>Giriş Yap 🔐</h2>
        
        
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "15px" }}>
            <label>E-posta</label>
            <input 
              type="email" 
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Şifre</label>
            <input 
              type="password" 
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "blue", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Giriş Yap
          </button>
        </form>

        <p style={{ marginTop: "15px", fontSize: "14px", textAlign: "center" }}>
          Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;