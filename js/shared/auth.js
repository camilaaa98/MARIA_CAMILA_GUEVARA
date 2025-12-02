// Sistema de autenticación SIMPLIFICADO para AsistNet
class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.loadUserFromStorage();
  }

  loadUserFromStorage() {
    const savedUser = localStorage.getItem('asistnet_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password) {
    return password.length >= 6;
  }

  showValidation(inputElement, isValid) {
    const validationIcon = inputElement.parentElement.querySelector('.validation-icon');

    if (isValid === null) {
      inputElement.classList.remove('valid', 'invalid');
      validationIcon.classList.remove('show', 'valid', 'invalid');
      return;
    }

    inputElement.classList.remove('valid', 'invalid');
    validationIcon.classList.remove('valid', 'invalid');

    if (isValid) {
      inputElement.classList.add('valid');
      validationIcon.classList.add('show', 'valid');
    } else {
      inputElement.classList.add('invalid');
      validationIcon.classList.add('show', 'invalid');
    }
  }

  showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.classList.add('animate-slide-in');
  }

  hideError() {
    const errorElement = document.getElementById('error-message');
    errorElement.style.display = 'none';
  }

  // LOGIN CON BASE DE DATOS REAL
  async login(email, password) {
    try {
      const response = await fetch('api/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password: password })
      });

      const result = await response.json();

      if (response.ok && result.data) {
        // Guardar usuario en localStorage
        this.currentUser = {
          id: result.data.id_usuario,
          email: result.data.correo,
          name: `${result.data.nombre} ${result.data.apellido}`,
          role: result.data.rol === 'administrador' ? 'admin' : 'instructor'
        };

        // Si es instructor, agregar id_instructor
        if (result.data.id_instructor) {
          this.currentUser.id_instructor = result.data.id_instructor;
        }

        localStorage.setItem('asistnet_user', JSON.stringify(this.currentUser));
        return this.currentUser;
      } else {
        throw new Error(result.message || 'Credenciales inválidas');
      }
    } catch (error) {
      throw new Error(error.message || 'Error al conectar con el servidor');
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('asistnet_user');
    window.location.href = 'index.html';
  }

  redirectToDashboard() {
    if (this.currentUser) {
      if (this.currentUser.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else if (this.currentUser.role === 'instructor') {
        window.location.href = 'instructor-dashboard.html';
      }
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}

// Instancia global del sistema de autenticación
const authSystem = new AuthSystem();
