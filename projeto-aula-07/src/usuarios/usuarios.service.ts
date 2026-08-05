import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './schemas/usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

  // Aula 26: Atividade Prática - "O Guardião de Acessos".
  // .create() aciona o pre('save') do Schema, que troca a senha em texto
  // puro pelo hash bcrypt antes de gravar no MongoDB.
  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const usuario = await this.usuarioModel.create(createUsuarioDto);
      return this.findOne(String(usuario._id));
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException(
          'Já existe um usuário cadastrado com este e-mail',
        );
      }
      if ((error as Error).name === 'ValidationError') {
        const mensagens = Object.values(
          (error as unknown as { errors: Record<string, { message: string }> })
            .errors,
        ).map((e) => e.message);
        throw new BadRequestException(mensagens.join(', '));
      }
      throw error;
    }
  }

  // select('-senha') garante que o hash nunca vaze pela API — a verificação
  // do hash é feita direto no MongoDB Atlas/Compass, como pede a atividade.
  async findAll() {
    return this.usuarioModel.find().select('-senha').exec();
  }

  async findOne(id: string) {
    let usuario: Usuario | null;
    try {
      usuario = await this.usuarioModel.findById(id).select('-senha');
    } catch (error) {
      if ((error as Error).name === 'CastError') {
        throw new BadRequestException(
          'O ID fornecido não é um ObjectId válido',
        );
      }
      throw error;
    }

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return usuario;
  }

  // Usa findById + .save() em vez de findByIdAndUpdate: este último ignora
  // os middlewares de documento do Mongoose (incluindo o pre('save')), então
  // uma senha nova nunca seria criptografada. Com .save(), o hook roda
  // sempre, e o isModified('senha') decide se recriptografa ou não.
  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    let usuario: (Usuario & { save: () => Promise<Usuario> }) | null;
    try {
      usuario = await this.usuarioModel.findById(id);
    } catch (error) {
      if ((error as Error).name === 'CastError') {
        throw new BadRequestException(
          'O ID fornecido não é um ObjectId válido',
        );
      }
      throw error;
    }

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    Object.assign(usuario, updateUsuarioDto);

    try {
      await usuario.save();
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException(
          'Já existe um usuário cadastrado com este e-mail',
        );
      }
      if ((error as Error).name === 'ValidationError') {
        const mensagens = Object.values(
          (error as unknown as { errors: Record<string, { message: string }> })
            .errors,
        ).map((e) => e.message);
        throw new BadRequestException(mensagens.join(', '));
      }
      throw error;
    }

    return this.findOne(id);
  }
}
