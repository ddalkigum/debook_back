import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { getBookInfo } from '../../lib/api/kakao';
import { TYPES } from '../../type';
import { IPartyRepository, IPartyService, RegistPartyContext } from './interface';
import { IUserRepository } from '../user/interface';
import ErrorGenerator from '../../common/error';
import * as util from '../../util';

const ITEM_COUNT = 12;

@injectable()
export default class PartyService implements IPartyService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.Partyrepository) private partyRepository: IPartyRepository;
  @inject(TYPES.UserRepository) private userRepository: IUserRepository;

  public getMainCardList = async (page: number) => {
    this.logger.debug(`PartyService, getMainCardList`);

    const offset = page * ITEM_COUNT - ITEM_COUNT;
    const partyList = await this.partyRepository.getPartyList(offset, ITEM_COUNT);
    return partyList;
  };

  public getPartyDetail = async (nickname: string, URLSlug: string, userID?: number) => {
    this.logger.debug(`PartyService, getPartyDetail`);
    const foundPartyList = await this.partyRepository.getPartyDetail(nickname, URLSlug);

    if (!foundPartyList || foundPartyList.length === 0) {
      const error = ErrorGenerator.notFound();
      throw error;
    }

    const foundParty = foundPartyList[0];
    const availableDayList = await this.partyRepository.getAvailableDay(foundParty.partyID);
    const participantList = await this.partyRepository.getParticipant(foundParty.partyID);

    let isParticipant: boolean = false;
    let isOwner: boolean = false;

    if (userID) {
      const foundParticipant = participantList.find((participant) => participant.userID === userID);
      if (foundParticipant) {
        isParticipant = true;
        if (foundParticipant.isOwner) {
          isOwner = true;
        }
      }
    }

    const {
      partyID,
      partyTitle,
      slug,
      numberOfRecruit,
      isOnline,
      region,
      city,
      town,
      description,
      createdAt,
      updatedAt,
      ownerID,
      profileImage,
      bookID,
      bookTitle,
      bookThumbnail,
      authors,
    } = foundParty;

    return {
      owner: {
        id: ownerID,
        nickname,
        profileImage,
      },
      party: {
        id: partyID,
        title: partyTitle,
        slug,
        numberOfRecruit,
        isOnline,
        region,
        city,
        town,
        description,
        createdAt,
        updatedAt,
      },
      book: {
        id: bookID,
        title: bookTitle,
        thumbnail: bookThumbnail,
        authors,
      },
      participant: {
        isOwner,
        isParticipant,
        count: participantList.length,
      },
      availableDay: availableDayList,
    };
  };

  public getModifyParty = async (userID: number, partyID: string) => {
    this.logger.debug(`PartyService, getModifyParty`);
    const foundPartyList = await this.partyRepository.getModifyParty(partyID);
    const foundParty = foundPartyList[0];

    if (!foundParty) throw ErrorGenerator.notFound();
    if (foundParty.ownerID !== userID) throw ErrorGenerator.notFound();

    const foundAvailableDayList = await this.partyRepository.getAvailableDay(partyID);
    const availableDayList = foundAvailableDayList.map((availableDay) => {
      return availableDay.dayID;
    });

    const {
      partyTitle,
      numberOfRecruit,
      openChatURL,
      openChatPassword,
      isOnline,
      region,
      city,
      town,
      description,
      bookID,
      bookTitle,
      bookThumbnail,
      authors,
    } = foundParty;

    return {
      party: {
        id: foundParty.partyID,
        title: partyTitle,
        numberOfRecruit,
        openChatURL,
        openChatPassword,
        isOnline,
        region,
        city,
        town,
        description,
      },
      book: {
        id: bookID,
        title: bookTitle,
        thumbnail: bookThumbnail,
        authors,
      },
      availableDayList,
    };
  };

  public deleteParty = async (partyID: string) => {
    this.logger.debug(`PartyService, deleteParty`);
    const foundParty = await this.partyRepository.getPartyEntity(partyID);
    if (!foundParty) throw ErrorGenerator.badRequest('DoesNotExistParty');

    await this.partyRepository.deleteParty(partyID);
    return 'Success';
  };

  public getRelationPartyList = async (bookID: string) => {
    const partyList = await this.partyRepository.getPartyListByBookID(bookID);

    // FIXME: 현재 보고있는 페이지는 안보여야 함 filter추가
    return partyList;
  };

  public getParticipatePartyList = async (userID: number) => {
    const result = await this.partyRepository.getParticipateParty(userID);
    return result;
  };

  public registParty = async (context: RegistPartyContext) => {
    const partyID = util.uuid.generageUUID();
    const { party, book, ownerID, availableDay } = context;

    const foundUser = await this.userRepository.getUserByID(ownerID);

    const { id, title, thumbnail, authors } = book;
    const foundBook = await this.partyRepository.getBook(book.id);
    if (!foundBook) await this.partyRepository.insertBook({ id, title, thumbnail, authors: authors.join(', ') });

    if (!foundUser) {
      const error = ErrorGenerator.unAuthorized('UserNotFound');
      throw error;
    }

    const foundParty = await this.partyRepository.getPartyByTitle(foundUser.nickname, party.title);
    const convertedTitle = party.title.replace(/\?/g, '').replace(/ /g, '-');
    party.slug = convertedTitle;

    if (foundParty && foundParty.length > 0) {
      const slug = util.hex.generateURLSlug();
      party.slug = `${convertedTitle}-${slug}`;
    }

    const insertedParty = await this.partyRepository.insertParty({ id: partyID, ...party, ownerID, bookID: book.id });
    const insertDayList = availableDay.map((day) => {
      return {
        partyID: insertedParty.id,
        dayID: day,
      };
    });

    await this.partyRepository.insertParticipant(ownerID, insertedParty.id, true);
    await this.partyRepository.insertAvailableDay(insertDayList);
    return context;
  };

  public updateParty = async (partyID: string, context: RegistPartyContext) => {
    this.logger.debug(`PartyService, updateParty`);

    // get available day
    const availableDayList = await this.partyRepository.getAvailableDay(partyID);

    if (availableDayList.length) {
      await this.partyRepository.deleteAvailableDay(partyID);
    }

    const insertList = context.availableDay.map((day) => {
      return { partyID, dayID: day };
    });

    await this.partyRepository.insertAvailableDay(insertList);

    // party update
    await this.partyRepository.updateParty(partyID, { ...context.party, bookID: context.book.id });
    return 'Success';
  };

  public joinParty = async (userID: number, partyID: string) => {
    this.logger.debug(`PartyService, registParticipate`);
    const foundParty = await this.partyRepository.getPartyEntity(partyID);
    const participantList = await this.partyRepository.getParticipant(partyID);

    // 보고있던 그룹이 삭제된 경우
    if (!foundParty) {
      throw ErrorGenerator.notFound();
    }

    // 모집 완료
    if (foundParty.numberOfRecruit <= participantList.length) {
      return 'EndOfRecruit';
    }

    const isParticipant = participantList.find((participant) => {
      return participant.userID === userID;
    });

    if (isParticipant) {
      throw ErrorGenerator.badRequest('AlreadyRequestParticpate');
    }

    const participant = await this.partyRepository.insertParticipant(userID, partyID, false);
    return participant;
  };

  public searchBook = async (title: string, page: number) => {
    this.logger.debug(`PartyService, searchBook, title: ${title}`);
    const result = await getBookInfo(title, page);
    const bookList = result.documents.map((book) => {
      const { authors, thumbnail, title, isbn } = book;
      return { id: isbn, authors, thumbnail, title };
    });

    const isEnd = result.meta.is_end;
    const nextPage = isEnd ? undefined : page + 1;
    const lastPage = Math.ceil(result.meta.pageable_count / 10);

    return { bookList, meta: { page, nextPage, isEnd, lastPage } };
  };

  public registNotification = async (userID: number, partyID: string) => {
    // found party
    const foundParty = await this.partyRepository.getPartyEntity(partyID);
    if (!foundParty) {
      const error = ErrorGenerator.notFound();
      throw error;
    }

    // found party , openchat column -> insert noti
    const notificationID = util.uuid.generageUUID();
    return await this.partyRepository.insertNotificationOpenChat({
      id: notificationID,
      userID,
      partyID,
    });
  };

  // TODO: send email to owner
  public getOpenCharNotification = async (userID: number) => {
    const foundNotificationList = await this.partyRepository.getNotificationOpenChatList(userID);
    return foundNotificationList.map((noti) => {
      const { notificationID, title, partyID, openChatURL, openChatPassword, bookID, thumbnail } = noti;
      return {
        notification: { id: notificationID },
        party: {
          id: partyID,
          title,
          openChatURL,
          openChatPassword,
        },
        book: {
          id: bookID,
          thumbnail,
        },
      };
    });
  };

  public cancelJoin = async (userID: number, partyID: string) => {
    const foundParticipant = await this.partyRepository.getParticipantEntity({ userID, partyID });
    if (!foundParticipant) throw ErrorGenerator.badRequest('DoesNotExistParticipant');
    // delete participant
    await this.partyRepository.deleteNotificationOpenChat({ partyID }),
      await this.partyRepository.deleteParticipantEntity({ userID, partyID });
    return 'Success';
  };
}
