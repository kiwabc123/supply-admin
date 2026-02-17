import React, { useEffect } from 'react';

export default function DocsPage() {
  useEffect(() => {
    // Initialize Swagger UI
    const initSwagger = setTimeout(() => {
      if ((window as any).SwaggerUIBundle) {
        (window as any).ui = (window as any).SwaggerUIBundle({
          url: '/api/docs/spec',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            (window as any).SwaggerUIBundle.presets.apis,
          ],
          plugins: [
            (window as any).SwaggerUIBundle.plugins.DownloadUrl,
          ],
        });
      }
    }, 500);

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://unpkg.com/swagger-ui-dist@3/swagger-ui.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js';
    script.async = true;
    document.head.appendChild(script);

    return () => clearTimeout(initSwagger);
  }, []);

  return (
    <div>
      <div id="swagger-ui" />
    </div>
  );
}
