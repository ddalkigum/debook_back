import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';

@Entity({ name: Constants.CERTIFICATION_TABLE })
export default class CertificationEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 10 })
  code: string;

  @Column({ type: 'tinyint' })
  isSignup: boolean;
}
