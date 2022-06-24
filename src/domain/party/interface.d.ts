import { DateTimeEntity } from '../../infrastructure/database/maria/entity/datetime';
import AvailableDayEntity from '../../infrastructure/database/maria/entity/party/availableDay';
import BookEntity from '../../infrastructure/database/maria/entity/party/book';
import ParticipantEntity from '../../infrastructure/database/maria/entity/party/participant';
import PartyEntity from '../../infrastructure/database/maria/entity/party/party';
import UserEntity from '../../infrastructure/database/maria/entity/user/user';
import NotificationOpenChatEntity from '../../infrastructure/database/maria/entity/notification/openChat';
import { IEntity, InsertRows } from '../../infrastructure/database/maria/interface';
import { InsertResult } from 'typeorm';

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

type BookContext = InsertRows<BookEntity>;

export interface Day {
  mon: 'mon';
  tue: 'tue';
  wed: 'wed';
  thu: 'thu';
  fri: 'fri';
  sat: 'sat';
  sun: 'sun';
}

export type IAvailableDay = keyof Day;

export type InsertParty = Omit<PartyEntity, keyof DateTimeEntity>;

export interface RegistPartyContext {
  party: InsertParty;
  availableDay: string[];
  book: BookInfo;
  ownerID: number;
}

export interface GetPartyDetail {
  partyID: string;
  partyTitle: string;
  numberOfRecruit: number;
  slug: string;
  isOnline: boolean;
  region?: string;
  city?: string;
  town?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  ownerID: number;
  nickname: string;
  profileImage: string;
  bookID: string;
  bookTitle: string;
  bookThumbnail: string;
  authors: string;
  numberOfParticipant: string;
}

export type InsertAvailableDay = Omit<AvailableDayEntity, 'id'>;
export type RequestParticipate = Omit<ParticipateEntity, 'id'>;

export interface PartyParticipant {
  count: number;
}

export interface PartyDetailResult {
  owner: Pick<Userentity, 'id' | 'nickname' | 'profileImage'>;
  party: Omit<PartyEntity, 'bookID' | 'ownerID'>;
  book: BookEntity;
  participant: PartyParticipant;
  availableDay: AvailableDayEntity[];
}

export type InsertNotificationContext = Omit<NotificationOpenChatEntity, keyof DateTimeEntity>;

interface GetOpenChatList {
  notificationID: string;
  partyID: string;
  title: string;
  openChatURL: string;
  openChatPassword: string;
  bookID: string;
  thumbnail: string;
}

export interface OpenChatResult {
  notification: { id: string };
  party: Pick<PartyEntity, 'id' | 'title' | 'openChatURL' | 'openChatPassword'>;
  book: Pick<BookEntity, 'id' | 'thumbnail'>;
}

export interface IPartyService {
  getMainCardList: () => Promise<GetPartyDetail[]>;
  getPartyDetail: (nickname: string, URLSlug: string, userID?: number) => Promise<any>;
  getModifyParty: (userID: number, partyID: string) => Promise<any>;
  getRelationPartyList: (bookID: string) => Promise<PartyDetailResult>;
  getParticipatePartyList: (userID: number) => Promise<any>;
  registParty: (context: RegistPartyContext) => Promise<PartyContext>;
  updateParty: (partyID: string, context: RegistPartyContext) => Promise<any>;
  joinParty: (userID: number, partyID: string) => Promise<>;
  searchBook: (title: string, page: number) => Promise<SearchBook>;
  registNotification: (userID: number, partyID: string) => Promise<InsertResult<NotificationOpenChatEntity>>;
  getOpenCharNotification: (userID: number) => Promise<OpenChatResult[]>;
  cancelJoin: (userID: number, partyID: string) => Promise<string>;
}

export interface IPartyRepository {
  insertParty: (party: InsertParty) => Promise<InsertParty>;
  updateParty: (partyID: string, context: Partial<PartyEntity>) => Promise<Partial<PartyEntity>>;
  getPartyEntity: (partyID: string) => Promise<PartyEntity>;
  getModifyParty: (partyID: string) => Promise<any>;
  getPartyList: () => Promise<GetPartyDetail[]>;
  getPartyDetail: (nickname: string, slug: string) => Promise<GetPartyDetail[]>;
  getPartyByTitle: (nickname: string, partyTitle: string) => Promise<PartyEntity[]>;
  getPartyListByBookID: (bookID: string) => Promise<any>;
  getParticipateParty: (userID: number) => Promise<any[]>;

  insertAvailableDay: (availableDayList: InsertAvailableDay[]) => Promise<InsertAvailableDay[]>;
  updateAvailableDay: (
    partyID: string,
    availableDay: Partial<AvailableDayEntity>
  ) => Promise<Partial<AvailableDayEntity>>;
  getAvailableDay: (partyID: string) => Promise<AvailableDayEntity[]>;

  insertParticipant: (userID: number, partyID: string, isOwner: boolean) => Promise<Partial<ParticipantEntity>>;
  getParticipant: (partyID: string) => Promise<ParticipantEntity[]>;
  getParticipantEntity: (findCondition: Partial<ParticipantEntity>) => Promise<ParticipantEntity>;
  deleteParticipantEntity: (findCondition: Partial<ParticipantEntity>) => Promise<void>;
  increaseParticipantCount: (partyID: string) => Promise<Partial<PartyEntity>>;
  decreaseParticipantCount: (partyID: string) => Promise<Partial<PartyEntity>>;

  insertBook: (context: BookContext) => Promise<BookContext>;
  getBook: (bookID: string) => Promise<Partial<BookEntity>>;

  insertNotificationOpenChat: (context: InsertNotificationContext) => Promise<InsertResult<NotificationOpenChatEntity>>;
  getNotificationOpenChatList: (userID: number) => Promise<GetOpenChatList[]>;
  deleteNotificationOpenChat: (findCondition: Partial<NotificationOpenChatEntity>) => Promise<void>;
}
