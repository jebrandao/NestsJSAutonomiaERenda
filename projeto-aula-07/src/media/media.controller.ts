import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Guard adicionado: upload de arquivo estava aberto para qualquer um, sem
// token — um vetor real de abuso (qualquer visitante podia gravar arquivos
// no servidor). Rota nunca teve autenticação (Aula 12, anterior ao JWT).
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('media')
@ApiResponse({
  status: 401,
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('media')
export class MediaController {
  // POST /media/upload
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const nomeUnico = `${randomUUID()}${extname(file.originalname)}`;
          callback(null, nomeUnico);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      size: file.size,
    };
  }
}
