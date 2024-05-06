import { Response as ExResponse } from 'express'
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
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

import { User } from '@spaps/modules/core-module/user/user.entity'
import { FileUploadService } from '@spaps/modules/file-upload/file-upload.service'
import { BufferedFile } from '@spaps/modules/file-upload/file.model'
import { PublicFile } from '@spaps/modules/file-upload/public-file.entity'

import { Auth, CurrentUser } from '@spaps/core/decorators'
import { EFileCategory, ERole } from '@spaps/core/enums'
import { ApiV1, IMAGE_TYPE_REGEX, Nullable } from '@spaps/core/utils'

import { Client } from './client.entity'
import { ClientService } from './client.service'
import { AddClientAvatarDto } from './dto/add.client.avatar.dto'
import { UpdateClientDto } from './dto/update.client.dto'

@ApiTags('Clients')
@ApiBadGatewayResponse({
  status: 502,
  description: 'Something went wrong',
})
@Controller(ApiV1('clients'))
export class ClientController {
  constructor(
    readonly clientService: ClientService,
    private fileUploadService: FileUploadService,
  ) {}

  @Get(':clientId')
  @Auth({
    roles: [ERole.CLIENT, ERole.ADMIN, ERole.SUPERADMIN],
  })
  @ApiParam({
    name: 'clientId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  @ApiOperation({
    summary:
      'Get a client with the provided id. Role: SUPERADMIN, ADMIN. Permission: READ_CLIENTS.',
  })
  @ApiResponse({
    status: 200,
    description: 'Will return the client with the provided id.',
    type: Client,
    isArray: true,
  })
  async getClientById(
    @Param('clientId', ParseIntPipe) clientId: number,
    @CurrentUser() user: User,
  ): Promise<Nullable<Client>> {
    return this.clientService.getClientById({
      id: clientId,
      ...(user.role === ERole.CLIENT ? { tokenUserId: user.id } : {}),
    })
  }

  @Put(':clientId')
  @Auth({
    roles: [ERole.CLIENT, ERole.ADMIN, ERole.SUPERADMIN],
  })
  @ApiOperation({
    summary: 'Update a client.',
  })
  @ApiParam({
    name: 'clientId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  @ApiBody({
    description: 'Model to update an existing client.',
    type: UpdateClientDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Will return the client data.',
    type: Client,
  })
  async updateClient(
    @Param('clientId', ParseIntPipe) clientId: number,
    @CurrentUser() user: User,
    @Body() data: UpdateClientDto,
  ): Promise<Client> {
    return this.clientService.updateClient({
      id: clientId,
      ...data,
      ...(user.role === ERole.CLIENT ? { tokenUserId: user.id } : {}),
    })
  }

  @Get(':clientId/avatar')
  @Auth({
    roles: [ERole.CLIENT],
  })
  @ApiOperation({
    summary: 'Get client avatar.',
  })
  async getDocumentsByEmployeeId(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<any> {
    return this.clientService.findClientAvatar(clientId)
  }

  @Post(':clientId/avatar')
  @Auth({
    roles: [ERole.CLIENT],
  })
  @ApiOperation({
    summary: 'Adds avatar to the client whose id is provided.',
  })
  @ApiParam({
    name: 'clientId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  @ApiBody({
    description:
      'Model to add new avatar related to the client whose id is provided.',
    type: AddClientAvatarDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Will return the client data.',
    type: Client,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor(EFileCategory.CLIENT_AVATAR))
  async addClientFiles(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() data: AddClientAvatarDto, //NOTE: it needs to be declared here for dto check to run
    @UploadedFile(
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
    clientAvatar: BufferedFile,
  ): Promise<Client> {
    return this.clientService.addClientAvatar(clientId, clientAvatar)
  }

  @Get('avatar/:fileId')
  @Auth({
    roles: [ERole.CLIENT],
  })
  @ApiOperation({
    summary: 'Render client avatar.',
  })
  @ApiParam({
    name: 'fileId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  async getFileById(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res({ passthrough: true }) res: ExResponse,
  ) {
    const {
      fileInfo,
      stream,
    }: { fileInfo: PublicFile; stream: stream.Readable } =
      await this.fileUploadService.getFile(fileId, EFileCategory.CLIENT_AVATAR)

    return new StreamableFile(stream, {
      disposition: `inline filename="${fileInfo.name}`,
      type: fileInfo.type,
    })
  }

  @Get('file-download/:fileId')
  @Auth({
    roles: [ERole.CLIENT],
  })
  @ApiOperation({
    summary: 'Download client avatar.',
  })
  @ApiParam({
    name: 'fileId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  async downloadFileById(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res({ passthrough: true }) res: ExResponse,
  ) {
    const {
      fileInfo,
      stream,
    }: { fileInfo: PublicFile; stream: stream.Readable } =
      await this.fileUploadService.getFile(fileId, EFileCategory.CLIENT_AVATAR)

    res.set({
      'Content-Type': fileInfo.type,
      'Content-Disposition': `attachment; filename=${fileInfo.name}`,
    })

    return new StreamableFile(stream, {
      disposition: `inline filename="${fileInfo.name}`,
      type: fileInfo.type,
    })
  }

  @Delete(':clientId/avatar')
  @Auth({
    roles: [ERole.CLIENT],
  })
  @ApiOperation({
    summary:
      'Remove an avatar related to the client whose clientId is provided.',
  })
  @ApiParam({
    name: 'clientId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  @ApiResponse({
    status: 200,
    description: 'Will return boolean result.',
    type: Boolean,
  })
  async removeClientFile(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<number | unknown> {
    const result = await this.clientService.removeClientFile(clientId)

    return result === true ? 200 : result
  }
}
