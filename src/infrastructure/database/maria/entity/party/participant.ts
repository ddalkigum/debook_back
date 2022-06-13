import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Constants } from '../../../../../constants';
import { DateTimeEntity } from '../datetime';
import UserEntity from '../user/user';
import PartyEntity from './party';

@Entity({ name: Constants.PARTICIPANT_TABLE })
export default class ParticipantEntity extends DateTimeEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'boolean' })
  isOwner: boolean;

  @Column({ type: 'boolean', default: false })
  isAccept: boolean;

  @ManyToOne(() => UserEntity, (user) => user.id, { cascade: true })
  @JoinColumn({ name: 'userID' })
  userID: number;

  @ManyToOne(() => PartyEntity, (party) => party.id, { cascade: true })
  @JoinColumn({ name: 'partyID' })
  partyID: string;
}
