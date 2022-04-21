import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Constants } from '../../../../constants';

@Entity({ name: Constants.USER_TABLE })
export default class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
