import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Constants } from '../../../../../constants';

@Entity({ name: Constants.DAY_TABLE })
export default class DayEntity {
  @PrimaryColumn({ type: 'varchar', length: 3 })
  id: string;
}
