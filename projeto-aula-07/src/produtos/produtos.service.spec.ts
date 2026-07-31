import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { Produto } from './schemas/produto.schema';

describe('ProdutosService', () => {
  let service: ProdutosService;
  let produtoModel: { create: jest.Mock };

  beforeEach(async () => {
    produtoModel = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosService,
        { provide: getModelToken(Produto.name), useValue: produtoModel },
      ],
    }).compile();

    service = module.get<ProdutosService>(ProdutosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create deve persistir o produto via Model.create e retornar o documento criado', async () => {
    const dto = { nome: 'Torno CNC X200', preco: 15000, categoria: 'Ferramentas' };
    const documentoCriado = { _id: 'abc123', ...dto };
    produtoModel.create.mockResolvedValue(documentoCriado);

    const resultado = await service.create(dto);

    expect(produtoModel.create).toHaveBeenCalledWith(dto);
    expect(resultado).toEqual(documentoCriado);
  });

  it('create deve lançar ConflictException quando o nome já existe (erro 11000)', async () => {
    const dto = { nome: 'Torno CNC X200', preco: 15000, categoria: 'Ferramentas' };
    produtoModel.create.mockRejectedValue({ code: 11000 });

    await expect(service.create(dto)).rejects.toThrow(
      new ConflictException('Este equipamento já está registrado no sistema'),
    );
  });

  it('create deve lançar BadRequestException para ValidationError do Mongoose', async () => {
    const dto = { nome: 'X', preco: -1, categoria: 'Inválida' };
    produtoModel.create.mockRejectedValue({
      name: 'ValidationError',
      errors: { preco: { message: 'Preço deve ser maior ou igual a 0' } },
    });

    await expect(service.create(dto)).rejects.toThrow(
      new BadRequestException('Preço deve ser maior ou igual a 0'),
    );
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
