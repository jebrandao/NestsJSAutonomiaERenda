import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
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

  // Aula 29: Atividade Prática - "O Cofre de Identidades" (Verificação Extra).
  // bcrypt.compare() é a única forma correta de validar a senha: ele aplica
  // o mesmo hash à tentativa e compara os hashes — nunca descriptografa o
  // hash salvo, porque isso é matematicamente impossível (hashing é
  // unidirecional).
  // Aula 30: extraído para validarCredenciais(), reaproveitado pelo
  // AuthService.login() — que precisa do usuário (para montar o payload do
  // JWT), não só de um texto de sucesso/falha.
  async validar(email: string, senha: string): Promise<string> {
    const usuario = await this.validarCredenciais(email, senha);
    return usuario ? 'Acesso Permitido' : 'Senha Incorreta';
  }

  // Busca por email sem select('-senha'): aqui, ao contrário de
  // findOne/findAll, o hash é exatamente o que bcrypt.compare() precisa.
  async validarCredenciais(
    email: string,
    senha: string,
  ): Promise<HydratedDocument<Usuario> | null> {
    const usuario = await this.usuarioModel.findOne({ email });

    // Mesmo resultado para "e-mail não existe" e "senha errada" — evita que
    // a API revele quais e-mails estão cadastrados (enumeração de contas).
    if (!usuario) {
      return null;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    return senhaValida ? usuario : null;
  }
}
