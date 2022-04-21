import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';

@Entity({ name: Constants.TOKEN_TABLE })
export default class TokenEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'int', length: 10 })
  userID: number;

  @Column({ type: 'varchar', length: 250 })
  accessToken: string;

  @Column({ type: 'varchar', length: 350 })
  refreshToken: string;
}
