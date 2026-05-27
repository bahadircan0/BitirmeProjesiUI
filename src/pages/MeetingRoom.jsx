import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import Editor from "@monaco-editor/react";
import axios from "axios";
import DailyIframe from "@daily-co/daily-js"; // YENİ EKLENDİ

function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [joinUrl, setJoinUrl] = useState(null);
  const [code, setCode] = useState("// Kodu buraya yaz...");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  
  const connectionRef = useRef(null);
  const videoContainerRef = useRef(null); // YENİ: Iframe'in içine yerleşeceği kutu
  const callFrameRef = useRef(null); // YENİ: Daily bağlantısını yöneteceğimiz referans

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const isTeacher = userRole === "Teacher" || userRole === "1";

  // 1. Backend'den Join URL'yi al
  useEffect(() => {
    const fetchJoinUrl = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7080/api/Meeting/GetMeetingToken/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJoinUrl(response.data.joinUrl);
      } catch (err) {
        console.error("Join URL alınamadı:", err);
      }
    };
    fetchJoinUrl();
  }, [id, token]);

  // 2. KESİN ÇÖZÜM: Daily-js ile Iframe'i oluştur ve eventleri dinle
  useEffect(() => {
    // Eğer url yoksa veya div henüz render olmadıysa bekle
    if (!joinUrl || !videoContainerRef.current) return;
    
    // Eğer callFrame zaten oluşturulduysa tekrar oluşturma (React Strict Mode koruması)
    if (callFrameRef.current) return;

    // Daily Iframe'i bizim belirttiğimiz Div'in içine yerleştiriyoruz
    const callFrame = DailyIframe.createFrame(videoContainerRef.current, {
      showLeaveButton: true,
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "none",
      },
    });
    
    callFrameRef.current = callFrame;

    callFrame.join({ url: joinUrl });

    // AYRILMA EVENTİNİ DİNLE (Artık %100 çalışacak)
    callFrame.on("left-meeting", () => {
      console.log("Kullanıcı toplantıdan ayrıldı, anasayfaya yönlendiriliyor...");
      navigate("/dashboard"); // Anasayfaya yönlendir
    });

    // Component unmount olduğunda temizlik yap (Odayı kapat)
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.leave().then(() => {
          callFrameRef.current.destroy();
          callFrameRef.current = null;
        });
      }
    };
  }, [joinUrl, navigate]);

  // 3. SignalR bağlantısı kur
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7080/hubs/code", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveCode", (newCode) => {
      setCode(newCode);
    });

    connection.on("ReceiveLanguage", (newLanguage) => {
      setLanguage(newLanguage);
    });

    connection.start()
      .then(() => {
        connection.invoke("JoinMeetingRoom", parseInt(id));
      })
      .catch((err) => console.error("SignalR bağlantı hatası:", err));

    connectionRef.current = connection;

    return () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("LeaveMeetingRoom", parseInt(id)).finally(() => {
          connection.stop();
        });
      } else {
        connection.stop();
      }
    };
  }, [id, token]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      connectionRef.current.invoke("SendCode", parseInt(id), newCode);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      connectionRef.current.invoke("SendLanguage", parseInt(id), newLang);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Derleniyor...");

    const languageIds = {
      javascript: 63,
      python: 71,
      csharp: 51,
      java: 62,
      cpp: 54,
    };

    try {
      const response = await axios.post(
        "https://localhost:7080/api/Meeting/RunCode",
        {
          code: code,
          languageId: languageIds[language] || 63
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      setOutput(response.data.output);
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.title || 
        JSON.stringify(err.response?.data) || 
        err.message;
        
      setOutput("Hata Detayı:\n" + errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#1a1a1a", overflow: "hidden" }}>
      
      {/* SOL: Daily.co Video Kapsayıcısı */}
      <div style={{ width: "55%", height: "100%", borderRight: "2px solid #333" }}>
        {joinUrl ? (
          /* YENİ: Iframe yerine bu div'i kullanıyoruz, Daily iframe'i bunun içine enjekte ediyor */
          <div ref={videoContainerRef} style={{ width: "100%", height: "100%" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#888" }}>
            Toplantı yükleniyor...
          </div>
        )}
      </div>

      {/* SAĞ: Kod Editörü */}
      <div style={{ width: "45%", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", backgroundColor: "#252525", borderBottom: "1px solid #333" }}>
          
          <select
            value={language}
            onChange={handleLanguageChange}
            disabled={!isTeacher} 
            title={!isTeacher ? "Sadece hoca dili değiştirebilir" : ""}
            style={{ 
              padding: "6px 12px", 
              backgroundColor: isTeacher ? "#333" : "#1a1a1a", 
              color: isTeacher ? "#fff" : "#888", 
              border: "1px solid #444", 
              borderRadius: "6px", 
              cursor: isTeacher ? "pointer" : "not-allowed" 
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="csharp">C#</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          {isTeacher && (
            <button
              onClick={runCode}
              disabled={isRunning}
              style={{ padding: "8px 20px", backgroundColor: isRunning ? "#555" : "#28c76f", color: "white", border: "none", borderRadius: "6px", cursor: isRunning ? "not-allowed" : "pointer", fontWeight: "bold" }}
            >
              {isRunning ? "Çalışıyor..." : "▶ Derle & Çalıştır"}
            </button>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              readOnly: false,
            }}
          />
        </div>

        <div style={{ height: "180px", backgroundColor: "#0d0d0d", borderTop: "1px solid #333", padding: "12px", overflowY: "auto" }}>
          <div style={{ color: "#28c76f", fontSize: "12px", marginBottom: "8px", fontWeight: "bold" }}>ÇIKTI</div>
          <pre style={{ color: "#eee", fontSize: "13px", margin: 0, whiteSpace: "pre-wrap" }}>
            {output || "Henüz çalıştırılmadı."}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;