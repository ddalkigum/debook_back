import request from 'supertest';
import aws from 'aws-sdk';
import { container } from '../../../container';
import { IServer } from '../../../infrastructure/express/interface';
import { IWinstonLogger } from '../../../infrastructure/logger/interface';
import { TYPES } from '../../../type';
import { IAuthRepository } from '../../auth/interface';
import * as util from '../../../util';
import * as config from '../../../config';
import * as KakaoApi from '../../../lib/api/kakao';
import { IUserRepository } from '../../user/interface';
import { GetPartyDetail, IPartyRepository } from '../interface';
import PartyEntity from '../../../infrastructure/database/maria/entity/party/party';
import ParticipantEntity from '../../../infrastructure/database/maria/entity/party/participant';
import { ISES } from '../../../infrastructure/aws/ses/interface';

const express = container.get<IServer>(TYPES.Server);
const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
const authRepository = container.get<IAuthRepository>(TYPES.AuthRepository);
const partyRepository = container.get<IPartyRepository>(TYPES.Partyrepository);
const winstonLogger = container.get<IWinstonLogger>(TYPES.WinstonLogger);
const sesClient = container.get<ISES>(TYPES.SES);

// Mock
const getBookInfo = jest.spyOn(KakaoApi, 'getBookInfo');
const getPartyEntity = jest.spyOn(partyRepository, 'getPartyEntity');
const getParticipant = jest.spyOn(partyRepository, 'getParticipant');
const insertParticipant = jest.spyOn(partyRepository, 'insertParticipant');
const getParticipateParty = jest.spyOn(partyRepository, 'getParticipateParty');
const getParticipantEntity = jest.spyOn(partyRepository, 'getParticipantEntity');
const deleteNotificationOpenChat = jest.spyOn(partyRepository, 'deleteNotificationOpenChat');
const deleteParticipantEntity = jest.spyOn(partyRepository, 'deleteParticipantEntity');
const getPartyList = jest.spyOn(partyRepository, 'getPartyList');
const getModifyParty = jest.spyOn(partyRepository, 'getModifyParty');
const getAvailableDay = jest.spyOn(partyRepository, 'getAvailableDay');
const insertNotificationOpenChat = jest.spyOn(partyRepository, 'insertNotificationOpenChat');
const getNotificationOpenChatList = jest.spyOn(partyRepository, 'getNotificationOpenChatList');
const getUserByID = jest.spyOn(userRepository, 'getUserByID');
const getBook = jest.spyOn(partyRepository, 'getBook');
const insertBook = jest.spyOn(partyRepository, 'insertBook');
const getPartyByTitle = jest.spyOn(partyRepository, 'getPartyByTitle');
const insertParty = jest.spyOn(partyRepository, 'insertParty');
const insertAvailableDay = jest.spyOn(partyRepository, 'insertAvailableDay');
const deleteAvailableDay = jest.spyOn(partyRepository, 'deleteAvailableDay');
const updateParty = jest.spyOn(partyRepository, 'updateParty');
const getPartyDetail = jest.spyOn(partyRepository, 'getPartyDetail');
const deleteParty = jest.spyOn(partyRepository, 'deleteParty');
const upload = jest.spyOn(new aws.S3(), 'upload');
const sendJoinEmail = jest.spyOn(sesClient, 'sendJoinEmail');

express.set();
const app = express.getServer();

const tokenID = util.uuid.generageUUID();
const tokenSet = util.token.getAuthTokenSet({ userID: 1, tokenID }, config.authConfig.issuer);
const participantTokenSet = util.token.getAuthTokenSet({ userID: 2, tokenID }, config.authConfig.issuer);

const testUser = {
  id: 1,
  email: 'test@user.com',
  nickname: 'test',
  profileImage: 'https://cdn.debook.me/image/party/%EB%94%B8%EA%B8%B0%EA%B2%80/52be9e12-2623-4475-ada6-75c37e8e8ed1',
  createdAt: new Date(Date.now()),
  updatedAt: new Date(Date.now()),
};

