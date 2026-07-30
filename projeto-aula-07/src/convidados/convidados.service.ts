import { Injectable, NotFoundException } from '@nestjs/common';
import { Convidado } from './interfaces/convidado.interface';
import { CreateConvidadoDto } from './dto/create-convidado.dto';
import { UpdateConvidadoDto } from './dto/update-convidado.dto';

@Injectable()
export class ConvidadosService {
  private convidados: Convidado[] = [
    { id: 1, nome: 'Ana', idade: 28 },
    { id: 2, nome: 'Bruno', idade: 34 },
    { id: 3, nome: 'Carlos', idade: 22 },
  ];
  private proximoId = 4;

  findAll(): Convidado[] {
    return this.convidados;
  }

  create(createConvidadoDto: CreateConvidadoDto): Convidado {
    const novoConvidado: Convidado = { id: this.proximoId++, ...createConvidadoDto };
    this.convidados.push(novoConvidado);
    return novoConvidado;
  }

  findOne(id: number): Convidado {
    const convidado = this.convidados.find((c) => c.id === id);
    if (!convidado) {
      throw new NotFoundException(`Convidado com ID ${id} não encontrado`);
    }
    return convidado;
  }

  updateIdade(id: number, updateConvidadoDto: UpdateConvidadoDto): Convidado {
    const convidado = this.findOne(id);
    Object.assign(convidado, updateConvidadoDto);
    return convidado;
  }

  remove(id: number): void {
    const convidado = this.findOne(id);
    this.convidados = this.convidados.filter((c) => c.id !== convidado.id);
  }
}
