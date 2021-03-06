import { BeforeInsert, Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';

@Entity({ name: Constants.CERTIFICATION_TABLE })
export default class CertificationEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Index('indexCertificationEmail')
  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Index('indexCertificationCode')
  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'boolean' })
  isSignup: boolean;

  @Column({ type: 'datetime' })
  deleteTime: string;
}
