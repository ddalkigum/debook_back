import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class src1657183887259 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const notificationTable = new Table({
      name: 'notify',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          length: '32',
          isPrimary: true,
        },
        {
          name: 'type',
          type: 'varchar',
          length: '20',
        },
        {
          name: 'isOff',
          type: 'boolean',
          default: 0,
        },
        {
          name: 'userID',
          type: 'int',
        },
      ],
    });

    await queryRunner.createTable(notificationTable, true);

    await queryRunner.createForeignKey(
      notificationTable,
      new TableForeignKey({
        columnNames: ['userID'],
        name: 'userID',
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notification');
  }
}
