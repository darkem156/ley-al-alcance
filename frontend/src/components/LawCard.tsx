import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import ReactMarkdown from "react-markdown";

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
  console.log('Rendering LawCard for law:', law);
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-slate-900 mb-2">{law.titulo}</h3>
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
