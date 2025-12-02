import { Controller, Get, Res, Param } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHomePage(@Res() res: Response): void {
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Biblioteca SENA</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: white;
                min-height: 100vh;
                position: relative;
            }
            
            .sena-logo {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 80px;
                height: 80px;
                z-index: 1000;
            }
            
            .sena-logo img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            
            .main-container {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                background: #f8f9fa;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                max-width: 1200px;
                width: 90%;
                text-align: center;
                border: 2px solid #8BC34A;
            }
            
            .logo {
                width: 120px;
                height: 120px;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .logo img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            
            h1 {
                color: #333;
                margin-bottom: 20px;
                font-size: 2.5em;
            }
            
            .subtitle {
                color: #666;
                margin-bottom: 40px;
                font-size: 1.2em;
            }
            
            .auth-buttons {
                display: flex;
                gap: 20px;
                justify-content: center;
                margin-bottom: 40px;
                flex-wrap: wrap;
            }
            
            .btn {
                padding: 10px 18px;
                border: none;
                border-radius: 22px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-block;
                min-width: 110px;
                line-height: 1.2;
            }
            
            .btn-primary {
                background: linear-gradient(45deg, #2e7d32, #4caf50);
                color: white;
                border: 1px solid #8BC34A;
            }
            
            .btn-secondary {
                background: linear-gradient(45deg, #388e3c, #66bb6a);
                color: white;
                border: 1px solid #8BC34A;
            }
            
            .btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 12px rgba(0,0,0,0.18);
            }
            
            .api-section {
                background: #f8f9fa;
                border-radius: 15px;
                padding: 30px;
                margin-top: 30px;
            }
            
            .api-links {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            
            .api-link {
                background: white;
                padding: 20px;
                border-radius: 10px;
                text-decoration: none;
                color: #333;
                border: 2px solid #e9ecef;
                transition: all 0.3s ease;
                display: block;
            }
            
            .api-link:hover {
                border-color: #8BC34A;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .api-link.restricted {
                background: #f8f9fa;
                border-color: #dc3545;
                cursor: not-allowed;
            }
            
            .api-link.restricted:hover {
                transform: none;
                border-color: #dc3545;
            }
            
            .api-link h3 {
                margin-bottom: 10px;
                color: #667eea;
            }
            
            .api-link p {
                color: #666;
                font-size: 14px;
            }
            
            .lecturas-preview {
                margin-top: 30px;
                text-align: left;
            }
            
            .lectura-card {
                background: white;
                border-radius: 15px;
                padding: 20px;
                margin: 15px 0;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 20px;
                border-left: 5px solid #e9ecef;
                transition: all 0.3s ease;
            }
            
            .lectura-card.disponible {
                border-left-color: #8BC34A;
                background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%);
            }
            
            .lectura-card.no-disponible {
                border-left-color: #dc3545;
                background: linear-gradient(135deg, #fff8f8 0%, #f5e8e8 100%);
            }
            
            .lectura-image {
                width: 80px;
                height: 100px;
                background: linear-gradient(45deg, #8BC34A, #4caf50);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
                box-shadow: 0 3px 10px rgba(139, 195, 74, 0.3);
            }
            
            .lectura-card.no-disponible .lectura-image {
                background: linear-gradient(45deg, #dc3545, #c82333);
                box-shadow: 0 3px 10px rgba(220, 53, 69, 0.3);
            }
            
            .lectura-info h4 {
                color: #333;
                margin-bottom: 5px;
            }
            
            .lectura-info p {
                color: #666;
                font-size: 14px;
            }
            
            .status {
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
            }
            
            .disponible {
                background: #d4edda;
                color: #155724;
            }
            
            .no-disponible {
                background: #f8d7da;
                color: #721c24;
            }
            
            /* Modal Styles */
            .modal {
                display: none;
                position: fixed;
                z-index: 2000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                background-color: white;
                margin: 6% auto;
                padding: 28px 32px;
                border-radius: 20px;
                width: 90%;
                max-width: 520px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                position: relative;
                overflow: visible; /* evita recortes de desplegables dentro del modal */
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                position: absolute;
                right: 20px;
                top: 15px;
            }
            
            .close:hover {
                color: #333;
            }
            
            .modal-image {
                text-align: center;
                margin-bottom: 16px;
            }
            
            .modal-image img {
                border-radius: 15px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                transition: transform 0.3s ease;
            }
            
            .modal-image img:hover {
                transform: scale(1.05);
            }
            
            .form-group {
                margin-bottom: 18px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #333;
                font-weight: bold;
            }
            
            .form-group input, .form-group select {
                width: 100%;
                padding: 12px;
                border: 2px solid #e9ecef;
                border-radius: 10px;
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            
            .form-group input:focus, .form-group select:focus {
                outline: none;
                border-color: #8BC34A;
                box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.1);
            }
            
            .form-submit {
                width: 100%;
                padding: 15px;
                background: linear-gradient(45deg, #2e7d32, #4caf50);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            /* Ajustes específicos del modal de Registro */
            #registerModal .modal-image { margin-bottom: 12px; }
            #registerModal h2 { margin-top: 6px; margin-bottom: 14px; }
            #registerModal .form-group { margin-bottom: 16px; }
            #registerModal label[for="registerRol"] { margin-bottom: 4px; }
            /* Menos margen arriba y scroll interno para evitar cortes abajo */
            #registerModal .modal-content { margin-top: 2%; max-height: 86vh; overflow-y: auto; padding-top: 24px; padding-bottom: 24px; }
            #registerModal #aprendizFields .form-group { margin-bottom: 12px; }
            #registerModal #fichasOpciones { margin-top: 6px; }
            #registerModal #registroResumen { margin-top: 6px; line-height: 1.35; }
            #registerModal .form-submit { margin-top: 8px; }
            
            .form-submit:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
            
            .form-submit:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
            }
            
            .alert {
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-weight: bold;
            }
            
            .alert-success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .alert-error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .modal h2 {
                color: #333;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .auth-status {
                position: fixed;
                top: 20px;
                left: 20px;
                background: white;
                padding: 16px 18px;
                border-radius: 12px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                border: 2px solid #8BC34A;
                display: none;
                z-index: 1001;
                display: none;
            }
            .auth-status.logged-in {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .auth-status #userInfo {
                font-size: 14px;
                color: #333;
                margin-right: 4px;
            }
            
            .auth-status.logged-in {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .logout-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                margin-left: 10px;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="sena-logo">
            <img src="/images/logo.png" alt="Logo SENA">
        </div>
        <div class="main-container">
            <div class="container">
            <div class="logo">
                <img src="/images/libro.png" alt="Biblioteca SENA">
            </div>
            <h1>Biblioteca SENA</h1>
            <p class="subtitle">Sistema de Gestión de Lecturas</p>
            
            <div class="auth-buttons">
                <button onclick="openModal('registerModal')" class="btn btn-primary">Registrarse</button>
                <button onclick="openModal('loginModal')" class="btn btn-secondary">Iniciar Sesión</button>
            </div>
            
            <div class="api-section">
                <h2>📖 Lecturas Disponibles</h2>
                <div id="lecturas-container">
                    <p>Cargando lecturas...</p>
                </div>
            </div>
            
            <div class="api-section" id="resourcesSection">
                <h2>📋 Recursos</h2>
                <div class="api-links">
                    <a href="#" class="api-link" onclick="showPage('lecturas'); return false;">
                        <h3>📚 Lecturas</h3>
                        <p>Consultar lecturas disponibles</p>
                    </a>
                    <a href="#" class="api-link" onclick="showPage('categorias'); return false;">
                        <h3>📂 Categorías</h3>
                        <p>Consultar categorías de libros</p>
                    </a>
                    <a href="#" class="api-link" onclick="showPage('formaciones'); return false;">
                        <h3>🎓 Formaciones</h3>
                        <p>Consultar formaciones SENA</p>
                    </a>
                    <a href="#" class="api-link" onclick="showPage('usuarios'); return false;">
                        <h3>👥 Usuarios</h3>
                        <p style="color: #dc3545; font-weight: bold;">Restringido</p>
                    </a>
                    <div class="api-link restricted">
                        <h3>🎫 Fichas</h3>
                        <p style="color: #dc3545; font-weight: bold;">Restringido</p>
                    </div>
                    <div class="api-link restricted">
                        <h3>🔐 Roles</h3>
                        <p style="color: #dc3545; font-weight: bold;">Restringido</p>
                    </div>
                </div>
            </div>

            <!-- Panel de Administración -->
            <div class="api-section admin-section" id="adminPanel" style="display:none;">
                <h2>🛠️ Panel de Administración</h2>
                <p id="adminInfo">Acciones disponibles para administradores</p>

                <div style="margin-top:20px; text-align:left;">
                    <h3>👥 Usuarios</h3>
                    <button class="btn btn-secondary" onclick="loadUsuariosAdmin()">Refrescar usuarios</button>
                    <div style="overflow-x:auto; margin-top:10px;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th>Nombre</th><th>Email</th><th>Rol</th>
                                    <th>Activo</th><th>Sancionado</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="adminUsersBody">
                                <tr><td colspan="6">Cargando usuarios...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style="margin-top:30px; text-align:left;">
                    <h3>📚 Lecturas</h3>
                    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                        <button class="btn btn-secondary" onclick="loadLecturasAdmin()">Refrescar lecturas</button>
                        <input type="text" id="adminLecturasSearch" placeholder="Buscar por título, autor o año" style="flex:1; min-width:220px; padding:8px 10px; border:1px solid #ccc; border-radius:8px;" oninput="filterAdminLecturas(this.value)">
                    </div>
                    <div style="overflow-x:auto; margin-top:10px;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th>Título</th><th>Autor</th><th>Disponible</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="adminLecturasBody">
                                <tr><td colspan="4">Cargando lecturas...</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <h4 style="margin-top:20px;">➕ Agregar nueva lectura</h4>
                    <form id="adminCreateLecturaForm" onsubmit="return adminCreateLectura(event)">
                        <div class="form-group"><input type="text" id="newLecturaTitulo" placeholder="Título" required></div>
                        <div class="form-group"><input type="text" id="newLecturaAutor" placeholder="Autor" required></div>
                        <div class="form-group"><input type="text" id="newLecturaEditorial" placeholder="Editorial" required></div>
                        <div class="form-group"><input type="date" id="newLecturaFecha" required></div>
                        <div class="form-group"><input type="number" id="newLecturaCategoriaId" placeholder="ID de categoría" required></div>
                        <button type="submit" class="form-submit">Crear lectura</button>
                    </form>
                </div>
            </div>

            <!-- Páginas internas -->
            <div id="page-lecturas" class="api-section" style="display:none; text-align:left;">
                <h2>📚 Lecturas</h2>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">
                    <button class="btn btn-secondary" onclick="loadLecturasPage()">Refrescar</button>
                    <input type="text" id="lecturasSearch" placeholder="Buscar lecturas, autores o año" style="flex:1; min-width:240px; padding:8px 10px; border:1px solid #ccc; border-radius:8px;" oninput="filterLecturasPage(this.value)">
                </div>
                <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th>Título</th><th>Autor</th><th>Categoría</th><th>Año</th><th>Disponible</th>
                            </tr>
                        </thead>
                        <tbody id="lecturasPageBody">
                            <tr><td colspan="5">Cargando lecturas...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="page-categorias" class="api-section" style="display:none; text-align:left;">
                <h2>📂 Categorías</h2>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">
                    <button class="btn btn-secondary" onclick="loadCategoriasPage()">Refrescar</button>
                    <input type="text" id="categoriasSearch" placeholder="Buscar categorías" style="flex:1; min-width:240px; padding:8px 10px; border:1px solid #ccc; border-radius:8px;" oninput="filterCategoriasPage(this.value)">
                    <span id="categoriasTotals" style="font-weight:600; color:#333;"></span>
                </div>
                <div id="categoriasList" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:12px;"></div>
            </div>

            <div id="page-categoria-detalle" class="api-section" style="display:none; text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 id="categoriaDetalleTitulo">Categoría</h2>
                    <button class="btn btn-secondary" onclick="showPage('categorias')">Volver</button>
                </div>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin:10px 0;">
                    <input type="text" id="categoriaDetalleSearch" placeholder="Buscar lecturas en esta categoría" style="flex:1; min-width:240px; padding:8px 10px; border:1px solid #ccc; border-radius:8px;" oninput="filterCategoriaDetalle(this.value)">
                </div>
                <div id="categoriaDetalleList"></div>
            </div>

            <div id="page-formaciones" class="api-section" style="display:none; text-align:left;">
                <h2>🎓 Formaciones</h2>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">
                    <button class="btn btn-secondary" onclick="loadFormacionesPage()">Refrescar</button>
                    <input type="text" id="formacionesSearch" placeholder="Buscar formaciones" style="flex:1; min-width:240px; padding:8px 10px; border:1px solid #ccc; border-radius:8px;" oninput="filterFormacionesPage(this.value)">
                </div>
                <div id="formacionesList" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:12px;"></div>
            </div>

            <div id="page-usuarios" class="api-section" style="display:none; text-align:left;">
                <h2>👥 Usuarios</h2>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">
                    <button class="btn btn-secondary" onclick="loadUsuariosPage()">Refrescar</button>
                    <input type="text" id="usuariosSearch" placeholder="Buscar por nombre o email" style="flex:1; min-width:240px; padding:8px 10px; border:1px solid #ccc; border-radius:8px;" oninput="filterUsuariosPage()">
                    <select id="usuariosRolFilter" style="padding:8px 10px; border:1px solid #ccc; border-radius:8px;" onchange="filterUsuariosPage()">
                        <option value="">Todos los roles</option>
                    </select>
                    <span id="usuariosTotals" style="font-weight:600; color:#333;"></span>
                </div>
                <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th><th>Sancionado</th>
                            </tr>
                        </thead>
                        <tbody id="usuariosPageBody">
                            <tr><td colspan="5">Cargando usuarios...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Auth Status -->
        <div id="authStatus" class="auth-status">
            <span id="userInfo"></span>
            <button onclick="logout()" class="logout-btn">Cerrar Sesión</button>
        </div>
        
        <!-- Login Modal -->
        <div id="loginModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal('loginModal')">&times;</span>
                <div class="modal-image">
                    <img src="/images/sesion.jpg" alt="Iniciar Sesión" style="width: 100%; max-width: 160px; height: auto; border-radius: 10px; margin-bottom: 12px;">
                </div>
                <h2>🔐 Iniciar Sesión</h2>
                <div id="loginAlert"></div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email:</label>
                        <input type="email" id="loginEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Contraseña:</label>
                        <input type="password" id="loginPassword" name="password" required>
                    </div>
                    <button type="submit" class="form-submit">Iniciar Sesión</button>
                </form>
            </div>
        </div>
        
        <!-- Register Modal -->
        <div id="registerModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal('registerModal')">&times;</span>
                <div class="modal-image">
                    <img src="/images/registro.jpg" alt="Registrarse" style="width: 100%; max-width: 160px; height: auto; border-radius: 10px; margin-bottom: 12px;">
                </div>
                <h2>📝 Registrarse</h2>
                <div id="registerAlert"></div>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="registerNombre">Nombre:</label>
                        <input type="text" id="registerNombre" name="nombre" required>
                    </div>
                    <div class="form-group">
                        <label for="registerApellido">Apellido:</label>
                        <input type="text" id="registerApellido" name="apellido" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email:</label>
                        <input type="email" id="registerEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Contraseña:</label>
                        <input type="password" id="registerPassword" name="password" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="registerRol">Rol:</label>
                        <select id="registerRol" name="rolId" required>
                            <option value="">Seleccionar rol...</option>
                        </select>
                    </div>
                    <div id="aprendizFields" style="display:none;">
                        <div class="form-group">
                            <label for="registerFichaSearch">Buscar ficha (número, formación o sede):</label>
                            <input type="text" id="registerFichaSearch" placeholder="Ej: 2995479, ADSO, Florencia">
                        </div>
                        <div class="form-group">
                            <div id="fichasOpciones" style="max-height:180px; overflow:auto; border:1px solid #e9ecef; border-radius:8px; padding:8px; background:#fff;"></div>
                            <input type="hidden" id="registerFichaId" name="fichaId">
                            <small style="display:block; color:#555; margin-top:6px;">Debes seleccionar una ficha existente para poder registrarte.</small>
                        </div>
                        <div class="form-group">
                            <label>Resumen de formación:</label>
                            <div id="registroResumen" style="padding:8px 10px; background:#f8f9fa; border:1px solid #e9ecef; border-radius:8px; color:#333;"></div>
                        </div>
                    </div>
                    <button type="submit" class="form-submit">Registrarse</button>
                </form>
            </div>
        </div>
        
        <script>
            // Variables globales
            let authToken = localStorage.getItem('authToken');
            let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            
            // Inicializar página
            document.addEventListener('DOMContentLoaded', function() {
                updateAuthStatus();
                loadLecturas();
                loadRoles();
                loadFichas();
                setupFormHandlers();
            });
            
            // Actualizar estado de autenticación
            function updateAuthStatus() {
                const authStatus = document.getElementById('authStatus');
                const authButtons = document.querySelector('.auth-buttons');
                const adminPanel = document.getElementById('adminPanel');
                const resourcesSection = document.getElementById('resourcesSection');
                const resourcesTitleEl = document.querySelector('#resourcesSection h2');
                
                if (authToken && currentUser) {
                    authStatus.style.display = 'block';
                    authButtons.style.display = 'none';
                    document.getElementById('userInfo').textContent = 'Bienvenido, ' + currentUser.nombre;

                    // Mantener visible la sección de recursos siempre
                    if (resourcesSection) resourcesSection.style.display = 'block';
                    // Cambiar el título según el rol
                    if (resourcesTitleEl) {
                        resourcesTitleEl.textContent = isAdmin() ? '🛠️ Panel de administrador' : '📋 Recursos';
                    }

                    if (adminPanel) {
                        if (isAdmin()) {
                            adminPanel.style.display = 'block';
                            loadAdminInitial();
                        } else {
                            adminPanel.style.display = 'none';
                        }
                    }
                } else {
                    authStatus.style.display = 'none';
                    authButtons.style.display = 'block';
                    if (adminPanel) adminPanel.style.display = 'none';
                    if (resourcesSection) resourcesSection.style.display = 'block';
                    if (resourcesTitleEl) resourcesTitleEl.textContent = '📋 Recursos';
                }
            }
            
            // Funciones de modal
            function openModal(modalId) {
                document.getElementById(modalId).style.display = 'block';
            }
            
            function closeModal(modalId) {
                document.getElementById(modalId).style.display = 'none';
                clearAlerts();
            }
            
            // Cerrar modal al hacer clic fuera
            window.onclick = function(event) {
                if (event.target.classList.contains('modal')) {
                    event.target.style.display = 'none';
                    clearAlerts();
                }
            }
            
            // Limpiar alertas
            function clearAlerts() {
                document.getElementById('loginAlert').innerHTML = '';
                document.getElementById('registerAlert').innerHTML = '';
            }
            
            // Mostrar alerta
            function showAlert(elementId, message, type = 'error') {
                const alertElement = document.getElementById(elementId);
                alertElement.innerHTML = '<div class="alert alert-' + type + '">' + message + '</div>';
            }
            
            // Configurar manejadores de formularios
            function setupFormHandlers() {
                // Login form
                document.getElementById('loginForm').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const loginData = Object.fromEntries(formData);
                    
                    try {
                        const response = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(loginData)
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                            authToken = result.access_token;
                            currentUser = result.user;
                            localStorage.setItem('authToken', authToken);
                            // Obtener usuario con relaciones para rol/ficha
                            try {
                                const uRes = await fetch('/api/usuarios/' + currentUser.id, {
                                    headers: { 'Authorization': 'Bearer ' + authToken }
                                });
                                if (uRes.ok) {
                                    currentUser = await uRes.json();
                                }
                            } catch (e) { /* noop */ }
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                            
                            showAlert('loginAlert', '¡Login exitoso!', 'success');
                            setTimeout(() => {
                                closeModal('loginModal');
                                updateAuthStatus();
                            }, 800);
                        } else {
                            showAlert('loginAlert', result.message || 'Error en el login');
                        }
                    } catch (error) {
                        showAlert('loginAlert', 'Error de conexión');
                    }
                });
                
                // Register form
                document.getElementById('registerForm').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const registerData = Object.fromEntries(formData);
                    
                    // Convertir rol y validar ficha seleccionada si es aprendiz
                    registerData.rolId = parseInt(registerData.rolId);
                    const rolSelect = document.getElementById('registerRol');
                    const selectedText = (rolSelect.options[rolSelect.selectedIndex]?.text || '').toLowerCase();
                    const esAprendiz = selectedText.includes('aprendiz');
                    if (esAprendiz) {
                        const fichaId = parseInt(document.getElementById('registerFichaId')?.value || '');
                        if (!fichaId) { showAlert('registerAlert','Debes seleccionar una ficha existente'); return; }
                        registerData.fichaId = fichaId;
                    } else {
                        delete registerData.fichaId;
                    }
                    
                    try {
                        const response = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(registerData)
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                            showAlert('registerAlert', '¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
                            setTimeout(() => {
                                closeModal('registerModal');
                                openModal('loginModal');
                            }, 1200);
                        } else {
                            showAlert('registerAlert', result.message || 'Error en el registro');
                        }
                    } catch (error) {
                        showAlert('registerAlert', 'Error de conexión');
                    }
                });
                
                // Eventos dinámicos de registro
                const rolSel = document.getElementById('registerRol');
                if (rolSel) rolSel.addEventListener('change', updateAprendizFieldsVisibility);
                const fichaSearch = document.getElementById('registerFichaSearch');
                if (fichaSearch) fichaSearch.addEventListener('input', function(e){ filtrarFichasOpciones(e.target.value); });
                // Preview debe reaccionar a cambios en nombre/apellido/email
                ['registerNombre','registerApellido','registerEmail'].forEach(function(id){
                    const el = document.getElementById(id);
                    if (el) el.addEventListener('input', updateResumenRegistro);
                });
                // Render inicial con todas las fichas
                renderFichasOpciones(Array.isArray(window.fichasCache) ? window.fichasCache : []);
                // Inicializar visibilidad según rol actual
                updateAprendizFieldsVisibility();
            }
            
            // Cargar roles para el formulario de registro
            async function loadRoles() {
                try {
                    const response = await fetch('/api/roles');
                    const roles = await response.json();
                    const select = document.getElementById('registerRol');
                    if (!select) return;

                    // Solo mostrar roles permitidos y limpiar sufijos con timestamp
                    const permitidos = ['Administrador', 'Aprendiz', 'Instructor', 'Personal Externo'];
                    const limpiarNombre = function(n) {
                        return String(n || '').trim().replace(/\s+\d{8}-\d{6}$/,'');
                    };

                    // Orden fijo: Administrador, Aprendiz, Instructor, Personal Externo
                    permitidos.forEach(function(nombre){
                        const rol = (roles || []).find(function(r){
                            return limpiarNombre(r?.nombre) === nombre;
                        });
                        if (rol) {
                            const option = document.createElement('option');
                            option.value = rol.id;
                            option.textContent = nombre;
                            select.appendChild(option);
                        }
                    });
                } catch (error) {
                    console.error('Error cargando roles:', error);
                }
            }
            
            // Cargar fichas para el formulario de registro
            async function loadFichas() {
                try {
                    const response = await fetch('/api/fichas');
                    const fichas = await response.json();
                    // mapa de sedes por código (visual)
                    window.sedesPorCodigo = {
                        "2995479":"Florencia", "3312843":"San Vicente del Caguán", "3142816":"Florencia", "3172683":"Florencia", "3172757":"Florencia",
                        "3172835":"Florencia", "3142794":"Florencia", "2995476":"Florencia", "3142724":"Florencia", "3140399":"San Vicente del Caguán",
                        "3237080":"Florencia", "3064087":"Florencia", "2995477":"Florencia", "3064079":"Florencia", "3172825":"Florencia", "3237079":"Florencia",
                        "3313178":"El Doncello", "2859636":"San Vicente del Caguán", "3002217":"Florencia"
                    };
                    // cache filtrada: solo fichas con código permitido en el mapeo de sedes
                    const permitidos = new Set(Object.keys(window.sedesPorCodigo));
                    window.fichasCache = (Array.isArray(fichas) ? fichas : []).filter(function(f){
                        return permitidos.has(String(f.codigo));
                    });
                } catch (error) {
                    console.error('Error cargando fichas:', error);
                    window.fichasCache = [];
                    window.sedesPorCodigo = {};
                }
            }
            
            function updateAprendizFieldsVisibility() {
                const rolSelect = document.getElementById('registerRol');
                const aprendizFields = document.getElementById('aprendizFields');
                const selectedText = (rolSelect.options[rolSelect.selectedIndex]?.text || '').toLowerCase();
                const esAprendiz = selectedText.includes('aprendiz');
                if (aprendizFields) aprendizFields.style.display = esAprendiz ? 'block' : 'none';
                // limpiar selección cuando cambia rol
                if (!esAprendiz) {
                    const hidden = document.getElementById('registerFichaId');
                    if (hidden) hidden.value = '';
                    updateResumenRegistro();
                }
            }

            function renderFichasOpciones(lista) {
                const cont = document.getElementById('fichasOpciones');
                if (!cont) return;
                if (!lista || !lista.length) { cont.innerHTML = '<em>Sin coincidencias</em>'; return; }
                cont.innerHTML = lista.slice(0, 40).map(function(f){
                    const sede = window.sedesPorCodigo?.[String(f.codigo)] || '-';
                    const nombre = (f.formacion?.nombre || '').trim();
                    return '<button type="button" class="btn btn-secondary" style="display:block; width:100%; text-align:left; margin:4px 0;" onclick="seleccionarFicha('+f.id+')">'+
                           (nombre || 'Formación')+' - '+f.codigo+' - '+sede+'</button>';
                }).join('');
            }

            function filtrarFichasOpciones(query) {
                const q = (query || '').toLowerCase().trim();
                const base = Array.isArray(window.fichasCache) ? window.fichasCache : [];
                const filtradas = base.filter(function(f){
                    const sede = (window.sedesPorCodigo?.[String(f.codigo)] || '').toLowerCase();
                    const nombre = (f.formacion?.nombre || '').toLowerCase();
                    return String(f.codigo).toLowerCase().includes(q) || nombre.includes(q) || sede.includes(q);
                });
                renderFichasOpciones(q ? filtradas : base);
            }

            function seleccionarFicha(id) {
                const hidden = document.getElementById('registerFichaId');
                if (hidden) hidden.value = id;
                updateResumenRegistro();
            }

            function updateResumenRegistro() {
                const id = document.getElementById('registerFichaId')?.value || '';
                const ficha = (Array.isArray(window.fichasCache) ? window.fichasCache.find(f=> String(f.id)===String(id)) : null);
                const nombre = ficha?.formacion?.nombre || '';
                const codigo = ficha?.codigo || '';
                const sede = window.sedesPorCodigo?.[String(codigo)] || '';
                const resumenEl = document.getElementById('registroResumen');
                if (resumenEl) {
                    const partes = [];
                    if (nombre) partes.push(nombre);
                    if (codigo) partes.push(codigo);
                    if (sede) partes.push(sede);
                    resumenEl.textContent = partes.length ? partes.join(' - ') : '';
                }
            }
            
            // Logout
            function logout() {
                authToken = null;
                currentUser = null;
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                updateAuthStatus();
            }

            // Helpers de administración
            function isAdmin() {
                const nombreRol = (currentUser?.rol?.nombre || '').toLowerCase();
                return nombreRol.includes('admin');
            }
            function authHeaders() {
                return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken };
            }

            async function loadAdminInitial() {
                await Promise.all([loadUsuariosAdmin(), loadLecturasAdmin()]);
            }

            async function loadUsuariosAdmin() {
                const tbody = document.getElementById('adminUsersBody');
                if (!tbody) return;
                tbody.innerHTML = '<tr><td colspan="6">Cargando usuarios...</td></tr>';
                try {
                    const res = await fetch('/api/usuarios', { headers: authHeaders() });
                    const usuarios = await res.json();
                    tbody.innerHTML = (usuarios || []).map(function(u) {
                        return '<tr>' +
                            '<td>' + u.nombre + ' ' + (u.apellido || '') + '</td>' +
                            '<td>' + u.email + '</td>' +
                            '<td>' + (u.rol?.nombre || '-') + '</td>' +
                            '<td>' + (u.activo ? 'Sí' : 'No') + '</td>' +
                            '<td>' + (u.sancionado ? 'Sí' : 'No') + '</td>' +
                            '<td>' +
                                '<button class="btn btn-secondary" onclick="prestarLibro(' + u.id + ')">Prestar</button>' +
                                '<button class="btn btn-secondary" onclick="activarUsuario(' + u.id + ')">Activar</button>' +
                                '<button class="btn btn-secondary" onclick="desactivarUsuario(' + u.id + ')">Desactivar</button>' +
                                '<button class="btn btn-secondary" onclick="sancionarUsuario(' + u.id + ')">Sancionar</button>' +
                                '<button class="btn btn-secondary" onclick="levantarSancion(' + u.id + ')">Quitar sanción</button>' +
                                '<button class="btn btn-primary" onclick="eliminarUsuario(' + u.id + ')">Eliminar</button>' +
                            '</td>' +
                        '</tr>';
                    }).join('');
                } catch (e) {
                    tbody.innerHTML = '<tr><td colspan="6">Error cargando usuarios</td></tr>';
                }
            }

            async function activarUsuario(id) {
                await fetch('/api/usuarios/' + id + '/activar', { method: 'PUT', headers: authHeaders() });
                loadUsuariosAdmin();
            }

            async function desactivarUsuario(id) {
                await fetch('/api/usuarios/' + id + '/desactivar', { method: 'PUT', headers: authHeaders() });
                loadUsuariosAdmin();
            }

            async function sancionarUsuario(id) {
                const motivo = prompt('Motivo de la sanción:');
                if (!motivo) return;
                await fetch('/api/usuarios/' + id + '/sancionar', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ motivo }) });
                loadUsuariosAdmin();
            }

            async function levantarSancion(id) {
                await fetch('/api/usuarios/' + id + '/levantar-sancion', { method: 'PUT', headers: authHeaders() });
                loadUsuariosAdmin();
            }

            async function eliminarUsuario(id) {
                if (!confirm('¿Eliminar usuario?')) return;
                await fetch('/api/usuarios/' + id, { method: 'DELETE', headers: authHeaders() });
                loadUsuariosAdmin();
            }

            async function marcarDisponibleLectura(id) {
                await fetch('/api/lecturas/' + id + '/disponible', { method: 'PUT', headers: authHeaders() });
                loadLecturasAdmin();
            }

            async function marcarNoDisponibleLectura(id) {
                await fetch('/api/lecturas/' + id + '/no-disponible', { method: 'PUT', headers: authHeaders() });
                loadLecturasAdmin();
            }

            async function eliminarLectura(id) {
                if (!confirm('¿Eliminar lectura?')) return;
                await fetch('/api/lecturas/' + id, { method: 'DELETE', headers: authHeaders() });
                loadLecturasAdmin();
            }

            async function prestarLibro(usuarioId) {
                const lecturaIdStr = prompt('ID de lectura a prestar (solo disponibles):');
                const fechaLimite = prompt('Fecha límite (YYYY-MM-DD):');
                if (!lecturaIdStr || !fechaLimite) return;
                const lecturaId = parseInt(lecturaIdStr);
                try {
                    const res = await fetch('/api/prestamos', {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify({ usuarioId, lecturaId, fechaLimite })
                    });
                    if (res.ok) {
                        alert('Préstamo creado');
                        loadUsuariosAdmin();
                        loadLecturasAdmin();
                    } else {
                        const err = await res.json();
                        alert('Error: ' + (err.message || 'No se pudo crear el préstamo'));
                    }
                } catch (e) {
                    alert('Error de conexión al crear préstamo');
                }
            }

            let _adminLecturasCache = [];
            
            function renderAdminLecturas(list) {
                const tbody = document.getElementById('adminLecturasBody');
                if (!tbody) return;
                if (!list || list.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4">Sin resultados</td></tr>';
                    return;
                }
                tbody.innerHTML = list.map(function(l) {
                    const disponibilidadBtn = l.disponible
                        ? '<button class="btn btn-secondary" onclick="marcarNoDisponibleLectura(' + l.id + ')">Marcar no disponible</button>'
                        : '<button class="btn btn-secondary" onclick="marcarDisponibleLectura(' + l.id + ')">Marcar disponible</button>';
                    return '<tr>' +
                        '<td>' + l.titulo + '</td>' +
                        '<td>' + l.autor + '</td>' +
                        '<td>' + (l.disponible ? 'Sí' : 'No') + '</td>' +
                        '<td>' +
                            disponibilidadBtn +
                            '<button class="btn btn-primary" onclick="eliminarLectura(' + l.id + ')">Eliminar</button>' +
                        '</td>' +
                    '</tr>';
                }).join('');
            }
            
            function filterAdminLecturas(query) {
                const q = (query || '').toLowerCase().trim();
                if (!q) { renderAdminLecturas(_adminLecturasCache); return; }
                const filtered = _adminLecturasCache.filter(function(l) {
                    const year = (l.fechaPublicacion || '').toString();
                    return (l.titulo || '').toLowerCase().includes(q)
                        || (l.autor || '').toLowerCase().includes(q)
                        || year.includes(q);
                });
                renderAdminLecturas(filtered);
            }
            
            async function loadLecturasAdmin() {
                const tbody = document.getElementById('adminLecturasBody');
                if (!tbody) return;
                tbody.innerHTML = '<tr><td colspan="4">Cargando lecturas...</td></tr>';
                try {
                    const res = await fetch('/api/lecturas');
                    _adminLecturasCache = await res.json();
                    renderAdminLecturas(_adminLecturasCache);
                } catch (e) {
                    tbody.innerHTML = '<tr><td colspan="4">Error cargando lecturas</td></tr>';
                }
            }

            async function marcarDisponibleLectura(id) {
                await fetch('/api/lecturas/' + id + '/disponible', { method: 'PUT', headers: authHeaders() });
                loadLecturasAdmin();
            }

            async function marcarNoDisponibleLectura(id) {
                await fetch('/api/lecturas/' + id + '/no-disponible', { method: 'PUT', headers: authHeaders() });
                loadLecturasAdmin();
            }

            async function eliminarLectura(id) {
                if (!confirm('¿Eliminar lectura?')) return;
                await fetch('/api/lecturas/' + id, { method: 'DELETE', headers: authHeaders() });
                loadLecturasAdmin();
            }

            async function adminCreateLectura(event) {
                event.preventDefault();
                const payload = {
                    titulo: document.getElementById('newLecturaTitulo').value,
                    autor: document.getElementById('newLecturaAutor').value,
                    editorial: document.getElementById('newLecturaEditorial').value,
                    fechaPublicacion: document.getElementById('newLecturaFecha').value,
                    disponible: true,
                    categoriaId: parseInt(document.getElementById('newLecturaCategoriaId').value)
                };
                try {
                    const res = await fetch('/api/lecturas', { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
                    if (res.ok) {
                        alert('Lectura creada');
                        loadLecturasAdmin();
                        event.target.reset();
                    } else {
                        const err = await res.json();
                        alert('Error: ' + (err.message || 'No se pudo crear lectura'));
                    }
                } catch (e) {
                    alert('Error de conexión al crear lectura');
                }
                return false;
            }
            
            // Cargar lecturas dinámicamente
            function loadLecturas() {
                fetch('/api/lecturas')
                    .then(response => response.json())
                    .then(lecturas => {
                        const container = document.getElementById('lecturas-container');
                        if (lecturas && lecturas.length > 0) {
                            container.innerHTML = lecturas.slice(0, 3).map(function(lectura) {
                                return '<div class="lectura-card">' +
                                    '<h4>' + lectura.titulo + '</h4>' +
                                    '<p>' + (lectura.descripcion || 'Sin descripción') + '</p>' +
                                    '<small>Categoría: ' + (lectura.categoria?.nombre || 'Sin categoría') + '</small>' +
                                '</div>';
                            }).join('');
                        } else {
                            container.innerHTML = '<p>No hay lecturas disponibles</p>';
                        }
                    })
                    .catch(error => {
                        console.error('Error cargando lecturas:', error);
                        document.getElementById('lecturas-container').innerHTML = '<p>Error cargando lecturas</p>';
                    });
            }
        </script>
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.header('Content-Type', 'text/html').send(html);
  }

  @Get('images/:filename')
  getImage(@Param('filename') filename: string, @Res() res: Response): void {
    const imagePath = path.join(__dirname, 'imagenes', filename);
    
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).send('Image not found');
    }
  }
}
