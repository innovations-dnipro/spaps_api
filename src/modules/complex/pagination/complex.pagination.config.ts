import { PaginateConfig } from 'nestjs-paginate'

import { Complex } from '../complex.entity'

export const complexPaginationConfig: PaginateConfig<Complex> = {
  sortableColumns: ['id'],
  searchableColumns: ['id', 'name', 'rentor.id'],
  relations: ['rentor'],
  defaultSortBy: [['id', 'ASC']],
}
