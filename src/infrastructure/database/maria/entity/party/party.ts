import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';
import { DateTimeEntity } from '../datetime';
import UserEntity from '../user/user';
import BookEntity from './book';

@Entity({ name: Constants.PARTY_TABLE })
export default class PartyEntity extends DateTimeEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 30 })
  title: string;

  @Index('indexPartySlug')
  @Column({ type: 'varchar', nullable: true })
  slug: string;

  @Column({ type: 'tinyint' })
  numberOfRecruit: number;

  @Column({ type: 'varchar' })
  openChatURL: string;

  @Column({ type: 'varchar' })
  openChatPassword: string;

  @Column({ type: 'boolean' })
  isOnline: boolean;

  @Column({ type: 'varchar', nullable: true, length: 20 })
  region?: string;

  @Column({ type: 'varchar', nullable: true, length: 20 })
  city?: string;

  @Column({ type: 'varchar', nullable: true, length: 20 })
  town?: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerID' })
  ownerID: number;

  @ManyToOne(() => BookEntity, (book) => book.id)
  @JoinColumn({ name: 'bookID' })
  bookID: string;
}
