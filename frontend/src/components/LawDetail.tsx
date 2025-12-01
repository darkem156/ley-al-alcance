import { ArrowLeft, BookOpen, Building2, Link as LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { Link, useNavigate, useParams } from 'react-router';

interface LawDetailProps {
  lawId: string | null;
  onBack: () => void;
}

export default function LawDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [law, setLaw] = useState<any>(null);

  useEffect(() => {
    // Fetch law details from API
    async function fetchLawDetails() {
      const response = await fetch(`http://localhost:8000/api/leyes/ley?pk=${id}`);
      const data = await response.json();
      setLaw(data);
      console.log('Fetched law details:', data);
    }

    fetchLawDetails();
  }, [id]);

  if (!law) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-slate-600">Ley no encontrada</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:text-blue-700">
            Volver a la búsqueda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la búsqueda
      </button>

      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-700" />
          </div>
          <div className="flex-1">
            <h1 className="text-slate-900 mb-3">{law.ley.titulo}</h1>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-sm text-slate-600 mb-1">Resumen en Lenguaje Sencillo</p>
              <div className="text-slate-700 max-h-[250px] overflow-y-auto"><Markdown>{law.ley.resumen}</Markdown></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mb-6">
        <h2 className="text-slate-900 mb-6">Documento original</h2>
        <div className="space-y-6">
          <embed className='w-full min-h-[800px]' src={law.ley.historial.sort((a, b) => new Date(a.fecha_ppo) - new Date(b.fecha_ppo)).reverse()[0].rutaArchivo} type="application/pdf" />
        </div>
      </div>

      <div className="gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-5 h-5 text-slate-600" />
            <h3 className="text-slate-900">Leyes Relacionadas</h3>
          </div>
          <div className="space-y-3 flex flex-col">
            {law.relacionadas.map((relatedLaw: any) => (
              <Link
                to={`/laws/${relatedLaw.id}`}
                key={relatedLaw.id}
                className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {relatedLaw.titulo}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
