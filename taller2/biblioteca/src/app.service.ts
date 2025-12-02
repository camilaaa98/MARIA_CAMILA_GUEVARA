import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <html>
        <head>
          <title>Biblioteca SENA</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            header {
              background-color: #39A900;
              color: white;
              padding: 1rem;
              text-align: center;
            }
            main {
              max-width: 1200px;
              margin: 0 auto;
              padding: 2rem;
            }
            .section {
              background-color: white;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              padding: 1.5rem;
              margin-bottom: 2rem;
            }
            h2 {
              color: #39A900;
              border-bottom: 2px solid #39A900;
              padding-bottom: 0.5rem;
            }
            ul {
              list-style-type: none;
              padding: 0;
            }
            li {
              padding: 0.5rem 0;
              border-bottom: 1px solid #eee;
            }
            .api-link {
              display: block;
              margin-top: 0.5rem;
              color: #0066cc;
              text-decoration: none;
            }
            .api-link:hover {
              text-decoration: underline;
            }
            footer {
              background-color: #333;
              color: white;
              text-align: center;
              padding: 1rem;
              margin-top: 2rem;
            }
          </style>
        </head>
        <body>
          <header>
            <h1>Biblioteca SENA</h1>
            <p>Sistema de Gestión de Biblioteca para el SENA</p>
          </header>
          <main>
            <div class="section">
              <h2>Bienvenido al Sistema de Biblioteca</h2>
              <p>Esta aplicación permite gestionar los recursos bibliográficos del SENA, facilitando el acceso a lecturas, información de usuarios, categorías y más.</p>
            </div>
            
            <div class="section">
              <h2>Recursos Disponibles</h2>
              <ul>
                <li>
                  <strong>Lecturas</strong>
                  <a href="/lecturas" class="api-link">Ver todas las lecturas</a>
                </li>
                <li>
                  <strong>Usuarios</strong>
                  <a href="/usuarios" class="api-link">Ver todos los usuarios</a>
                </li>
                <li>
                  <strong>Categorías</strong>
                  <a href="/categorias" class="api-link">Ver todas las categorías</a>
                </li>
                <li>
                  <strong>Formaciones</strong>
                  <a href="/formaciones" class="api-link">Ver todas las formaciones</a>
                </li>
                <li>
                  <strong>Fichas</strong>
                  <a href="/fichas" class="api-link">Ver todas las fichas</a>
                </li>
                <li>
                  <strong>Roles</strong>
                  <a href="/roles" class="api-link">Ver todos los roles</a>
                </li>
              </ul>
            </div>
          </main>
          <footer>
            <p>&copy; 2023 Biblioteca SENA - Todos los derechos reservados</p>
          </footer>
        </body>
      </html>
    `;
  }
}
