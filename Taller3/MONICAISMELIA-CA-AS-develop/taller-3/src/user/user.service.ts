import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Crear un nuevo usuario
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el correo ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(`El correo ${createUserDto.email} ya está registrado.`);
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  // Listar todos los usuarios
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // Buscar un usuario por ID
  async findOne(Id_users: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ Id_users});
    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID ${Id_users}`);
    }
    return user;
  }

  // Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Verificar que exista
    await this.userRepository.update(id, updateUserDto);
    return { ...user, ...updateUserDto }; // Retorna los datos actualizados
  }

  // Eliminar usuario
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`No se encontró el usuario con ID ${id}`);
    }
  }

  // Buscar usuario por email (para autenticación)
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }
}
