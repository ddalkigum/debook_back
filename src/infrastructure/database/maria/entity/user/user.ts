import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Constants } from '../../../../../constants';
import { DateTimeEntity } from '../dateTime';

@Entity({ name: Constants.USER_TABLE })
export default class UserEntity extends DateTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 10 })
  nickname: string;

  @Column({ type: 'varchar' })
  profileImage: string;
}
