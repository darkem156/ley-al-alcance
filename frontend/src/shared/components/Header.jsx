import { Search, MessageCircle, BookOpen, Building2, Lightbulb } from 'lucide-react';
import { Link } from 'react-router';
/*

type Page = 'search' | 'detail' | 'chat' | 'examples' | 'agencies';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}
  */

export default function Header({ onNavigate }) {
  const currentPage = location.pathname;
  const navItems = [
    { id: '/ley-al-alcance/', label: 'Buscar Leyes', icon: Search },
    { id: '/ley-al-alcance/examples', label: 'Ejemplos Practicos', icon: MessageCircle },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('search')}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <a href="/" className="text-slate-900">Ley Al Alcance</a>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = false//currentPage === item.id || (currentPage === 'detail' && item.id === 'search');
              return (
                <Link
                  to={item.id}
                  key={item.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="md:hidden flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || (currentPage === 'detail' && item.id === 'search');
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
