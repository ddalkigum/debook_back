import { BeforeInsert, Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';

@Entity({ name: Constants.CERTIFICATION_TABLE })
export default class CertificationEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'boolean' })
  isSignup: boolean;

  @Index()
  @Column({ type: 'datetime' })
  deleteTime: string;
}
