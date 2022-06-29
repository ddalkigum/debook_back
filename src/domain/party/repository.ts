import { inject, injectable } from 'inversify';
import { Constants } from '../../constants';
import BookEntity from '../../infrastructure/database/maria/entity/party/book';
import PartyEntity from '../../infrastructure/database/maria/entity/party/party';
import AvailableDayEntity from '../../infrastructure/database/maria/entity/party/availableDay';
import { IMariaDB } from '../../infrastructure/database/maria/interface';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import {
  BookContext,
  IPartyRepository,
  InsertParty,
  InsertAvailableDay,
  InsertNotificationContext,
  RegistPartyContext,
} from './interface';
import {
  getAvailableDayQuery,
  getPartyByTitleQuery,
  getPartyDetailQuery,
  getPartyListQuery,
  getParticipatePartyListQuery,
  getNotificationOpenChatListQuery,
  getModifyPartyQuery,
} from './query';
import ParticipantEntity from '../../infrastructure/database/maria/entity/party/participant';
import NotificationOpenChatEntity from '../../infrastructure/database/maria/entity/notification/openChat';

@injectable()
export default class PartyRepository implements IPartyRepository {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.MariaDB) private mariaDB: IMariaDB;

  // Party
  public insertParty = async (context: InsertParty): Promise<InsertParty> => {
    this.logger.debug(`PartyRepository, insertParty, context: ${JSON.stringify(context)}`);
    return await this.mariaDB.insert<PartyEntity>(Constants.PARTY_TABLE, { ...context });
  };

  public updateParty = async (partyID: string, context: RegistPartyContext) => {
    this.logger.debug(`PartyRepository, updateParty, context: ${JSON.stringify(context)}`);
    return await this.mariaDB.updateByColumn<PartyEntity>(Constants.PARTY_TABLE, { id: partyID }, context);
  };

  public deleteParty = async (partyID: string) => {
    this.logger.debug(`PartyRepository, deleteParty, partyID: ${partyID}`);
    return await this.mariaDB.deleteByColumn<PartyEntity>(Constants.PARTY_TABLE, { id: partyID });
  };

  public getPartyEntity = async (partyID: string) => {
    this.logger.debug(`PartyRepository, getPartyEntity, partyID: ${partyID}`);
    return await this.mariaDB.findbyID<PartyEntity>(Constants.PARTY_TABLE, partyID);
  };

  public getModifyParty = async (partyID: string) => {
    this.logger.debug(`PartyRepository, getModifyParty, partyID: ${partyID}`);
    return await this.mariaDB.executeQuery(getModifyPartyQuery.query, [partyID]);
  };

  public getPartyList = async (offset: number, itemCount: number) => {
    this.logger.debug(`PartyRepository, getPartyList, offset: ${offset}, itemCount: ${itemCount}`);
    return await this.mariaDB.executeQuery(getPartyListQuery.query, [offset, itemCount]);
  };

  public getPartyDetail = async (nickname: string, slug: string) => {
    this.logger.debug(`PartyRepository, getPartyDetail, nickname: ${nickname}, slug: ${slug}`);
    return await this.mariaDB.executeQuery(getPartyDetailQuery.query, [nickname, slug]);
  };

  public getPartyByTitle = async (nickname: string, partyTitle: string) => {
    this.logger.debug(`PartyRepository, getPartyByTitle, nickname: ${nickname}, partyTitle: ${partyTitle}`);
    return await this.mariaDB.executeQuery(getPartyByTitleQuery.query, [nickname, partyTitle]);
  };

  public getPartyListByBookID = async () => {
    this.logger.debug(`PartyRepository, getPartyListByBookID`);
  };

  public getParticipateParty = async (userID: number) => {
    this.logger.debug(`PartyRepository, getParticipateParty, userID: ${userID}`);
    return this.mariaDB.executeQuery(getParticipatePartyListQuery.query, [userID]);
  };

  // Participant

  public insertParticipant = async (userID: number, partyID: string, isOwner: boolean) => {
    this.logger.debug(
      `PartyRepository, insertParticipant, userID: ${userID}, partyID: ${partyID}, isOwner: ${isOwner}`
    );
    const isAccept = isOwner ? true : false;
    return await this.mariaDB.insertWithoutID<ParticipantEntity>(Constants.PARTICIPANT_TABLE, {
      userID,
      partyID,
      isOwner,
      isAccept,
    });
  };

  // TODO: Detail 페이지 밑에 보여줄 관련 목록
  public getParticipant = async (partyID: string) => {
    this.logger.debug(`PartyRepository, getParticipant`);
    return await this.mariaDB.findByColumn<ParticipantEntity>(Constants.PARTICIPANT_TABLE, { partyID });
  };

  public getParticipantEntity = async (findCondition: Partial<ParticipantEntity>) => {
    this.logger.debug(`PartyRepository, getParticipantEntity, findCondition: ${JSON.stringify(findCondition)}`);
    const foundList = await this.mariaDB.findByColumn<ParticipantEntity>(Constants.PARTICIPANT_TABLE, findCondition);
    return foundList[0];
  };

  public deleteParticipantEntity = async (findCondition: Partial<ParticipantEntity>) => {
    this.logger.debug(`PartyRepository, deleteParticipanEntityt, findCondition: ${JSON.stringify(findCondition)}`);
    return await this.mariaDB.deleteByColumn<ParticipantEntity>(Constants.PARTICIPANT_TABLE, findCondition);
  };

  // AvailableDay
  public insertAvailableDay = async (availableDayList: InsertAvailableDay[]) => {
    this.logger.debug(`PartyRepository, insertAvailableDay, availableDayList: ${JSON.stringify(availableDayList)}`);
    return await this.mariaDB.insertBulk<AvailableDayEntity>(Constants.AVAILABLE_DAY_TABLE, availableDayList);
  };

  public updateAvailableDay = async (partyID: string, updateCondition: Partial<AvailableDayEntity>) => {
    this.logger.debug(
      `PartyRepository, updateAvailableDay, partyID: ${partyID}, updateCondition: ${JSON.stringify(updateCondition)}`
    );
    return await this.mariaDB.updateByColumn<AvailableDayEntity>(
      Constants.AVAILABLE_DAY_TABLE,
      { partyID },
      updateCondition
    );
  };

  public deleteAvailableDay = async (partyID: string) => {
    this.logger.debug(`PartyRepository, deleteAvailableDay, partyID: ${partyID}`);
    await this.mariaDB.deleteByColumn<AvailableDayEntity>(Constants.AVAILABLE_DAY_TABLE, { partyID });
  };

  public getAvailableDay = async (partyID: string) => {
    this.logger.debug(`PartyRepository, getAvailableDay, partyID: ${partyID}`);
    return await this.mariaDB.executeQuery(getAvailableDayQuery.query, [partyID]);
  };

  public insertBook = async (context: BookContext) => {
    this.logger.debug(`PartyRepository, insertBook, context: ${JSON.stringify(context)}`);
    return await this.mariaDB.insert<BookEntity>(Constants.BOOK_TABLE, context);
  };

  public getBook = async (bookID: string) => {
    this.logger.debug(`PartyRepository, getBook, bookID: ${bookID}`);
    return await this.mariaDB.findbyID<BookEntity>(Constants.BOOK_TABLE, bookID);
  };

  public insertNotificationOpenChat = async (context: InsertNotificationContext) => {
    this.logger.debug(`PartyRepository, insertNotificationOpenChat, 
      context: ${JSON.stringify(context)}
      `);
    return await this.mariaDB.insertWithoutID<NotificationOpenChatEntity>(
      Constants.NOTIFICATION_OPEN_CHAT_TABLE,
      context
    );
  };

  public getNotificationOpenChatList = async (userID: number) => {
    this.logger.debug(`PartyRepository, getNotificationOpenChat, userID: ${userID}`);
    return await this.mariaDB.executeQuery(getNotificationOpenChatListQuery.query, [userID]);
  };

  public deleteNotificationOpenChat = async (findCondition: Partial<NotificationOpenChatEntity>) => {
    this.logger.debug(`PartyRepository, deleteNotificationOpenChat, findCondition: ${JSON.stringify(findCondition)}`);
    await this.mariaDB.deleteByColumn(Constants.NOTIFICATION_OPEN_CHAT_TABLE, findCondition);
  };
}
