import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { Produto } from './schemas/produto.schema';

function criarQueryChainMock(resultadoFinal: unknown) {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.exec = jest.fn().mockResolvedValue(resultadoFinal);
  return chain;
}

describe('ProdutosService', () => {
  let service: ProdutosService;
  let produtoModel: {
    create: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
  };

  beforeEach(async () => {
    produtoModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

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

  it('findAll deve aplicar filtro de categoria, ordenação e paginação (página 1)', async () => {
    const chain = criarQueryChainMock([{ nome: 'Luva' }, { nome: 'Óculos' }]);
    produtoModel.find.mockReturnValue(chain);

    const resultado = await service.findAll({ categoria: 'EPI', ordenar: 'preco_asc', pagina: '1' });

    expect(produtoModel.find).toHaveBeenCalledWith({ categoria: 'EPI' });
    expect(chain.select).toHaveBeenCalledWith('-__v');
    expect(chain.sort).toHaveBeenCalledWith({ preco: 1 });
    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(resultado).toEqual([{ nome: 'Luva' }, { nome: 'Óculos' }]);
  });

  it('findAll deve calcular o skip corretamente para a página 2 (itens 6 a 10)', async () => {
    const chain = criarQueryChainMock([]);
    produtoModel.find.mockReturnValue(chain);

    await service.findAll({ pagina: '2' });

    expect(produtoModel.find).toHaveBeenCalledWith({});
    expect(chain.skip).toHaveBeenCalledWith(5);
    expect(chain.limit).toHaveBeenCalledWith(5);
  });

  it('findOne deve retornar o produto encontrado pelo _id do Mongo', async () => {
    const documento = { _id: 'abc123', nome: 'Torno CNC X200', preco: 15000, categoria: 'Ferramentas' };
    produtoModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(documento) });

    const resultado = await service.findOne('abc123');

    expect(produtoModel.findById).toHaveBeenCalledWith('abc123');
    expect(resultado).toEqual(documento);
  });

  it('findOne deve lançar BadRequestException para ID mal formado (CastError)', async () => {
    produtoModel.findById.mockReturnValue({
      select: jest.fn().mockRejectedValue({ name: 'CastError' }),
    });

    await expect(service.findOne('abc')).rejects.toThrow(
      new BadRequestException('O ID fornecido não é um ObjectId válido'),
    );
  });

  it('findOne deve lançar NotFoundException para ID bem formado mas inexistente', async () => {
    produtoModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(service.findOne('64f0000000000000000000ab')).rejects.toThrow(
      new NotFoundException('Produto com ID 64f0000000000000000000ab não encontrado'),
    );
  });

  it('update deve retornar o produto atualizado via findByIdAndUpdate', async () => {
    const atualizado = { _id: 'abc123', nome: 'Torno CNC X200', preco: 16000, categoria: 'Ferramentas' };
    produtoModel.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue(atualizado) });

    const resultado = await service.update('abc123', { preco: 16000 });

    expect(produtoModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'abc123',
      { $set: { preco: 16000 } },
      { returnDocument: 'after', runValidators: true },
    );
    expect(resultado).toEqual(atualizado);
  });

  it('update deve lançar NotFoundException quando o produto não existe', async () => {
    produtoModel.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(service.update('64f0000000000000000000ab', { preco: 100 })).rejects.toThrow(
      new NotFoundException('Produto com ID 64f0000000000000000000ab não encontrado'),
    );
  });

  it('update deve logar "Atenção: Estoque Crítico" quando estoque for atualizado para menos de 5', async () => {
    const atualizado = { _id: 'abc123', estoque: 2 };
    produtoModel.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue(atualizado) });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    await service.update('abc123', { estoque: 2 });

    expect(consoleSpy).toHaveBeenCalledWith('Atenção: Estoque Crítico');
    consoleSpy.mockRestore();
  });

  it('update NÃO deve logar o alerta quando o estoque atualizado for 5 ou mais', async () => {
    const atualizado = { _id: 'abc123', estoque: 10 };
    produtoModel.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue(atualizado) });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    await service.update('abc123', { estoque: 10 });

    expect(consoleSpy).not.toHaveBeenCalledWith('Atenção: Estoque Crítico');
    consoleSpy.mockRestore();
  });

  it('delete deve remover o produto quando o estoque estiver zerado', async () => {
    const produtoSemEstoque = { _id: 'abc123', nome: 'Torno CNC X200', estoque: 0 };
    produtoModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(produtoSemEstoque) });
    produtoModel.findByIdAndDelete.mockResolvedValue(produtoSemEstoque);

    await service.delete('abc123');

    expect(produtoModel.findByIdAndDelete).toHaveBeenCalledWith('abc123');
  });

  it('delete deve lançar BadRequestException quando o produto ainda tem estoque', async () => {
    const produtoComEstoque = { _id: 'abc123', nome: 'Torno CNC X200', estoque: 5 };
    produtoModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(produtoComEstoque) });

    await expect(service.delete('abc123')).rejects.toThrow(
      new BadRequestException('Não é possível excluir produtos com itens em estoque'),
    );
    expect(produtoModel.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('delete deve lançar NotFoundException para ID inexistente (via findOne)', async () => {
    produtoModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(service.delete('64f0000000000000000000ab')).rejects.toThrow(
      new NotFoundException('Produto com ID 64f0000000000000000000ab não encontrado'),
    );
    expect(produtoModel.findByIdAndDelete).not.toHaveBeenCalled();
  });
});
