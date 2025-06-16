import { Body, Controller, UseGuards, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Document } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';

import { RoleGuard } from './../auth/role.guard';
import { DocumentService } from './document.service';
import { Roles } from '../auth/roles.decorator';
import { UploadDocumentDto } from './dto/document.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'team_lead', 'admin')
  @Post()
  async upload(
    @Body(new ZodValidationPipe(UploadDocumentDto))
    body: UploadDocumentDto,
  ): Promise<Document> {
    const document: Document = await this.documentService.upload(body);
    return document;
  }
}
