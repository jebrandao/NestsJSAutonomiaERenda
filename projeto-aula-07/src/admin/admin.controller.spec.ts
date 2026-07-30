import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('painel deve retornar a mensagem de boas-vindas', () => {
    expect(controller.painel()).toEqual({
      mensagem: 'Bem-vindo ao painel administrativo.',
    });
  });
});
