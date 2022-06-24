import { Constants } from '../../../constants';
import { container } from '../../../container';
import { IMariaDB } from '../../../infrastructure/database/maria/interface';
import { TYPES } from '../../../type';
import { IUserRepository } from '../../user/interface';
import { IPartyRepository, InsertParty } from '../interface';
import * as util from '../../../util';
import { IWinstonLogger } from '../../../infrastructure/logger/interface';

const partyRepository: IPartyRepository = container.get(TYPES.Partyrepository);
const userRepository: IUserRepository = container.get(TYPES.UserRepository);
const winstonLogger: IWinstonLogger = container.get(TYPES.WinstonLogger);
const mariaDB: IMariaDB = container.get(TYPES.MariaDB);

beforeAll(async () => {
  jest.spyOn(winstonLogger, 'debug').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'warn').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'info').mockImplementation(() => {});
  await mariaDB.init();
});

afterAll(async () => {
  await mariaDB.deleteAll(Constants.PARTICIPANT_TABLE);
  await mariaDB.deleteAll(Constants.AVAILABLE_DAY_TABLE);
  await mariaDB.deleteAll(Constants.PARTY_TABLE);
  await mariaDB.deleteAll(Constants.BOOK_TABLE);
  await mariaDB.deleteAll(Constants.USER_TABLE);
  await mariaDB.destroy();
});

const owner = { email: 'partytest@email.com', nickname: '딸기검', profileImage: 'https://...' };
const book = { id: '123 234', title: 'testBook', authors: ['딸기검'], thumbnail: 'https://...' };
const authorListBook = {
  id: '1234 2345',
  title: 'authorsTest',
  authors: ['딸기검', '참외검'],
  thumbnail: 'https://...',
};
const availableDayList = ['mon', 'fri'];

const onlineParty: InsertParty = {
  id: util.uuid.generageUUID(),
  title: '제목제목',
  slug: undefined,
  numberOfRecruit: 4,
  numberOfParticipant: 1,
  openChatURL: 'https://open.kakao.com/o/',
  openChatPassword: '1234',
  isOnline: true,
  description: 'test description',
  ownerID: undefined,
  bookID: '123 234',
};

describe('Party test', () => {
  beforeAll(async () => {
    const insertResult = await userRepository.insertUser(owner.email, owner.nickname, owner.profileImage);
    onlineParty.ownerID = insertResult.id;
    await partyRepository.insertBook({
      id: book.id,
      title: book.title,
      authors: book.authors.join('/'),
      thumbnail: book.thumbnail,
    });
  });

  test('InsertParty, Should return party context', async () => {
    const partyContext = onlineParty;
    const insertResult = await partyRepository.insertParty(partyContext);
    expect(insertResult).toEqual(partyContext);
  });

  test('GetPartyDetail, Should return party include owner data', async () => {
    const foundParty = await partyRepository.getPartyDetail(owner.nickname, onlineParty.title);
    expect(foundParty[0].partyID).toEqual(onlineParty.id);
    expect(foundParty[0].ownerID).toEqual(onlineParty.ownerID);
    expect(foundParty[0].bookID).toEqual(onlineParty.bookID);
  });

  test('GetPartyList, Should return party list', async () => {
    const partyList = await partyRepository.getPartyList();
    expect(partyList).toHaveLength(1);
  });

  test('InsertAvailableDay, Should return available day list', async () => {
    const insertList = availableDayList.map((day) => {
      return { dayID: day, partyID: onlineParty.id };
    });

    const result = await partyRepository.insertAvailableDay(insertList);

    result.map((value, index) => {
      expect(value.dayID).toEqual(availableDayList[index]);
    });
  });

  test('GetAvailableDay, return availableDay', async () => {
    const result = await partyRepository.getAvailableDay(onlineParty.id);
    result.map((value, index) => {
      expect(value.dayID).toEqual(availableDayList[index]);
    });
  });

  test('InsertBook, return book', async () => {
    const { id, title, thumbnail, authors } = authorListBook;
    const result = await partyRepository.insertBook({ id, title, thumbnail, authors: authors.join('/') });
    expect(result.id).toEqual(id);
  });

  test('GetBook, return book', async () => {
    const result = await partyRepository.getBook(book.id);
    expect(result.id).toEqual(book.id);
    expect(result.authors.split('/')).toHaveLength(1);
  });

  test('GetBook, authorList join test', async () => {
    const result = await partyRepository.getBook(authorListBook.id);
    expect(result.authors.split('/')).toHaveLength(2);
  });

  test('InsertParticipant', async () => {
    const participant = { email: 'first@email.com', nickname: '참외검', profileImage: 'https://...' };
    const secondParticipant = { email: 'second@email.com', nickname: '참외검', profileImage: 'https://...' };

    const userInsertResult = await userRepository.insertUser(
      participant.email,
      participant.nickname,
      participant.profileImage
    );

    const result = await partyRepository.insertParticipant(userInsertResult.id, onlineParty.id, false);
    expect(result.isAccept).toBeFalsy();
    expect(result.isOwner).toBeFalsy();
  });

  test('GetPartyList, check number of participant', async () => {
    const partyList = await partyRepository.getPartyList();
    expect(Number(partyList[0].numberOfParticipant)).toEqual(1);
  });
});
