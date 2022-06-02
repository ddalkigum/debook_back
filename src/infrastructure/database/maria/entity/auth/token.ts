import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Constants } from '../../../../../constants';
import UserEntity from '../user/user';

@Entity({ name: Constants.TOKEN_TABLE })
export default class TokenEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @OneToOne(() => UserEntity, { cascade: true })
  @JoinColumn({ name: 'userID' })
  userID: number;

  @Index('access_token_index')
  @Column({ type: 'varchar', length: 250 })
  accessToken: string;

  @Column({ type: 'varchar', length: 350 })
  refreshToken: string;
}
