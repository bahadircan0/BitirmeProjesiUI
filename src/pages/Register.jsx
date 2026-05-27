import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(2); 
  const [teacherEmail, setTeacherEmail] = useState(""); 
  
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
    
      const requestData = {
        name: name,
        surname: surname,
        email: email,
        password: password,
        roleId: Number(roleId), 
        teacherEmail: Number(roleId) === 2 ? teacherEmail : null 
      };

      
      await axios.post("https://localhost:7080/api/Auth/register", requestData);

      setSuccess("Kayıt başarıyla tamamlandı! 🎉 Giriş sayfasına yönlendiriliyorsunuz...");
      
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      
      setError(err.response?.data || "Kayıt olurken bir hata oluştu.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px", marginBottom: "50px" }}>
      <div style={{ padding: "30px", border: "1px solid #ccc", borderRadius: "8px", width: "350px" }}>
        <h2>Kayıt Ol 📝</h2>
        
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
        {success && <p style={{ color: "green", fontWeight: "bold" }}>{success}</p>}

        <form onSubmit={handleRegister}>
          
          <div style={{ marginBottom: "15px" }}>
            <label>Adınız</label>
            <input type="text" required style={{ width: "100%", padding: "8px", marginTop: "5px" }} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Soyadınız</label>
            <input type="text" required style={{ width: "100%", padding: "8px", marginTop: "5px" }} value={surname} onChange={(e) => setSurname(e.target.value)} />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>E-posta</label>
            <input type="email" required style={{ width: "100%", padding: "8px", marginTop: "5px" }} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Şifre</label>
            <input type="password" required style={{ width: "100%", padding: "8px", marginTop: "5px" }} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Rolünüz</label>
            <select 
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              value={roleId} 
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value={1}>Öğretmen</option>
              <option value={2}>Öğrenci</option>
            </select>
          </div>

          {Number(roleId) === 2 && (
            <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#f9f9f9", border: "1px dashed #ccc" }}>
              <label>Hocanızın E-posta Adresi</label>
              <input type="email" required style={{ width: "100%", padding: "8px", marginTop: "5px" }} value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} />
            </div>
          )}

          <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "green", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Kayıt Ol
          </button>
        </form>

        <p style={{ marginTop: "15px", fontSize: "14px", textAlign: "center" }}>
          Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;