import { BeforeInsert, Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';
import * as util from '../../../../../util';

@Entity({ name: Constants.CERTIFICATION_TABLE })
export default class CertificationEntity {
  @PrimaryColumn({ type: 'varchar', length: 36, default: util.uuid.generageUUID() })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Index()
  @Column({ type: 'varchar', length: 10 })
  code: string;

  @Column({ type: 'boolean' })
  isSignup: boolean;

  @Index()
  @Column({ type: 'datetime' })
  deleteTime: string;

  @BeforeInsert()
  setDeleteTime() {
    const timestamp = Date.now() + 60 * 60;
    this.deleteTime = new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
  }
}
