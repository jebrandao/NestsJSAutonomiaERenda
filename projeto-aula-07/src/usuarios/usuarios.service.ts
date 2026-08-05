import { Injectable, NotFoundException } from '@nestjs/common';
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
  // Aula 27: e-mail duplicado (E11000) e violação de Schema (ValidationError)
  // não são mais capturados aqui — o MongoExceptionFilter global os traduz.
  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuarioModel.create(createUsuarioDto);
    return this.findOne(String(usuario._id));
  }

  // select('-senha') garante que o hash nunca vaze pela API — a verificação
  // do hash é feita direto no MongoDB Atlas/Compass, como pede a atividade.
  async findAll() {
    return this.usuarioModel.find().select('-senha').exec();
  }

  // Aula 27: um :id em formato inválido dispara CastError, capturado pelo
  // MongoExceptionFilter global — não precisa mais de try/catch aqui.
  async findOne(id: string) {
    const usuario = await this.usuarioModel.findById(id).select('-senha');

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return usuario;
  }

  // Usa findById + .save() em vez de findByIdAndUpdate: este último ignora
  // os middlewares de documento do Mongoose (incluindo o pre('save')), então
  // uma senha nova nunca seria criptografada. Com .save(), o hook roda
  // sempre, e o isModified('senha') decide se recriptografa ou não.
  // Aula 27: CastError, E11000 e ValidationError deixaram de ter catch local
  // pelo mesmo motivo do create().
  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioModel.findById(id);

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    Object.assign(usuario, updateUsuarioDto);
    await usuario.save();

    return this.findOne(id);
  }
}
