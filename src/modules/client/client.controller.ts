import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common'
import {
  ApiBadGatewayResponse,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiParamOptions,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { User } from '@spaps/modules/core-module/user/user.entity'

import { Auth, CurrentUser } from '@spaps/core/decorators'
import { ERole } from '@spaps/core/enums'
import { ApiV1, Nullable } from '@spaps/core/utils'

import { Client } from './client.entity'
import { ClientService } from './client.service'
import { UpdateClientDto } from './dto/update.client.dto'

@ApiTags('Clients')
@ApiBadGatewayResponse({
  status: 502,
  description: 'Something went wrong',
})
@Controller(ApiV1('clients'))
export class ClientController {
  constructor(readonly clientService: ClientService) {}

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
}
