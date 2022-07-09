import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class src1657183887259 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const notificationTable = new Table({
      name: 'notify',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        },
        {
          name: 'type',
          type: 'varchar',
          length: '20',
        },
        {
          name: 'isActive',
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

    await queryRunner.dropForeignKey('certification', 'IDX_716aee59ee337fe7c3967a34e0');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notification');
  }
}
