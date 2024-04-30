import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUser1713362965417 implements MigrationInterface {
    name = 'CreateUser1713362965417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`firstName\` varchar(35) NULL, \`lastName\` varchar(35) NULL, \`email\` varchar(254) NULL, \`phone\` varchar(15) NULL, \`password\` varchar(255) NULL, \`role\` enum ('RENTOR', 'CLIENT', 'SUPERADMIN', 'ADMIN') NOT NULL DEFAULT 'ADMIN', INDEX \`IDX_af99afb7cf88ce20aff6977e68\` (\`lastName\`), INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_af99afb7cf88ce20aff6977e68\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
