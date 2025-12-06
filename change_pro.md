Guide de transfert et déploiement (client)

Objectif: permettre à un client de cloner ce repo, le pousser sur son GitHub et publier directement via GitHub Pages.

1) Ce qu’il faut personnaliser
- Base Vite (chemin du site)
  - Modifie le chemin de base pour la production afin de refléter le nom du dépôt du client.
  - Fichier: `vite.config.ts:13`
    - Remplacer `"/PatriPro/"` par `"/NOM_DU_REPO/"`.
    - Exemple: si l’URL finale doit être `https://NOM_DU_COMPTE.github.io/NOM_DU_REPO/`, mets `"/NOM_DU_REPO/"`.
  - Modifier 404.html : 
  ```bash 
  <!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PatriPRO - Gestion de Patrimoine</title>
    <script>
      var pathName = location.pathname;
      sessionStorage.setItem('redirect', location.href);
      var basePath = pathName.split('/').slice(0, -1).join('/') + '/';
      if (!pathName.endsWith('/') && !pathName.endsWith('index.html')) {
        location.replace(basePath + 'index.html');
      }
    </script>
  </head>
  <body>
    <p>Redirection en cours...</p>
  </body>
</html>
```
  - Modifier le useEffect de App.tsx, avant le return: 
  ```
  useEffect(() => {
    // Handle SPA redirect from 404.html for GitHub Pages
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      try {
        const redirectUrl = new URL(redirect);
        let path = redirectUrl.pathname;
        
        // Remove the base path (/PatriPro/) to get the actual route
        const basePath = import.meta.env.BASE_URL; // This will be '/PatriPro/' in production
        if (path.startsWith(basePath)) {
          path = '/' + path.substring(basePath.length);
        }
        
        // Clean up the path
        path = '/' + path.split('/').filter(p => p && p !== 'index.html').join('/');
        if (path === '/') {
          path = '/';
        }
        
        if (path !== window.location.pathname) {
          window.history.replaceState(null, '', path);
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
      }
    }
  }, []);
  ```

2) Paramétrage GitHub Pages du client
- Dans le dépôt du client: Settings → Pages
  - Build and deployment → Source = "GitHub Actions".
