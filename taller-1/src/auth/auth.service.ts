import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        this.logger.log(`Usuario ${email} autenticado exitosamente`);
        return result;
      }
      
      this.logger.warn(`Intento de login fallido para email: ${email}`);
      return null;
    } catch (error) {
      this.logger.error(`Error validando usuario ${email}:`, error);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      email: user.email, 
      sub: user.Id_users,
      role: user.ID_rol,
      firstName: user.firstName,
      lastName: user.lastName
    };

    this.logger.log(`Login exitoso para usuario: ${user.email}`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.Id_users,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.ID_rol
      }
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userService.findByEmail(registerDto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

      // Crear el usuario
      const userData = {
        ...registerDto,
        password: hashedPassword,
      };

      const newUser = await this.userService.create(userData);
      
      // Remover la contraseña de la respuesta
      const { password, ...result } = newUser;
      
      this.logger.log(`Usuario registrado exitosamente: ${registerDto.email}`);
      
      return {
        message: 'Usuario registrado exitosamente',
        user: result
      };
    } catch (error) {
      this.logger.error(`Error registrando usuario ${registerDto.email}:`, error);
      throw error;
    }
  }

  async refreshToken(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.Id_users,
      role: user.ID_rol,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}