const partyID = util.uuid.generageUUID();
const basePartyEntity: Omit<PartyEntity, 'isOnline' | 'region' | 'city' | 'town'> = {
  id: partyID,
  title: 'testTitle',
  slug: 'testSlug',
  numberOfRecruit: 2,
  openChatURL: 'https://open.kakao.com/o/testurl',
  openChatPassword: '1234',
  description: '<p>adsf</p>',
  ownerID: 1,
  bookID: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testRegistParty = {
  title: 'testTitle',
  numberOfRecruit: 2,
  openChatURL: 'https://open.kakao.com/o/testurl',
  openChatPassword: '1234',
  description: '<p>adsf</p>',
  isOnline: true,
};

const testRegistBook = {
  id: util.uuid.generageUUID(),
  title: 'testTitle',
  authors: ['test', 'authors'],
  thumbnail: 'testThumbnail',
};

const testParty = {
  online: { ...basePartyEntity, isOnline: true },
  offline: { ...basePartyEntity, isOnline: false, region: '서울시', city: '강남구', town: '삼성동' },
};

const baseParticipant: Omit<ParticipantEntity, 'isOwner' | 'userID'> = {
  id: 1,
  isAccept: false,
  partyID,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testParticipant = {
  owner: { ...baseParticipant, isOwner: true, userID: 1 },
  join: { ...baseParticipant, isOwner: false, userID: 2 },
};

const testPartyDetail: GetPartyDetail = {
  partyID,
  partyTitle: 'testTitle',
  ...testParty.online,
  nickname: 'testUser',
  profileImage: 'https://cdn.debook.me/',
  bookTitle: 'testBook',
  bookThumbnail: 'https://...',
  authors: '딸기검, 참외검',
  numberOfParticipant: 2,
};

const searchBookResponse = {
  documents: [
    {
      authors: ['testAuthors'],
      contents: 'testContents',
      thumbnail: 'testThumbnail',
      publisher: 'testPublisher',
      title: 'testTitle',
      isbn: 'testIsbn',
    },
  ],
  meta: {
    is_end: true,
    pageable_count: 1,
    total_count: 2,
  },
};

const testBookEntity = {
  id: util.uuid.generageUUID(),
  title: 'testTitle',
  authors: 'test, authors',
  thumbnail: 'testThumbnail',
};

const testAvailableDay = [
  { id: 1, dayID: 'mon', partyID: testParty.online.id },
  { id: 2, dayID: 'tue', partyID: testParty.online.id },
];

const testOpenChatNoti = {
  online: {
    id: util.uuid.generageUUID(),
    userID: 2,
    partyID: testParty.online.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

beforeAll(() => {
  jest.spyOn(winstonLogger, 'debug').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'warn').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'info').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'http').mockImplementation(() => {});
});

afterAll(() => {
  jest.clearAllMocks();
});

describe('Search book test', () => {
  test('Success', () => {
    getBookInfo.mockResolvedValueOnce(searchBookResponse);

    return request(app)
      .get('/v1/party/search/book')
      .query({ title: 'testBook', page: 1 })
      .expect((response) => {
        const { bookList, meta } = response.body.result;
        expect(bookList.length).toEqual(1);
        expect(meta.isEnd).toBeTruthy();
        expect(meta.page).toEqual(1);
      });
  });

  test('Fail - Does not exist book', () => {
    getBookInfo.mockResolvedValueOnce({ documents: [], meta: null });

    return request(app)
      .get('/v1/party/search/book')
      .query({ title: 'testBook', page: 1 })
      .expect((response) => {
        expect(response.body.result.bookList).toHaveLength(0);
      });
  });
});

describe('Party join test', () => {
  getUserByID.mockResolvedValueOnce(testUser);

  test('Success', () => {
    getPartyEntity.mockResolvedValueOnce(testParty.online);
    getParticipant.mockResolvedValueOnce([]);
    insertParticipant.mockResolvedValueOnce(testParticipant.join);
    sendJoinEmail.mockResolvedValueOnce(null);

    return request(app)
      .post('/v1/party/join')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .send({ partyID })
      .expect((response) => {
        const { userID, partyID, isOwner } = response.body.result;
        expect(userID).toEqual(testParticipant.join.userID);
        expect(partyID).toEqual(testParticipant.join.partyID);
        expect(isOwner).toEqual(testParticipant.join.isOwner);
      });
  });

  test('Fail - DoesNotExistParty', () => {
    getPartyEntity.mockResolvedValueOnce(undefined);

    return request(app)
      .post('/v1/party/join')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .send({ partyID })
      .expect((response) => {
        const { name, message } = response.body.result;
        expect(name).toEqual('BadRequest');
        expect(message).toEqual('DoesNotExistParty');
      });
  });

  test('Fail - EndOfRecruit', () => {
    getPartyEntity.mockResolvedValueOnce(testParty.online);
    getParticipant.mockResolvedValueOnce([testParticipant.join, testParticipant.join]);

    return request(app)
      .post('/v1/party/join')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .send({ partyID })
      .expect((response) => {
        const { name, message } = response.body.result;
        expect(name).toEqual('BadRequest');
        expect(message).toEqual('EndOfRecruit');
      });
  });

  test('Fail - AlreadyRequestParticpate', () => {
    getPartyEntity.mockResolvedValueOnce(testParty.online);
    getParticipant.mockResolvedValueOnce([testParticipant.owner]);

    return request(app)
      .post('/v1/party/join')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .send({ partyID })
      .expect((response) => {
        const { name, message } = response.body.result;
        expect(name).toEqual('BadRequest');
        expect(message).toEqual('AlreadyRequestParticpate');
      });
  });
});

describe('Get participate party list', () => {
  test('Success', () => {
    getParticipateParty.mockResolvedValueOnce([testPartyDetail]);
    return request(app)
      .get('/v1/party/participate/1')
      .expect((response) => {
        const { partyID, partyTitle, slug } = response.body.result[0];

        expect(partyTitle).toEqual(testPartyDetail.partyTitle);
        expect(partyID).toEqual(testPartyDetail.partyID);
        expect(slug).toEqual(testPartyDetail.slug);
      });
  });
});

describe('Cancel join', () => {
  test('Success', () => {
    getParticipantEntity.mockResolvedValueOnce(testParticipant.join);
    deleteNotificationOpenChat.mockResolvedValueOnce();
    deleteParticipantEntity.mockResolvedValueOnce();

    return request(app)
      .delete(`/v1/party/participate/${partyID}`)
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        expect(response.body.result).toEqual('Success');
      });
  });

  test('Fail - DoesNotExistParticipant', () => {
    getParticipantEntity.mockResolvedValueOnce(null);

    return request(app)
      .delete(`/v1/party/participate/${partyID}`)
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        const { name, message } = response.body.result;
        expect(name).toEqual('BadRequest');
        expect(message).toEqual('DoesNotExistParticipant');
      });
  });
});

