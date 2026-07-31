import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';

describe('ProdutosController', () => {
  let controller: ProdutosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutosController],
      providers: [ProdutosService],
    }).compile();

    controller = module.get<ProdutosController>(ProdutosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('criar deve adicionar um novo produto', () => {
    expect(controller.criar({ nome: 'Monitor', preco: 900 })).toEqual({
      id: 4,
      nome: 'Monitor',
      preco: 900,
    });
  });

  it('buscarPorId deve retornar o produto 1', () => {
    expect(controller.buscarPorId('1')).toEqual({ id: 1, nome: 'Notebook', preco: 3500 });
  });

  it('buscarPorId deve lançar BadRequestException para ID não numérico', () => {
    expect(() => controller.buscarPorId('abc')).toThrow(BadRequestException);
  });

  it('buscarPorId deve lançar NotFoundException para ID inexistente', () => {
    expect(() => controller.buscarPorId('999')).toThrow(NotFoundException);
  });
});
