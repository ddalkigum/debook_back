import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Constants } from '../../../../../constants';
import { DateTimeEntity } from '../datetime';
import PartyEntity from '../party/party';
import UserEntity from '../user/user';

@Entity({ name: Constants.NOTIFICATION_OPEN_CHAT_TABLE })
export default class NotificationOpenChatEntity extends DateTimeEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.id, { cascade: true })
  @JoinColumn({ name: 'userID' })
  userID: number;

  @OneToOne(() => PartyEntity, (party) => party.id)
  @JoinColumn({ name: 'partyID' })
  partyID: string;
}
