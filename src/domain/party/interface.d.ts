import PartyEntity from '../../infrastructure/database/maria/entity/party/party';

export type PartyContext = Omit<PartyEntity, 'id' | 'createdAt' | 'updatedAt'>;

export interface IPartyService {
  getMainCardList: () => Promise<any>;
  getPartyDetail: (nickname: string, partyTitle: string, userID?: number) => Promise<any>;
  getRelationPartyList: (bookID: string) => Promise<any>;
  registParty: (context: PartyContext) => Promise<any>;
}

export interface IPartyRepository {
  getPartyList: () => Promise<any>;
  getPartyDetail: (nickname: string, partyTitle: string) => Promise<any>;
  getAvailableDay: (partyID: string) => Promise<any>;
  getParticipant: (partyID: string) => Promise<any>;
  getPartyListByBookID: (bookID: string) => Promise<any>;
  insertParty: (context: PartyContext) => Promise<any>;
}
