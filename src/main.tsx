import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '@fontsource-variable/jetbrains-mono';
import './shared/theme';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
