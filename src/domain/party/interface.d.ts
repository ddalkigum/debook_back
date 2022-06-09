import PartyEntity from '../../infrastructure/database/maria/entity/party/party';

export type PartyContext = Omit<PartyEntity, 'id' | 'createdAt' | 'updatedAt'>;

export interface KakakoBookInfo {
  authors: string[];
  contents: string;
  thumbnail: string;
  publisher: string;
  title: string;
  isbn: string;
}

export interface KakaoBookMeta {
  is_end: boolean;
  pageable_count: number;
  total_count: number;
}

export interface KakaoSearchBookResponse {
  documents: KakakoBookInfo[];
  meta: KakaoBookMeta;
}

export interface BookMeta {
  page: number;
  nextPage?: number;
  isEnd: boolean;
  lastPage: number;
}

export interface BookInfo {
  id: string;
  authors: string[];
  thumbnail: string;
  title: string;
}

export interface SearchBook {
  bookList: BookInfo[];
  meta: BookMeta;
}

export interface IPartyService {
  getMainCardList: () => Promise<any>;
  getPartyDetail: (nickname: string, partyTitle: string, userID?: number) => Promise<any>;
  getRelationPartyList: (bookID: string) => Promise<any>;
  registParty: (context: PartyContext) => Promise<any>;
  searchBook: (title: string, page: number) => Promise<SearchBook>;
}

export interface IPartyRepository {
  getPartyList: () => Promise<any>;
  getPartyDetail: (nickname: string, partyTitle: string) => Promise<any>;
  getAvailableDay: (partyID: string) => Promise<any>;
  getParticipant: (partyID: string) => Promise<any>;
  getPartyListByBookID: (bookID: string) => Promise<any>;
  insertParty: (context: PartyContext) => Promise<any>;
}
