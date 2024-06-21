import {
  ApiPaginationQuery,
  Paginate,
  PaginateQuery,
  Paginated,
} from 'nestjs-paginate'

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common'
import {
  ApiBadGatewayResponse,
  ApiBody,
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
import { ERole } from '@spaps/core/enums'
import { ApiV1 } from '@spaps/core/utils'

import { Complex } from './complex.entity'
import { ComplexService } from './complex.service'
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
  ): Promise<any> {
    const { rentors } = await this.userService.findUserByIdWithRelations(
      user.id,
    )

    return this.complexService.createComplex({
      ...data,
      rentorId: rentors[0].id,
    })
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
}
