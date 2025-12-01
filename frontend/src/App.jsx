import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from "react-router";
import Header from './shared/components/Header';

const SearchPage = lazy(() => import('./components/SearchPage'))
const LawDetail = lazy(() => import('./components/LawDetail'))
const ChatPage = lazy(() => import('./components/AIChat'))
const PracticalExamples = lazy(() => import('./components/PracticalExamples'))

function App() {
  return (
      <BrowserRouter>
        <Header />
        <main>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<SearchPage />} />
              <Route path="/laws/:id" element={<LawDetail />} />
              <Route path="/examples" element={<PracticalExamples />} />
            </Routes>
          </Suspense>
        </main>
      </BrowserRouter>
  )
}

export default App