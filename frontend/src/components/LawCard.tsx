import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router';
import ReactMarkdown from "react-markdown";
import { useState } from 'react';

interface Law {
  id: string;
  titulo: string;
  resumen: string;
  tema: string[];
}

interface LawCardProps {
  law: Law;
  onViewDetails: () => void;
}

export function LawCard({ law }: LawCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  console.log('Rendering LawCard for law:', law);
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(law.resumen);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Lo siento, tu navegador no soporta síntesis de voz.');
    }
  };
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-slate-900 flex-1">{law.titulo}</h3>
            <button
              onClick={handleSpeak}
              className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                isSpeaking
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={isSpeaking ? 'Detener lectura' : 'Escuchar resumen'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-slate-600 mb-4 max-h-[150px] overflow-y-auto"><ReactMarkdown>{law.resumen}</ReactMarkdown></div>
          <div className="flex flex-wrap gap-2">
            {law.tema.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {tag.tema}
              </span>
            ))}
          </div>
        </div>
        <Link
          to={`/laws/${law.id}`}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <span>Ver detalles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
