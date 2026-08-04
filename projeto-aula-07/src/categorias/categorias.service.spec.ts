import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CategoriasService } from './categorias.service';
import { Categoria } from './schemas/categoria.schema';

describe('CategoriasService', () => {
  let service: CategoriasService;
  let categoriaModel: { create: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    categoriaModel = { create: jest.fn(), find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        { provide: getModelToken(Categoria.name), useValue: categoriaModel },
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create deve persistir a categoria via Model.create', async () => {
    const dto = { nome: 'Ferramentas Manuais', descricao: 'Sem motor.' };
    const criada = { _id: 'cat123', ...dto };
    categoriaModel.create.mockResolvedValue(criada);

    const resultado = await service.create(dto);

    expect(categoriaModel.create).toHaveBeenCalledWith(dto);
    expect(resultado).toEqual(criada);
  });

  it('findAll deve retornar todas as categorias', async () => {
    const lista = [{ nome: 'Ferramentas Manuais' }, { nome: 'Elétricos' }];
    categoriaModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(lista) });

    const resultado = await service.findAll();

    expect(resultado).toEqual(lista);
  });
});
