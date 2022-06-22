import NotificationOpenChatEntity from '../../infrastructure/database/maria/entity/notification/openChat';
import ParticipantEntity from '../../infrastructure/database/maria/entity/party/participant';
import PartyEntity from '../../infrastructure/database/maria/entity/party/party';
import UserEntity from '../../infrastructure/database/maria/entity/user/user';

type Param<T> = {
  name: keyof T;
};

type IQuery<T> = {
  param?: Param<T>[];
  query: string;
};

type Params<T, K> = {
  name: keyof T | keyof K;
};

type IJoinQuery<T, K> = {
  params?: Params<T, K>[];
  query: string;
};

export const getPartyDetailQuery: IJoinQuery<PartyEntity, UserEntity> = {
  params: [{ name: 'nickname' }, { name: 'title' }],
  query: `
  SELECT 
    party.id as partyID, 
    party.title as partyTitle,
    party.numberOfRecruit,
    party.numberOfParticipant,
    party.slug,
    party.isOnline,
    party.region,
    party.city,
    party.town,
    party.description,
    party.createdAt,
    party.updatedAt,
    user.id as ownerID,
    user.profileImage,
    book.id as bookID,
    book.title as bookTitle,
    book.thumbnail as bookThumbnail,
    book.authors
  FROM party
  JOIN user ON user.id = party.ownerID
  JOIN book ON book.id = party.bookID
  WHERE user.nickname=?
  AND party.slug=?`,
};

export const getPartyByTitleQuery: IJoinQuery<PartyEntity, UserEntity> = {
  params: [{ name: 'nickname' }, { name: 'title' }],
  query: `
    SELECT party.id 
    FROM party
    JOIN user ON user.id = party.ownerID
    WHERE user.nickname=?
    AND party.title=?
  `,
};

export const getAvailableDayQuery = {
  params: [{ name: 'partyID' }],
  query: `
    SELECT availableDay.dayID
    FROM availableDay
    JOIN day ON day.id = availableDay.dayID
    WHERE availableDay.partyID=?
  `,
};

export const getPartyListQuery = {
  query: `
  SELECT 
    party.id as partyID,
    party.title as partyTitle,
    party.numberOfRecruit,
    party.numberOfParticipant,
    party.slug,
    party.isOnline,
    party.region,
    party.city,
    party.town,
    party.createdAt,
    user.id as ownerID,
    user.nickname,
    user.profileImage,
    book.id as bookID,
    book.title as bookTitle,
    book.thumbnail as bookThumbnail,
    book.authors
  FROM party
  JOIN user ON user.id = party.ownerID
  JOIN book ON book.id = party.bookID
  ORDER BY party.createdAt DESC
  `,
};

export const getParticipatePartyListQuery: IJoinQuery<PartyEntity, ParticipantEntity> = {
  params: [{ name: 'userID' }],
  query: `
  SELECT 
    party.id as partyID,
    party.title as partyTitle,
    party.numberOfRecruit,
    party.numberOfParticipant,
    party.ownerID,
    party.slug,
    party.isOnline,
    party.region,
    party.city,
    party.town,
    party.createdAt,
    user.id as userID,
    user.nickname,
    user.profileImage,
    book.id as bookID,
    book.title as bookTitle,
    book.thumbnail as bookThumbnail,
    book.authors,
    participant.isOwner
  FROM party
  JOIN user ON user.id = party.ownerID
  JOIN book ON book.id = party.bookID
  JOIN participant ON participant.partyID = party.id
  WHERE participant.userID = ?
  ORDER BY participant.createdAt DESC;
  `,
};

export const updateNumberOfParticipantCountQuery: IQuery<PartyEntity> = {
  param: [{ name: 'id' }],
  query: `
    UPDATE party
    SET numberOfParticipant = numberOfParticipant + 1
    WHERE id=?`,
};

export const getNotificationOpenChatListQuery: IQuery<NotificationOpenChatEntity> = {
  param: [{ name: 'userID' }],
  query: `
  SELECT 
	  openChat.id as notificationID,
    party.id as partyID,
    party.title,
    party.openChatURL,
    party.openChatPassword,
    book.id as bookID,
    book.thumbnail
  FROM openChat
  JOIN party ON party.id = openChat.partyID
  JOIN book ON book.id = party.bookID
  WHERE userID=?
  `,
};
