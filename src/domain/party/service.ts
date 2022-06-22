import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { getBookInfo } from '../../lib/api/kakao';
import { TYPES } from '../../type';
import { IPartyRepository, IPartyService, RegistPartyContext } from './interface';
import { IUserRepository } from '../user/interface';
import ErrorGenerator from '../../common/error';
import * as util from '../../util';

@injectable()
export default class PartyService implements IPartyService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.Partyrepository) private partyRepository: IPartyRepository;
  @inject(TYPES.UserRepository) private userRepository: IUserRepository;

  public getMainCardList = async () => {
    this.logger.debug(`PartyService, getMainCardList`);
    const partyList = await this.partyRepository.getPartyList();

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
    let isParticipant = false;

    const foundParticipant = participantList.find((participant) => participant.userID === userID);
    if (foundParticipant) isParticipant = true;

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
        isParticipant,
        count: participantList.length,
      },
      availableDay: availableDayList,
    };
  };

  public getRelationPartyList = async (bookID: string) => {
    const partyList = await this.partyRepository.getPartyListByBookID(bookID);

    // FIXME: 현재 보고있는 페이지는 안보여야 함 filter추가
    return partyList;
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
    console.log(foundParty);
    const convertedTitle = party.title.replace(/\?/g, '').replace(/ /g, '-');
    party.slug = convertedTitle;

    if (foundParty) {
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
    // 참가 인원에 admin 추가
    await this.partyRepository.insertParticipant(ownerID, insertedParty.id, true);
    await this.partyRepository.insertAvailableDay(insertDayList);
    return context;
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
}