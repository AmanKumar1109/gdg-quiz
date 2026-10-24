import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import { AppRoutes } from './routes/AppRoutes';
import { ScrollToTop } from './components/common/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <QuizProvider>
        <AppRoutes />
      </QuizProvider>
    </BrowserRouter>
  );
}

export default App;
