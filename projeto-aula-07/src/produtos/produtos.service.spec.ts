import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProdutosService } from './produtos.service';

describe('ProdutosService', () => {
  let service: ProdutosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProdutosService],
    }).compile();

    service = module.get<ProdutosService>(ProdutosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create deve adicionar um novo produto com ID gerado', () => {
    const novo = service.create({ nome: 'Monitor', preco: 900 });
    expect(novo).toEqual({ id: 4, nome: 'Monitor', preco: 900 });
    expect(service.findOne('4')).toEqual(novo);
  });

  it('findOne deve retornar o produto correspondente ao ID', () => {
    expect(service.findOne('1')).toEqual({ id: 1, nome: 'Notebook', preco: 3500 });
  });

  it('findOne deve lançar BadRequestException com a mensagem exata para ID não numérico', () => {
    expect(() => service.findOne('abc')).toThrow(
      new BadRequestException('O ID fornecido deve ser do tipo inteiro'),
    );
  });

  it('findOne deve lançar NotFoundException para ID numérico inexistente', () => {
    expect(() => service.findOne('999')).toThrow(
      new NotFoundException('Produto com ID 999 não encontrado'),
    );
  });
});
