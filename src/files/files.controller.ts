import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors( FileInterceptor( 'file' ,{
    fileFilter: fileFilter
  }) )
  uploadProductImage( 
    @UploadedFile() file: Express.Multer.File 
  ){
    return {
      fileName: file.originalname
    }
  }
}
