import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';
import UserEntity from '../user/user';

@Entity({ name: Constants.NOTIFY_TABLE })
export default class NotificationOpenChatEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'boolean', default: false })
  isOff: boolean;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userID' })
  userID: number;
}
