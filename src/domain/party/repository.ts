import { inject, injectable } from 'inversify';
import { Constants } from '../../constants';
import BookEntity from '../../infrastructure/database/maria/entity/party/book';
import PartyEntity from '../../infrastructure/database/maria/entity/party/party';
import AvailableDayEntity from '../../infrastructure/database/maria/entity/party/availableDay';
import { IMariaDB } from '../../infrastructure/database/maria/interface';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { BookContext, IPartyRepository, InsertParty, Day, InsertAvailableDay } from './interface';
import {
  getAvailableDayQuery,
  getPartyByTitleQuery,
  getPartyDetailQuery,
  getPartyListQuery,
  getParticipatePartyListQuery,
  updateNumberOfParticipantCountQuery,
} from './query';
import ParticipantEntity from '../../infrastructure/database/maria/entity/party/participant';

@injectable()
export default class PartyRepository implements IPartyRepository {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.MariaDB) private mariaDB: IMariaDB;

  // 메인 페이지 카드
  public getPartyList = async () => {
    this.logger.debug(`PartyRepository, getPartyList`);
    return await this.mariaDB.executeQuery(getPartyListQuery.query);
  };

  public getPartyDetail = async (nickname: string, partyTitle: string) => {
    this.logger.debug(`PartyRepository, getPartyDetail, nickname: ${nickname}, partyTitle: ${partyTitle}`);
    return await this.mariaDB.executeQuery(getPartyDetailQuery.query, [nickname, partyTitle]);
  };

  public getPartyByTitle = async (nickname: string, partyTitle: string) => {
    this.logger.debug(`PartyRepository, getPartyByTitle, nickname: ${nickname}, partyTitle: ${partyTitle}`);
    return await this.mariaDB.executeQuery(getPartyByTitleQuery.query, [nickname, partyTitle]);
  };

  public getAvailableDay = async (partyID: string) => {
    this.logger.debug(`PartyRepository, getAvailableDay, partyID: ${partyID}`);
    return await this.mariaDB.executeQuery(getAvailableDayQuery.query, [partyID]);
  };

  public getParticipant = async (partyID: string) => {
    this.logger.debug(`PartyRepository, getParticipant`);
    return await this.mariaDB.findByColumn<ParticipantEntity>(Constants.PARTICIPANT_TABLE, { partyID });
  };

  // TODO: Detail 페이지 밑에 보여줄 관련 목록
  public getPartyListByBookID = async () => {
    this.logger.debug(`PartyRepository, getPartyListByBookID`);
  };

  public getParticipateParty = async (userID: number) => {
    this.logger.debug(`PartyRepository, getParticipateParty, userID: ${userID}`);
    return this.mariaDB.executeQuery(getParticipatePartyListQuery.query, [userID]);
  };

  public insertParty = async (context: InsertParty): Promise<InsertParty> => {
    this.logger.debug(`PartyRepository, insertParty, context: ${JSON.stringify(context)}`);
    return await this.mariaDB.insert<PartyEntity>(Constants.PARTY_TABLE, { ...context, numberOfParticipant: 1 });
  };

  public insertBook = async (context: BookContext) => {
    this.logger.debug(`PartyRepository, insertBook, context: ${JSON.stringify(context)}`);
    return await this.mariaDB.insert<BookEntity>(Constants.BOOK_TABLE, context);
  };

  public getBook = async (bookID: string) => {
    this.logger.debug(`PartyRepository, getBook, bookID: ${bookID}`);
    return await this.mariaDB.findbyID<BookEntity>(Constants.BOOK_TABLE, bookID);
  };

  public insertAvailableDay = async (availableDayList: InsertAvailableDay[]) => {
    this.logger.debug(`PartyRepository, insertAvailableDay, availableDayList: ${JSON.stringify(availableDayList)}`);
    return await this.mariaDB.insertBulk<AvailableDayEntity>(Constants.AVAILABLE_DAY_TABLE, availableDayList);
  };

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

  public updateParticipantCount = async (partyID: string) => {
    this.logger.debug(`PartyRepository, updateParty, partyID: ${partyID}}`);
    return await this.mariaDB.executeQuery(updateNumberOfParticipantCountQuery.query, [partyID]);
  };
}
