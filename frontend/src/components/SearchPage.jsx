import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Mic, MicOff, MessageCircle, Scale } from 'lucide-react';
import { LawCard } from './LawCard';
import ReactMarkdown from "react-markdown";
import { X } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get('q') || '');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  const recognitionRef = useRef(null);

  // ----------------------
  // SPEECH RECOGNITION SETUP
  // ----------------------
  useEffect(() => {
    window.history.replaceState(null, '', `?q=${encodeURIComponent(query)}`);
  }, [query]);
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    if(query.trim() !== '') {
      handleSearch();
    }
  }, []);

  // ----------------------
  // SEARCH
  // ----------------------
  const handleSearch = async (suggestedQuery = null, messageFromChat = null, ignoreHistorial = false) => {
    const searchQuery = suggestedQuery || query;

    if (!searchQuery.trim()) return;

    console.log("Performing search for:", searchQuery);

    // Si viene mensaje desde el chatbot, lo agregamos al historial
    if (messageFromChat) {
      const newMessage = { role: "user", content: messageFromChat };
      const updatedHistorial = [...historial, newMessage];
      setHistorial(updatedHistorial);
    }

    const apiUrl = `http://localhost:8000/api/leyes/semantic/`;
    const historialToSend = messageFromChat
      ? [...historial, { role: "user", content: messageFromChat }]
      : historial;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: searchQuery, h: ignoreHistorial ? [] : historialToSend }),
    });

    const data = await response.json();

    setResults(data.resultados || []);
    setHistorial(data.historial_mensajes || []);
    setHasSearched(true);
  };

  // ----------------------
  // VOICE SEARCH CONTROL
  // ----------------------
  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert("Lo siento, tu navegador no soporta búsqueda por voz.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // ----------------------
  // SUGGESTED QUERIES
  // ----------------------
  const suggestedQueries = [
    '¿Cómo abrir un negocio?',
    '¿Qué es la violencia digital?',
    '¿Cuáles son mis derechos laborales?',
    '¿Cómo denunciar violencia doméstica?',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* HEADER */}
      <div className="mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">Búsqueda Semántica con IA</span>
        </div>
        <h1 className="text-slate-900 mb-4">Encuentra Leyes en Lenguaje Sencillo</h1>
        <p className="text-slate-600">Haz preguntas de forma natural - no se requiere experiencia legal</p>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Ej: ¿Cómo abrir un negocio? ¿Qué es la violencia digital?"
          className="w-full px-6 py-4 pr-28 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          <button
            onClick={handleVoiceSearch}
            className={`p-3 rounded-lg transition-colors ${
              isListening ? "bg-red-600 animate-pulse text-white" : "bg-slate-600 text-white"
            }`}
          >
            {isListening ? <MicOff /> : <Mic />}
          </button>
          <button
            onClick={() => handleSearch(null, null, true)}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            <Search />
          </button>
        </div>

        {/* CHATBOT BUTTON */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <MessageCircle size={28} />
        </button>
      </div>

      {/* CHATBOT PANEL */}
{showChat && (
  <div className="fixed bottom-0 right-0 w-full md:w-[480px] h-[85vh] md:h-[90vh] bg-white shadow-2xl border border-slate-300 z-50 rounded-t-2xl md:rounded-xl flex flex-col">

    {/* HEADER */}
    <div className="bg-blue-600 text-white px-6 py-4 rounded-t-2xl md:rounded-t-xl flex items-center gap-3 shadow">
      <div className="bg-white/20 p-2 rounded-full">
        <MessageCircle size={20} />
      </div>
      <div>
        <h3 className="font-semibold text-lg">Asistente Legal IA</h3>
        <p className="text-blue-100 text-sm">Haz preguntas en lenguaje sencillo</p>
      </div>
      <button onClick={() => setShowChat(false)} className="text-white cursor-pointer flex-1 flex justify-right">
        <X size={20} />
      </button>
    </div>

    {/* MESSAGE LIST */}
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50">
      {historial.length > 2 ? (
        historial.slice(2).map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
              msg.role === "user"
                ? "ml-auto bg-blue-100 text-slate-900"
                : "bg-white border border-slate-200"
            }`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))
      ) : (
        <div className="bg-white border max-w-[80%] p-4 rounded-xl shadow">
          <p className="text-slate-700 text-sm">
            ¡Hola! Soy tu asistente legal. Pregúntame cualquier cosa sobre leyes en lenguaje sencillo.  
            Por ejemplo, puedes preguntar sobre cómo iniciar un negocio, tus derechos laborales o cómo denunciar un problema.
          </p>
        </div>
      )}
    </div>

    {/* INPUT AREA */}
    <div className="p-4 border-t bg-white flex items-center gap-3">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Pregunta sobre leyes, derechos o procedimientos..."
        className="flex-1 px-4 py-3 border rounded-full bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={() => {
          if (message.trim() !== "") {
            handleSearch(null, message);
            setMessage("");
          }
        }}
        className="px-5 py-3 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <span className="hidden md:block">Enviar</span>
      </button>
    </div>
  </div>
)}


      {/* MAIN RESULTS */}
      <div className="mx-auto">
        {!hasSearched && (
          <div className="mt-6">
            <p className="text-sm text-slate-600 mb-3">Búsquedas sugeridas:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(sq);
                    handleSearch(sq);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full hover:bg-blue-50"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasSearched && (
          <div className="mt-6">
            
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 mb-8 border border-blue-100">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-slate-900 mb-2">Marco Legal General</h2>
                  <div className='max-h-[200px] overflowy-auto'>
                    <ReactMarkdown>{historial[1].content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-slate-600 mb-4">
              {results.length} {results.length === 1 ? "ley encontrada" : "leyes encontradas"}
            </p>

            <div className="space-y-4">
              {results.map((law) => (
                <LawCard key={law.id} law={law} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
