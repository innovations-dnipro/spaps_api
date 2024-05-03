import * as dotenv from 'dotenv'

import { TypeOrmModuleOptions } from '@nestjs/typeorm'

dotenv.config()

export const TypeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.MYSQL_NODE_HOSTNAME, //NOTE: external host
  port: parseInt(process.env.MYSQL_TCP_PORT), //NOTE: external port
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  migrationsRun: true,
  migrationsTableName: 'migrations_TypeORM',
  synchronize: true,
  logging: true,
  extra: {
    decimalNumbers: true,
  },
}
