import { injectable } from 'inversify';
import { IPartyRepository } from './interface';

@injectable()
export default class PartyRepository implements IPartyRepository {
  public getPartyList = async () => {};

  public getPartyDetail = async () => {};

  public getAvailableDay = async () => {};

  public getParticipant = async () => {};

  public getPartyListByBookID = async () => {};

  public insertParty = async () => {};
}
