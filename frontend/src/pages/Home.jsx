import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [query, setQuery] = useState("");
  const [historial, setHistorial] = useState([]);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [resumen, setResumen] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = async (e, message = null) => {
    e.preventDefault();
    console.log('historial', historial)
    if (message) {
      const newMessage = { role: "user", content: message };
      const updatedHistorial = [...historial, newMessage];
      setHistorial(updatedHistorial);
    }
    const apiUrl = `http://ley-al-alcance.duckdns.org/api/leyes/semantic/`;
    const historialToSend = message ? [...historial, { role: "user", content: message }] : historial;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, h: historialToSend }),
    });
    const data = await response.json();
    const filtered = data.resultados || [];
    setHistorial(data.historial_mensajes || []);
    console.log(filtered)
    setResults(filtered);
    setResumen(data.resumen || "");
    setSearched(true);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "80vw", margin: "0 auto" }}>
      <h1>Buscador de Leyes</h1>

      <form style={{ marginBottom: "20px" }} onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe tu búsqueda..."
          style={{ padding: "8px", width: "70%", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Buscar
        </button>
      </form>
      <div style={{ display: "flex", gap: "40px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: results.length > 0 ? 'block' : 'none', color: '#000', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
            <ReactMarkdown>{resumen}</ReactMarkdown>
          </div>
          
          {results.length > 0 ? (
          <h2><b>Leyes que te podrian ayudar:</b></h2>
          ) : <p>Realiza una busqueda</p>}

          <div>
            {results.length > 0 ? (
              <ul>
                {results.map((ley) => (
                  <li key={ley.id}>
                    <p>{ley.titulo}</p>
                    <a target="_blank" style={{ color: "white", textDecoration: "underline" }} href={ley.historial.sort((a, b) => new Date(a.fecha_ppo) - new Date(b.fecha_ppo)).reverse()[0].rutaArchivo}>Ver Documento</a>
                  </li>
                ))}
              </ul>
            ) : (
              searched && <p>No se encontraron resultados</p>
            )}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Chat Bot</h2>
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {historial.length > 2 ? (
                <ul id="messages">
                  {
                    historial[historial.length - 1].role === 'user' ? (
                      <li className="assistant typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </li>
                    ) : null
                  }
                  {historial.slice(2).reverse().map((msg, index) => (
                    <li className={msg.role} key={index}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay mensajes en el historial.</p>
              )}
            </div>
            <div>
              <textarea
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <button onClick={(e) => {
                console.log(historial, message)
                handleSearch(e, message);
                setMessage("");
              }} style={{ marginTop: "10px", padding: "8px 16px" }}>Enviar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
