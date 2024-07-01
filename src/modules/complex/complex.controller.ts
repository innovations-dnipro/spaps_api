import { Response as ExResponse } from 'express'
import {
  ApiPaginationQuery,
  Paginate,
  PaginateQuery,
  Paginated,
} from 'nestjs-paginate'
import * as stream from 'stream'

import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import {
  ApiBadGatewayResponse,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiParamOptions,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { FileUploadService } from '@spaps/modules/file-upload/file-upload.service'

import { User } from '@spaps/core/core-module/user/user.entity'
import { UserService } from '@spaps/core/core-module/user/user.service'
import { Auth } from '@spaps/core/decorators/auth.decorator'
import { CurrentUser } from '@spaps/core/decorators/current.user.decorator'
import { EFileCategory, ERole } from '@spaps/core/enums'
import { ApiV1, IMAGE_TYPE_REGEX } from '@spaps/core/utils'

import { BufferedFile } from '../file-upload/file.model'
import { PublicFile } from '../file-upload/public-file.entity'
import { Complex } from './complex.entity'
import { ComplexService } from './complex.service'
import { AddComplexPhotosDto } from './dto/add.complex.photos.dto'
import { UpdateComplexDto } from './dto/update.complex.dto'
import { complexPaginationConfig } from './pagination/complex.pagination.config'

@ApiTags('Complexes')
@ApiBadGatewayResponse({
  status: 502,
  description: 'Something went wrong',
})
@Controller(ApiV1('complexes'))
export class ComplexController {
  constructor(
    readonly complexService: ComplexService,
    readonly userService: UserService,
    readonly fileUploadService: FileUploadService,
  ) {}

  //v1/complexes?search=3&searchBy=rentor.id'
  @Get()
  @Auth({
    roles: [ERole.RENTOR],
  })
  @ApiOperation({
    summary: 'Get complexes specified by query params. Role: RENTOR.',
  })
  @ApiResponse({
    status: 200,
    description: 'Will return the list of complexes.',
    type: Complex,
    isArray: true,
  })
  @ApiPaginationQuery(complexPaginationConfig)
  async getAllComplexes(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Complex>> {
    return this.complexService.findAll(query)
  }

  @Post()
  @Auth({
    roles: [ERole.RENTOR],
  })
  @ApiOperation({
    summary: 'Create a complex.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor(EFileCategory.COMPLEX_PHOTOS, 10))
  @ApiBody({
    description: 'Model to create an existing complex.',
    type: UpdateComplexDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Will return the complex data.',
    type: Complex,
  })
  async createComplex(
    @CurrentUser() user: User,
    @Body() data: UpdateComplexDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 20000001,
            message: 'File size must not exceed 20MB.',
          }),
          new FileTypeValidator({ fileType: IMAGE_TYPE_REGEX }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Array<BufferedFile>,
  ): Promise<Partial<Complex>> {
    const { rentors } = await this.userService.findUserByIdWithRelations(
      user.id,
    )

    return this.complexService.createComplex({
      ...data,
      rentorId: rentors[0].id,
      files,
    })
  }

  @Get(':complexId')
  @Auth({
    roles: [ERole.RENTOR],
  })
  @ApiOperation({
    summary: 'Get complex by complex id. Role: RENTOR.',
  })
  @ApiResponse({
    status: 200,
    description: 'Will return a complex with that ID if exists.',
    type: Complex,
    isArray: true,
  })
  async getComplexById(
    @Param('complexId', ParseIntPipe) complexId: number,
  ): Promise<Complex> {
    return this.complexService.findComplexByIdWithRelations(complexId)
  }

  @Put(':complexId')
  @Auth({
    roles: [ERole.RENTOR],
  })
  @ApiOperation({
    summary: 'Update a complex.',
  })
  @ApiParam({
    name: 'complexId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  @ApiBody({
    description: 'Model to update an existing complex.',
    type: UpdateComplexDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Will return the complex data.',
    type: Complex,
  })
  async updateComplex(
    @Param('complexId', ParseIntPipe) complexId: number,
    @CurrentUser() user: User,
    @Body() data: UpdateComplexDto,
  ): Promise<any> {
    const { rentors } = await this.userService.findUserByIdWithRelations(
      user.id,
    )
    return this.complexService.updateComplex({
      id: complexId,
      ...data,
      rentorId: rentors[0].id,
    })
  }

  @Delete(':complexId')
  @Auth({
    roles: [ERole.RENTOR],
  })
  @ApiOperation({
    summary: 'Remove a complex.',
  })
  @ApiParam({
    name: 'complexId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  @ApiResponse({
    status: 200,
    description: 'Will return 200 on removal success.',
    type: Complex,
  })
  async removeComplex(
    @Param('complexId', ParseIntPipe) complexId: number,
    @CurrentUser() user: User,
  ): Promise<any> {
    const { rentors } = await this.userService.findUserByIdWithRelations(
      user.id,
    )

    await this.complexService.removeComplex({
      complexId,
      rentorId: rentors[0].id,
    })

    return 200
  }

  @Get('photo/:photoId')
  @Auth({
    roles: [ERole.RENTOR],
  })
  @ApiOperation({
    summary: 'Get complex photo.',
  })
  @ApiParam({
    name: 'photoId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  async getDocumentsByEmployeeId(
    @Param('photoId', ParseIntPipe) photoId: number,
    @Res({ passthrough: true }) res: ExResponse,
  ): Promise<any> {
    const {
      fileInfo,
      stream,
    }: { fileInfo: PublicFile; stream: stream.Readable } =
      await this.fileUploadService.getFile(
        photoId,
        EFileCategory.COMPLEX_PHOTOS,
      )

    return new StreamableFile(stream, {
      disposition: `inline filename="${fileInfo.name}`,
      type: fileInfo.type,
    })
  }

  @Post(':complexId/photos')
  @Auth({
    roles: [ERole.RENTOR],
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor(EFileCategory.COMPLEX_PHOTOS, 10))
  @ApiOperation({
    summary: 'Adds images to the complex whose id is provided.',
  })
  @ApiParam({
    name: 'complexId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  @ApiBody({
    description:
      'Model to add new images related to the complex whose id is provided.',
    type: AddComplexPhotosDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Will return 200 on success.',
    type: Number,
  })
  async addComplexPhotos(
    @Param('complexId', ParseIntPipe) complexId: number,
    @Body() data: AddComplexPhotosDto, //NOTE: it needs to be declared here for dto check to run
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 20000001,
            message: 'Some error message',
          }),
          new FileTypeValidator({ fileType: IMAGE_TYPE_REGEX }),
        ],
      }),
    )
    complexPhotos: Array<BufferedFile>,
  ): Promise<number> {
    return this.complexService.addComplexPhotos(complexId, complexPhotos)
  }

  @Delete(':complexId/file/:fileId')
  @Auth({
    roles: [ERole.RENTOR],
  })
  @ApiOperation({
    summary:
      'Remove a photo with fileId related to the complex whose complexId is provided. Permission: DELETE_CLIENT_FILES.',
  })
  @ApiParam({
    name: 'complexId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  @ApiParam({
    name: 'fileId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  @ApiResponse({
    status: 200,
    description: 'Will return boolean result.',
    type: Boolean,
  })
  async removeClientFile(
    @Param('complexId', ParseIntPipe) clientId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
  ): Promise<number> {
    const response = await this.complexService.removeComplexPhoto(
      clientId,
      fileId,
    )

    if (response === true) {
      return 200
    }

    return 422
  }
}
