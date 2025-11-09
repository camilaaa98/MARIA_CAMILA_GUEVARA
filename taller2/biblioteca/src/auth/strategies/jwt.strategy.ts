import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secreto-biblioteca-sena', // En producción, usar variables de entorno
    });
  }

  async validate(payload: any) {
    const usuario = this.usuariosService.findOne(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return usuario;
  }
}