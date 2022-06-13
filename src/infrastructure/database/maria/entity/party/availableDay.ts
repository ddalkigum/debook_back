import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Constants } from '../../../../../constants';
import DayEntity from './day';
import PartyEntity from './party';

@Entity({ name: Constants.AVAILABLE_DAY_TABLE })
export default class AvailableDayEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => DayEntity, (day) => day.id)
  @JoinColumn({ name: 'dayID' })
  dayID: string;

  @ManyToOne(() => PartyEntity, (party) => party.id, { cascade: true })
  @JoinColumn({ name: 'partyID' })
  partyID: string;
}
