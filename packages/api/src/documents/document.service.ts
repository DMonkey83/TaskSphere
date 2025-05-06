import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UploadDocumentDtoClass } from './dto/document.dto';
import { encrypt } from '../common/encryption.util';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private configService: ConfigService,
  ) {}

  async upload(dto: UploadDocumentDtoClass): Promise<Document> {
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