describe('Get main card list', () => {
  test('Success', () => {
    getPartyList.mockResolvedValueOnce([testPartyDetail]);

    return request(app)
      .get('/v1/party/recent')
      .query({ page: 1 })
      .expect((response) => {
        const { partyID, partyTitle, slug } = response.body.result[0];
        expect(partyTitle).toEqual(testPartyDetail.partyTitle);
        expect(partyID).toEqual(testPartyDetail.partyID);
        expect(slug).toEqual(testPartyDetail.slug);
      });
  });
});

describe('Get party condition for modify', () => {
  test('Success', () => {
    getModifyParty.mockResolvedValueOnce([testPartyDetail]);
    getAvailableDay.mockResolvedValueOnce(testAvailableDay);

    return request(app)
      .get(`/v1/party/modify?id=${testParty.online.id}`)
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        const { party, book, availableDayList } = response.body.result;
        expect(party.id).toEqual(testParty.online.id);
        expect(party.title).toEqual(testParty.online.title);
        expect(book.id).toEqual(testParty.online.bookID);
        expect(availableDayList).toEqual(testAvailableDay.map((day) => day.dayID));
      });
  });

  test('Fail - NotFound', () => {
    getModifyParty.mockResolvedValueOnce([]);

    return request(app)
      .get(`/v1/party/modify?id=${testParty.online.id}`)
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        const { name, message } = response.body.result;
        expect(name).toEqual('NotFound');
        expect(message).toEqual('NotFound');
      });
  });

  test('Fail - NotTheOwner', () => {
    getModifyParty.mockResolvedValueOnce([{ ownerID: 2 }]);

    return request(app)
      .get(`/v1/party/modify?id=${testParty.online.id}`)
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        const { name, message } = response.body.result;
        expect(name).toEqual('Forbidden');
        expect(message).toEqual('NotTheOwner');
      });
  });
});

