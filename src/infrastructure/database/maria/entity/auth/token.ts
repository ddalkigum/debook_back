import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';
import * as util from '../../../../../util';

@Entity({ name: Constants.TOKEN_TABLE })
export default class TokenEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'int' })
  userID: number;

  @Index('access_token_index')
  @Column({ type: 'varchar', length: 250 })
  accessToken: string;

  @Column({ type: 'varchar', length: 350 })
  refreshToken: string;
}
