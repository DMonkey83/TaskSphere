import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UploadDocumentDto } from './dto/document.dto';
import { Document } from './entities/document.entity';
import { encrypt } from '../common/encryption.util';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private configService: ConfigService,
  ) {}

  async upload(dto: UploadDocumentDto): Promise<Document> {
    const encryptedFilePath = encrypt(
      dto.filePath,
      this.configService.get('ENCRYPTION_KEY'),
      null,
    );
    const document = this.documentsRepository.create({
      project: { id: dto.projectId },
      task: dto.taskId ? { id: dto.taskId } : null,
      fileName: dto.fileName,
      filePath: encryptedFilePath,
      uploadedBy: { id: dto.uploadedById },
    });
    return this.documentsRepository.save(document);
  }
}
