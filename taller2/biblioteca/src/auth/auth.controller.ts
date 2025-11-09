import { Body, Controller, Post, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('register')
  getRegisterPage(@Res() res: Response) {
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registro - Biblioteca SENA</title>
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
                display: flex;
                align-items: center;
                justify-content: center;
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
            
            .container {
                background: #f8f9fa;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                max-width: 500px;
                width: 90%;
                border: 2px solid #8BC34A;
            }
            
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .logo h1 {
                color: #333;
                font-size: 2em;
                margin-bottom: 10px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            label {
                display: block;
                margin-bottom: 5px;
                color: #333;
                font-weight: bold;
            }
            
            input, select {
                width: 100%;
                padding: 12px;
                border: 2px solid #e9ecef;
                border-radius: 10px;
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            
            input:focus, select:focus {
                outline: none;
                border-color: #8BC34A;
            }
            
            .btn {
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
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
            
            .back-link {
                text-align: center;
                margin-top: 20px;
            }
            
            .back-link a {
                color: #8BC34A;
                text-decoration: none;
            }
            
            .ficha-group {
                display: none;
            }
            
            .ficha-group.show {
                display: block;
            }
        </style>
    </head>
    <body>
        <div class="sena-logo">
            <img src="/images/logo.png" alt="Logo SENA">
        </div>
        <div class="container">
            <div class="logo">
                <img src="/images/registro.jpg" alt="Registro" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px;">
                <h1>Registro</h1>
                <p>Biblioteca SENA</p>
            </div>
            
            <form id="registerForm">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" name="nombre" required>
                </div>
                
                <div class="form-group">
                    <label for="apellido">Apellido:</label>
                    <input type="text" id="apellido" name="apellido" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <div class="form-group">
                    <label for="rolId">Rol:</label>
                    <select id="rolId" name="rolId" required>
                        <option value="">Seleccionar rol</option>
                        <option value="1">Administrador</option>
                        <option value="2">Aprendiz</option>
                        <option value="3">Administrativo</option>
                        <option value="4">Personal Externo</option>
                    </select>
                </div>
                
                <div class="form-group ficha-group" id="fichaGroup">
                    <label for="fichaId">Ficha:</label>
                    <input type="number" id="fichaId" name="fichaId">
                </div>
                
                <button type="submit" class="btn">Registrarse</button>
            </form>
            
            <div class="back-link">
                <a href="/">← Volver al inicio</a>
            </div>
        </div>
        
        <script>
            // Mostrar campo de ficha solo para aprendices
            document.getElementById('rolId').addEventListener('change', function() {
                const fichaGroup = document.getElementById('fichaGroup');
                const fichaInput = document.getElementById('fichaId');
                
                if (this.value === '2') { // Aprendiz
                    fichaGroup.classList.add('show');
                    fichaInput.required = true;
                } else {
                    fichaGroup.classList.remove('show');
                    fichaInput.required = false;
                    fichaInput.value = '';
                }
            });
            
            document.getElementById('registerForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                
                try {
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        alert('Usuario registrado exitosamente');
                        window.location.href = '/';
                    } else {
                        alert('Error: ' + result.message);
                    }
                } catch (error) {
                    alert('Error al registrar usuario');
                }
            });
        </script>
    </body>
    </html>
    `;
    res.header('Content-Type', 'text/html').send(html);
  }

  @Get('login')
  getLoginPage(@Res() res: Response) {
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Iniciar Sesión - Biblioteca SENA</title>
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
                display: flex;
                align-items: center;
                justify-content: center;
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
            
            .container {
                background: #f8f9fa;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                max-width: 400px;
                width: 90%;
                border: 2px solid #8BC34A;
            }
            
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .logo h1 {
                color: #333;
                font-size: 2em;
                margin-bottom: 10px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            label {
                display: block;
                margin-bottom: 5px;
                color: #333;
                font-weight: bold;
            }
            
            input {
                width: 100%;
                padding: 12px;
                border: 2px solid #e9ecef;
                border-radius: 10px;
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            
            input:focus {
                outline: none;
                border-color: #8BC34A;
            }
            
            .btn {
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
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
            
            .back-link {
                text-align: center;
                margin-top: 20px;
            }
            
            .back-link a {
                color: #8BC34A;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="sena-logo">
            <img src="/images/logo.png" alt="Logo SENA">
        </div>
        <div class="container">
            <div class="logo">
                <img src="/images/sesion.jpg" alt="Iniciar Sesión" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px;">
                <h1>Iniciar Sesión</h1>
                <p>Biblioteca SENA</p>
            </div>
            
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <button type="submit" class="btn">Iniciar Sesión</button>
            </form>
            
            <div class="back-link">
                <a href="/">← Volver al inicio</a>
            </div>
        </div>
        
        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        alert('Inicio de sesión exitoso');
                        window.location.href = '/';
                    } else {
                        alert('Error: ' + result.message);
                    }
                } catch (error) {
                    alert('Error al iniciar sesión');
                }
            });
        </script>
    </body>
    </html>
    `;
    
    res.header('Content-Type', 'text/html').send(html);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'El correo electrónico ya está registrado' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}