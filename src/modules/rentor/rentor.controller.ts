import { Body, Controller, Param, ParseIntPipe, Put } from '@nestjs/common'
import {
  ApiBadGatewayResponse,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiParamOptions,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { User } from '@spaps/core/core-module/user/user.entity'
import { Auth } from '@spaps/core/decorators/auth.decorator'
import { CurrentUser } from '@spaps/core/decorators/current.user.decorator'
import { ERole } from '@spaps/core/enums'
import { ApiV1 } from '@spaps/core/utils'

import { UpdateRentorDto } from './dto/update.rentor.dto'
import { Rentor } from './rentor.entity'
import { RentorService } from './rentor.service'

@ApiTags('Rentors')
@ApiBadGatewayResponse({
  status: 502,
  description: 'Something went wrong',
})
@Controller(ApiV1('rentors'))
export class RentorController {
  constructor(readonly rentorService: RentorService) {}

  @Put(':rentorId')
  @Auth({
    roles: [ERole.RENTOR, ERole.ADMIN, ERole.SUPERADMIN],
  })
  @ApiOperation({
    summary: 'Update a rentor.',
  })
  @ApiParam({
    name: 'rentorId',
    type: 'number',
    example: 1,
  } as ApiParamOptions)
  @ApiBody({
    description: 'Model to update an existing rentor.',
    type: UpdateRentorDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Will return the rentor data.',
    type: Rentor,
  })
  async updateRentor(
    @Param('rentorId', ParseIntPipe) rentorId: number,
    @CurrentUser() user: User,
    @Body() data: UpdateRentorDto,
  ): Promise<Rentor> {
    return this.rentorService.updateRentor({
      id: rentorId,
      ...data,
      ...(user.role === ERole.RENTOR ? { tokenUserId: user.id } : {}),
    })
  }
}
