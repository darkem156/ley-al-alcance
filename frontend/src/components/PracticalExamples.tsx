import { Briefcase, Users, Shield, FileText, ArrowRight } from 'lucide-react';

interface Example {
  id: string;
  title: string;
  description: string;
  icon: any;
  steps: string[];
  relatedLaws: Array<{ id: string; title: string }>;
  keyRights: string[];
}

const examples: Example[] = [
  {
    id: '1',
    title: 'Iniciar una Pequeña Empresa',
    description: 'Guía paso a paso para registrar y operar tu negocio legalmente',
    icon: Briefcase,
    steps: [
      'Desarrolla tu idea de negocio y crea un plan de negocios simple',
      'Reúne los documentos requeridos: identificación válida, comprobante de domicilio',
      'Regístrate en el Ministerio de Comercio (procesamiento de 15 días)',
      'Regístrate en la Autoridad Tributaria para obtener RFC',
      'Abre una cuenta bancaria empresarial',
      'Comprende tus obligaciones fiscales e incentivos potenciales',
    ],
    relatedLaws: [
      { id: '1', title: 'Ley de Registro de Pequeñas Empresas' },
      { id: '3', title: 'Ley de Derechos Laborales y Empleo Justo' },
    ],
    keyRights: [
      'Proceso de registro simplificado para empresas con menos de 50 empleados',
      'Incentivos fiscales durante los primeros 2 años de operación',
      'Plazo claro de 15 días para aprobación del registro',
    ],
  },
  {
    id: '2',
    title: 'Entender tus Derechos Laborales',
    description: 'Conoce tus derechos y protecciones como empleado',
    icon: Users,
    steps: [
      'Verifica que tu contrato incluya el salario mínimo ($15/hora)',
      'Lleva registro de tus horas de trabajo (máx. 40 horas/semana para pago regular)',
      'Documenta tus derechos de licencia (20 días de vacaciones, 10 días por enfermedad)',
      'Reporta condiciones de trabajo inseguras a tu supervisor',
      'Si se violan tus derechos, presenta una queja en el Departamento de Trabajo',
      'Busca asistencia legal si es necesario (servicios gratuitos disponibles)',
    ],
    relatedLaws: [
      { id: '3', title: 'Ley de Derechos Laborales y Empleo Justo' },
      { id: '1', title: 'Ley de Registro de Pequeñas Empresas' },
    ],
    keyRights: [
      'Salario mínimo de $15 para todos los trabajadores',
      'Pago de horas extras a 1.5x después de 40 horas',
      'Vacaciones pagadas, licencia por enfermedad y licencia parental',
      'Derecho a rechazar trabajo inseguro sin penalización',
    ],
  },
  {
    id: '3',
    title: 'Enfrentar la Violencia Doméstica',
    description: 'Obtén ayuda y protección si estás experimentando abuso',
    icon: Shield,
    steps: [
      'Si estás en peligro inmediato, llama a servicios de emergencia',
      'Contacta la línea de ayuda contra violencia doméstica para apoyo y orientación',
      'Solicita una orden de restricción en tu juzgado local',
      'Documenta los incidentes (fotos, mensajes, registros médicos)',
      'Accede a servicios de asistencia legal gratuita',
      'Conéctate con servicios de asesoramiento y apoyo psicológico',
      'Explora opciones de refugio temporal si es necesario',
    ],
    relatedLaws: [
      { id: '5', title: 'Ley de Protección contra Violencia Doméstica' },
      { id: '2', title: 'Ley de Prevención de Violencia Digital' },
    ],
    keyRights: [
      'Órdenes de restricción inmediatas disponibles',
      'Asistencia legal gratuita y representación',
      'Acceso a refugios de emergencia',
      'Servicios de asesoramiento psicológico',
      'Protección contra represalias',
    ],
  },
  {
    id: '4',
    title: 'Denunciar Violencia Digital',
    description: 'Enfrenta el ciberacoso, acoso y amenazas en línea',
    icon: FileText,
    steps: [
      'Documenta el acoso (capturas de pantalla, URLs, marcas de tiempo)',
      'Reporta a la plataforma inmediatamente (requisito de eliminación en 24 horas)',
      'Bloquea y reporta al agresor en redes sociales',
      'Presenta un reporte en la Agencia de Ciberseguridad',
      'Solicita una orden de restricción si las amenazas continúan',
      'Accede a servicios de apoyo psicológico',
    ],
    relatedLaws: [
      { id: '2', title: 'Ley de Prevención de Violencia Digital' },
      { id: '5', title: 'Ley de Protección contra Violencia Doméstica' },
    ],
    keyRights: [
      'Derecho a eliminación inmediata de contenido',
      'La plataforma debe responder en 24 horas',
      'Órdenes de restricción disponibles para agresores',
      'Acceso a apoyo psicológico gratuito',
      'Sanciones legales para infractores (multa de $1,000-$10,000)',
    ],
  },
];

interface PracticalExamplesProps {
  onViewLaw: (lawId: string) => void;
}

export default function PracticalExamples({ onViewLaw }: PracticalExamplesProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-slate-900 mb-4">Ejemplos Prácticos</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Escenarios de la vida real mostrando cómo se aplican las leyes en situaciones cotidianas
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {examples.map((example) => {
          const Icon = example.icon;
          return (
            <div
              key={example.id}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                  <Icon className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-slate-900 mb-2">{example.title}</h3>
                  <p className="text-slate-600">{example.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-700 mb-3">Guía paso a paso:</p>
                <ol className="space-y-2">
                  {example.steps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-slate-700">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-700 mb-2">Derechos y protecciones clave:</p>
                <ul className="space-y-1">
                  {example.keyRights.map((right, index) => (
                    <li key={index} className="flex gap-2 text-sm text-slate-600">
                      <span className="text-blue-600">•</span>
                      <span>{right}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm text-slate-700 mb-2">Leyes relacionadas:</p>
                <div className="space-y-2">
                  {example.relatedLaws.map((law) => (
                    <button
                      key={law.id}
                      onClick={() => onViewLaw(law.id)}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors text-left group"
                    >
                      <span className="text-sm text-slate-700 group-hover:text-blue-700">
                        {law.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
