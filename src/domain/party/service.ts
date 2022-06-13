import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { getBookInfo } from '../../lib/api/kakao';
import { TYPES } from '../../type';
import { IPartyRepository, IPartyService, RegistPartyContext } from './interface';
import * as util from '../../util';
import { IUserRepository } from '../user/interface';
import ErrorGenerator from '../../common/error';

@injectable()
export default class PartyService implements IPartyService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.Partyrepository) private partyRepository: IPartyRepository;
  @inject(TYPES.UserRepository) private userRepository: IUserRepository;

  public getMainCardList = async () => {
    this.logger.debug(`PartyService, getMainCardList`);
    return await this.partyRepository.getPartyList();
  };

  public getPartyDetail = async (nickname: string, partyTitle: string, userID?: number) => {
    this.logger.debug(`PartyService, getPartyDetail, nickname: ${nickname}, partyTitle: ${partyTitle}`);
    const foundPartyList = await this.partyRepository.getPartyDetail(nickname, partyTitle);

    if (!foundPartyList || foundPartyList.length === 0) {
      const error = ErrorGenerator.notFound();
      throw error;
    }

    const foundParty = foundPartyList[0];
    const availableDayList = await this.partyRepository.getAvailableDay(foundParty.partyID);
    const participantList: any[] = await this.partyRepository.getParticipant(foundParty.partyID);
    let isParticipant = false;

    const foundParticipant = participantList.find((participant) => participant.userID === userID);
    if (foundParticipant) isParticipant = true;

    const {
      partyID,
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
        numberOfRecruit,
        isOnline,
        region,
        city,
        town,
        description,
        createdAt,
        updatedAt,
        availableDayList,
        participant: isParticipant ? foundParticipant : undefined,
      },
      book: {
        bookID,
        bookTitle,
        bookThumbnail,
        authors,
      },
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
    if (!foundBook) await this.partyRepository.insertBook({ id, title, thumbnail, authors: authors[0] });

    // block party title duplicate
    // FIXME: nickname, title로 찾아올때 URLSlug 이용 확인 추가
    const foundParty = await this.partyRepository.getPartyByTitle(foundUser.nickname, party.title);
    if (foundParty || foundParty.length === 1) {
      const error = ErrorGenerator.badRequest('DuplicateTitle');
      throw error;
    }

    await this.partyRepository.insertParty({ id: partyID, ...party, ownerID, bookID: book.id });
    await Promise.all(
      availableDay.map((day) => {
        this.partyRepository.insertAvailableDay(day, party.id);
      })
    );
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
