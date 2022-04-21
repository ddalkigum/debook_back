import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Constants } from '../../../../../constants';

@Entity({ name: Constants.USER_TABLE })
export default class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  email: string;

  @Column({ type: 'varchar', length: 10 })
  nickname: string;
}
