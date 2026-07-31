import { Test, TestingModule } from '@nestjs/testing';
import { ColaboradoresController } from './colaboradores.controller';

describe('ColaboradoresController', () => {
  let controller: ColaboradoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColaboradoresController],
    }).compile();

    controller = module.get<ColaboradoresController>(ColaboradoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create deve confirmar o cadastro do colaborador recebido', () => {
    const colaborador = { nome: 'Ana', email: 'ana@email.com', idade: 30, departamento: 'TI' as const };

    expect(controller.create(colaborador)).toEqual({
      mensagem: 'Colaborador Ana cadastrado com sucesso!',
      dados: colaborador,
    });
  });
});
