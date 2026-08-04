import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { Categoria } from './schemas/categoria.schema';

@Injectable()
export class CategoriasService {
  constructor(@InjectModel(Categoria.name) private readonly categoriaModel: Model<Categoria>) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    return this.categoriaModel.create(createCategoriaDto);
  }

  async findAll() {
    return this.categoriaModel.find().exec();
  }
}
