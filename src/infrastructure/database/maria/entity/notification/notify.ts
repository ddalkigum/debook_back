import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';
import UserEntity from '../user/user';

@Entity({ name: Constants.NOTIFY_TABLE })
export default class NotifyEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userID' })
  userID: number;
}