describe('Create notification', () => {
  const { id, userID, partyID } = testOpenChatNoti.online;

  test('Success', () => {
    getPartyEntity.mockResolvedValueOnce(testParty.online);
    insertNotificationOpenChat.mockResolvedValueOnce({ id, userID, partyID });

    return request(app)
      .post('/v1/party/notification')
      .send({ partyID: testParty.online.id })
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        expect(response.body.result).toEqual({ id, userID, partyID });
      });
  });

  test('Fail - DoesNotExistParty', () => {
    getPartyEntity.mockResolvedValueOnce(null);

    return request(app)
      .post('/v1/party/notification')
      .send({ partyID: testParty.online.id })
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        const { name, message } = response.body.result;
        expect(name).toEqual('BadRequest');
        expect(message).toEqual('DoesNotExistParty');
      });
  });
});

describe('Get notification', () => {
  const notificationCard = {
    notificationID: testOpenChatNoti.online.id,
    title: testParty.online.title,
    partyID: testParty.online.id,
    openChatURL: testParty.online.openChatURL,
    openChatPassword: testParty.online.openChatPassword,
    bookID: searchBookResponse.documents[0].isbn,
    thumbnail: searchBookResponse.documents[0].thumbnail,
  };

  test('Success', () => {
    getNotificationOpenChatList.mockResolvedValueOnce([notificationCard]);

    return request(app)
      .get('/v1/party/notification')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        const { notification, party, book } = response.body.result[0];
        expect(notification.id).toEqual(notificationCard.notificationID);
        expect(party.id).toEqual(notificationCard.partyID);
        expect(book.thumbnail).toEqual(notificationCard.thumbnail);
      });
  });

  test('Fail - NotFound', () => {
    getNotificationOpenChatList.mockResolvedValueOnce([]);

    return request(app)
      .get('/v1/party/notification')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        expect(response.body.result).toHaveLength(0);
      });
  });
});

describe('Get relation party list', () => {});

describe('Regist party', () => {
  test('Success', () => {
    getUserByID.mockResolvedValueOnce(testUser);
    getBook.mockResolvedValueOnce(testBookEntity);
    getPartyByTitle.mockResolvedValueOnce([testParty.online]);
    insertParty.mockResolvedValueOnce(testParty.online);
    insertParticipant.mockResolvedValueOnce(testParticipant.owner);
    insertAvailableDay.mockResolvedValueOnce([]);

    return request(app)
      .post('/v1/party/regist')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .send({
        party: testRegistParty,
        book: testRegistBook,
        userID: testUser.id,
        availableDay: testAvailableDay.map((day) => day.dayID),
      })
      .expect((response) => {
        expect(response.body.status).toEqual('Success');
      });
  });
});

describe('Update party', () => {
  test('Success', () => {
    getAvailableDay.mockResolvedValueOnce([]);
    deleteAvailableDay.mockResolvedValueOnce();
    insertAvailableDay.mockResolvedValueOnce([]);
    updateParty.mockResolvedValueOnce(testRegistParty);

    return request(app)
      .patch('/v1/party/update')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .send({
        partyID: testParty.online.id,
        party: testRegistParty,
        book: testRegistBook,
        userID: testUser.id,
        availableDay: testAvailableDay.map((day) => day.dayID),
      })
      .expect((response) => {
        expect(response.body.status).toEqual('Success');
      });
  });
});

