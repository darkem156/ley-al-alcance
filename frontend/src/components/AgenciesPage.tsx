import { Building2, Mail, Phone, ExternalLink } from 'lucide-react';

interface Agency {
  id: string;
  name: string;
  description: string;
  role: string;
  relatedLaws: string[];
  contact: {
    email: string;
    phone: string;
    website: string;
  };
}

const agencies: Agency[] = [
  {
    id: '1',
    name: 'Ministerio de Comercio',
    description: 'Supervisa el registro de empresas, licencias y regulación de actividad comercial',
    role: 'Registro y licencias comerciales',
    relatedLaws: ['Ley de Registro de Pequeñas Empresas', 'Ley de Protección al Consumidor'],
    contact: {
      email: 'info@comercio.gob',
      phone: '1-800-COMERCIO',
      website: 'comercio.gob',
    },
  },
  {
    id: '2',
    name: 'Departamento de Trabajo',
    description: 'Protege los derechos de los trabajadores y garantiza prácticas laborales justas',
    role: 'Aplicación de derechos laborales y quejas',
    relatedLaws: ['Ley de Derechos Laborales y Empleo Justo'],
    contact: {
      email: 'trabajadores@trabajo.gob',
      phone: '1-800-TRABAJO',
      website: 'trabajo.gob',
    },
  },
  {
    id: '3',
    name: 'Agencia de Ciberseguridad',
    description: 'Investiga delitos digitales y aplica leyes de seguridad en línea',
    role: 'Investigación y aplicación de violencia digital',
    relatedLaws: ['Ley de Prevención de Violencia Digital'],
    contact: {
      email: 'reporte@ciberseguridad.gob',
      phone: '1-800-CIBERSEG',
      website: 'ciberseguridad.gob',
    },
  },
  {
    id: '4',
    name: 'Ministerio de Justicia',
    description: 'Maneja procedimientos legales y proporciona servicios de apoyo a víctimas',
    role: 'Procedimientos legales y asistencia a víctimas',
    relatedLaws: ['Ley de Prevención de Violencia Digital', 'Ley de Protección contra Violencia Doméstica'],
    contact: {
      email: 'justicia@minjus.gob',
      phone: '1-800-JUSTICIA',
      website: 'justicia.gob',
    },
  },
  {
    id: '5',
    name: 'Autoridad Tributaria',
    description: 'Gestiona la recaudación de impuestos, cumplimiento y registro fiscal de empresas',
    role: 'Registro y cumplimiento fiscal',
    relatedLaws: ['Ley de Registro de Pequeñas Empresas'],
    contact: {
      email: 'contribuyente@sat.gob',
      phone: '1-800-SAT-AYUDA',
      website: 'sat.gob',
    },
  },
  {
    id: '6',
    name: 'Oficina de Seguridad Ocupacional',
    description: 'Garantiza la seguridad laboral e investiga violaciones de seguridad',
    role: 'Inspecciones de seguridad laboral',
    relatedLaws: ['Ley de Derechos Laborales y Empleo Justo'],
    contact: {
      email: 'seguridad@oso.gob',
      phone: '1-800-SEGTRABAJO',
      website: 'oso.gob',
    },
  },
  {
    id: '7',
    name: 'Oficina de Protección al Consumidor',
    description: 'Protege a los consumidores de prácticas desleales y maneja quejas',
    role: 'Resolución de quejas de consumidores',
    relatedLaws: ['Ley de Protección al Consumidor'],
    contact: {
      email: 'quejas@profeco.gob',
      phone: '1-800-CONSUMIDOR',
      website: 'profeco.gob',
    },
  },
  {
    id: '8',
    name: 'Agencia de Servicios Familiares',
    description: 'Proporciona apoyo a víctimas de violencia doméstica y asuntos familiares',
    role: 'Apoyo a víctimas y servicios familiares',
    relatedLaws: ['Ley de Protección contra Violencia Doméstica'],
    contact: {
      email: 'ayuda@serviciosfamiliares.gob',
      phone: '1-800-FAMILIA-AYUDA',
      website: 'serviciosfamiliares.gob',
    },
  },
];

export function AgenciesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-slate-900 mb-4">Organismos Gubernamentales</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Encuentra el organismo adecuado para tus necesidades y aprende cómo contactarlos
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map((agency) => (
          <div
            key={agency.id}
            className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                <Building2 className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-1">{agency.name}</h3>
                <p className="text-sm text-slate-600">{agency.role}</p>
              </div>
            </div>

            <p className="text-slate-700 mb-4">{agency.description}</p>

            <div className="mb-4">
              <p className="text-sm text-slate-700 mb-2">Leyes relacionadas:</p>
              <div className="flex flex-wrap gap-2">
                {agency.relatedLaws.map((law, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {law}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${agency.contact.email}`} className="text-blue-600 hover:text-blue-700">
                  {agency.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{agency.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <a
                  href={`https://${agency.contact.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  {agency.contact.website}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
