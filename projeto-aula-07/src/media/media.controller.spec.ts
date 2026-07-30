import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';

describe('MediaController', () => {
  let controller: MediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('uploadFile deve retornar filename e size do arquivo já processado pelo Multer', () => {
    const arquivoSimulado = {
      filename: 'a3f2c1d0-1234-abcd-5678-foto.jpg',
      size: 204800,
    } as Express.Multer.File;

    expect(controller.uploadFile(arquivoSimulado)).toEqual({
      filename: 'a3f2c1d0-1234-abcd-5678-foto.jpg',
      size: 204800,
    });
  });
});