describe('Get party detail', () => {
  test('Success -  user not logged in', () => {
    getPartyDetail.mockResolvedValueOnce([testPartyDetail]);
    getAvailableDay.mockResolvedValueOnce(testAvailableDay);
    getParticipant.mockResolvedValueOnce([testParticipant.join]);

    return request(app)
      .get(`/v1/party/${testUser.nickname}/${testParty.online.slug}`)
      .expect((response) => {
        const { status, result } = response.body;
        expect(result.participant.isOwner).toEqual(false);
        expect(result.participant.count).toEqual(1);
      });
  });

  test('Success -  owner logged in', () => {
    getPartyDetail.mockResolvedValueOnce([testPartyDetail]);
    getAvailableDay.mockResolvedValueOnce(testAvailableDay);
    getParticipant.mockResolvedValueOnce([testParticipant.owner]);

    return request(app)
      .get(`/v1/party/${testUser.nickname}/${testParty.online.slug}`)
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        const { status, result } = response.body;
        expect(result.participant.isOwner).toEqual(true);
        expect(result.participant.isParticipant).toEqual(true);
        expect(result.participant.count).toEqual(1);
      });
  });

  test('Success -  participant logged in', () => {
    getPartyDetail.mockResolvedValueOnce([testPartyDetail]);
    getAvailableDay.mockResolvedValueOnce(testAvailableDay);
    getParticipant.mockResolvedValueOnce([testParticipant.owner, testParticipant.join]);

    return request(app)
      .get(`/v1/party/${testUser.nickname}/${testParty.online.slug}`)
      .set('Cookie', `accessToken=${participantTokenSet.accessToken}`)
      .expect((response) => {
        const { status, result } = response.body;
        expect(result.participant.isOwner).toEqual(false);
        expect(result.participant.isParticipant).toEqual(true);
        expect(result.participant.count).toEqual(2);
      });
  });

  test('Fail - NotFound', () => {
    getPartyDetail.mockResolvedValueOnce([]);

    return request(app)
      .get(`/v1/party/${testUser.nickname}/${testParty.online.slug}`)
      .set('Cookie', `accessToken=${participantTokenSet.accessToken}`)
      .expect((response) => {
        const { name, message } = response.body.result;
        expect(name).toEqual('NotFound');
        expect(message).toEqual('NotFound');
      });
  });
});

describe('Delete party', () => {
  test('Success', () => {
    getPartyEntity.mockResolvedValueOnce(testParty.online);
    deleteNotificationOpenChat.mockResolvedValueOnce(null);
    deleteParty.mockResolvedValueOnce();

    return request(app)
      .delete(`/v1/party?id=${testParty.online.id}`)
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        const { status, result } = response.body;
        expect(status).toEqual('Success');
      });
  });

  test('Fail - DoesNotExistParty', () => {
    getPartyEntity.mockResolvedValueOnce(null);

    return request(app)
      .delete(`/v1/party?id=${testParty.online.id}`)
      .set('Cookie', `accessToken=${participantTokenSet.accessToken}`)
      .expect((response) => {
        const { name, message } = response.body.result;
        expect(name).toEqual('BadRequest');
        expect(message).toEqual('DoesNotExistParty');
      });
  });

  test('Fail - DoesNotMatchedDefinedOwnerID', () => {
    getPartyEntity.mockResolvedValueOnce(testParty.online);

    return request(app)
      .delete(`/v1/party?id=${testParty.online.id}`)
      .set('Cookie', `accessToken=${participantTokenSet.accessToken}`)
      .expect((response) => {
        const { name, message } = response.body.result;
        expect(name).toEqual('Forbidden');
        expect(message).toEqual('DoesNotMatchedDefinedOwnerID');
      });
  });
});
