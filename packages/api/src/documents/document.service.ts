import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Document } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import { UploadDocumentDto } from './dto/document.dto';
import { encrypt } from '../common/encryption.util';

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async upload(dto: UploadDocumentDto): Promise<Document> {
    const encryptedFilePath = encrypt(
      dto.filePath,
      this.configService.get('ENCRYPTION_KEY'),
      null,
    );
    const document = this.prisma.document.create({
      data: {
        project: { connect: { id: dto.projectId } },
        task: dto.taskId ? { connect: { id: dto.taskId } } : null,
        fileName: dto.fileName,
        filePath: encryptedFilePath,
      },
    });
    return document;
  }
}
