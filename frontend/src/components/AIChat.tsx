import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: string[];
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente legal. Pregúntame cualquier cosa sobre leyes en lenguaje sencillo.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // =============================
  //     ENVÍO REAL AL BACKEND
  // =============================
  const sendToBackend = async (userText: string) => {
    const apiUrl = "http://localhost:8000/api/leyes/semantic/";

    const payload = {
      q: userText,
      h: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  };

  // =============================
  //           ENVIAR MSG
  // =============================
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const data = await sendToBackend(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "No pude generar una respuesta.",
        references: data.references || [],
      };

      // Si tu backend devuelve historial completo:
      if (data.historial_mensajes) {
        const backendMessages: Message[] = data.historial_mensajes.map(
          (m: any, i: number) => ({
            id: `${Date.now()}-${i}`,
            role: m.role,
            content: m.content,
          })
        );
        setMessages([...backendMessages]);
      } else {
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: "Ocurrió un error al procesar tu solicitud.",
        },
      ]);
    }

    setIsTyping(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        <div className="bg-blue-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-white">Asistente Legal IA</h2>
              <p className="text-sm text-blue-100">
                Haz preguntas en lenguaje sencillo
              </p>
            </div>
          </div>
        </div>

        {/* HISTORIAL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>

                {message.references?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-300">
                    <p className="text-sm opacity-60 mb-2">Referencias:</p>
                    {message.references.map((ref, i) => (
                      <p key={i} className="text-sm text-blue-700">
                        • {ref}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-700" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-slate-100 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pregunta sobre leyes, derechos o procedimientos..."
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:bg-slate-300 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
