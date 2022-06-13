import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';

@Entity({ name: Constants.BOOK_TABLE })
export default class BookEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  authors: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  thumbnail: string;
}
