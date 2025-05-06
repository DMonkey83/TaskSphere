import { RoleGuard } from './../auth/role.guard';
import { Body, Controller, UseGuards, Post } from '@nestjs/common';
import { DocumentService } from './document.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import { UploadDocumentDtoClass } from './dto/document.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'team_lead', 'admin')
  @Post()
  async upload(
    @Body(new ZodValidationPipe(UploadDocumentDtoClass))
    body: UploadDocumentDtoClass,
  ) {
    return this.documentService.upload(body);
  }
}
