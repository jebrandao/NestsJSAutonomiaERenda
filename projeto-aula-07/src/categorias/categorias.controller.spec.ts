import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';

describe('CategoriasController', () => {
  let controller: CategoriasController;
  let categoriasService: { create: jest.Mock; findAll: jest.Mock };

  beforeEach(async () => {
    categoriasService = { create: jest.fn(), findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasController],
      providers: [{ provide: CategoriasService, useValue: categoriasService }],
    }).compile();

    controller = module.get<CategoriasController>(CategoriasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('criar deve delegar ao service', async () => {
    const dto = { nome: 'Ferramentas Manuais' };
    const criada = { _id: 'cat123', ...dto };
    categoriasService.create.mockResolvedValue(criada);

    await expect(controller.criar(dto)).resolves.toEqual(criada);
    expect(categoriasService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll deve delegar ao service', async () => {
    const lista = [{ nome: 'Ferramentas Manuais' }];
    categoriasService.findAll.mockResolvedValue(lista);

    await expect(controller.findAll()).resolves.toEqual(lista);
  });
});
