import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';

describe('ProdutosController', () => {
  let controller: ProdutosController;
  let produtosService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    produtosService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutosController],
      providers: [{ provide: ProdutosService, useValue: produtosService }],
    }).compile();

    controller = module.get<ProdutosController>(ProdutosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('criar deve delegar ao service e retornar o produto criado', async () => {
    const dto = { nome: 'Torno CNC X200', preco: 15000, categoria: 'Ferramentas' };
    const criado = { _id: 'abc123', ...dto };
    produtosService.create.mockResolvedValue(criado);

    await expect(controller.criar(dto)).resolves.toEqual(criado);
    expect(produtosService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll deve delegar os filtros ao service', async () => {
    const filtros = { categoria: 'EPI', ordenar: 'preco_asc' as const, pagina: '2' };
    const pagina = [{ nome: 'Furadeira' }, { nome: 'Teclado' }];
    produtosService.findAll.mockResolvedValue(pagina);

    await expect(controller.findAll(filtros)).resolves.toEqual(pagina);
    expect(produtosService.findAll).toHaveBeenCalledWith(filtros);
  });

  it('buscarPorId deve delegar ao service', () => {
    const produto = { id: 1, nome: 'Notebook', preco: 3500 };
    produtosService.findOne.mockReturnValue(produto);

    expect(controller.buscarPorId('1')).toEqual(produto);
  });

  it('buscarPorId deve propagar BadRequestException para ID não numérico', () => {
    produtosService.findOne.mockImplementation(() => {
      throw new BadRequestException('O ID fornecido deve ser do tipo inteiro');
    });

    expect(() => controller.buscarPorId('abc')).toThrow(BadRequestException);
  });

  it('buscarPorId deve propagar NotFoundException para ID inexistente', () => {
    produtosService.findOne.mockImplementation(() => {
      throw new NotFoundException('Produto com ID 999 não encontrado');
    });

    expect(() => controller.buscarPorId('999')).toThrow(NotFoundException);
  });

  it('atualizar deve delegar id e dto ao service e retornar o produto atualizado', async () => {
    const dto = { preco: 16000 };
    const atualizado = { _id: 'abc123', nome: 'Torno CNC X200', preco: 16000, categoria: 'Ferramentas' };
    produtosService.update.mockResolvedValue(atualizado);

    await expect(controller.atualizar('abc123', dto)).resolves.toEqual(atualizado);
    expect(produtosService.update).toHaveBeenCalledWith('abc123', dto);
  });

  it('atualizar deve propagar NotFoundException para ID inexistente', async () => {
    produtosService.update.mockRejectedValue(
      new NotFoundException('Produto com ID 64f0000000000000000000ab não encontrado'),
    );

    await expect(controller.atualizar('64f0000000000000000000ab', { preco: 100 })).rejects.toThrow(
      NotFoundException,
    );
  });
});
