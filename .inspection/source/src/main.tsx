import { createRoot } from 'react-dom/client';
import App from './App';
import { loadImagesEagerly } from './lib/eager-images';
import { PageErrorBoundary } from './lib/page-error';
import './index.css';
// After index.css, so the default look wins over Tailwind's reset.
import './base.css';

// The first screen first, then every other picture in the background, before anyone scrolls (src/lib/eager-images.ts).
loadImagesEagerly();

// Published build only: the preview shows errors through the platform instead.
const app = import.meta.env.DEV ? (
  <App />
) : (
  <PageErrorBoundary>
    <App />
  </PageErrorBoundary>
);

// No StrictMode: it runs the page's start-up code twice in the preview only, so the preview
// would behave unlike the live site.
createRoot(document.getElementById('root')!).render(app);
