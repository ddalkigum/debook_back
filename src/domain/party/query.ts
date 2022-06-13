import PartyEntity from '../../infrastructure/database/maria/entity/party/party';
import UserEntity from '../../infrastructure/database/maria/entity/user/user';

type Params<T, K> = {
  name: keyof T | keyof K;
};

type IQuery<T, K> = {
  params: Params<T, K>[];
  query: string;
};

export const getPartyDetailQuery: IQuery<PartyEntity, UserEntity> = {
  params: [{ name: 'nickname' }, { name: 'title' }],
  query: `
  SELECT 
    party.id as partyID, 
    party.numberOfRecruit,
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
    book.authors,
    (SELECT 
      COUNT(*) 
    FROM participant
    JOIN party ON party.id = participant.partyID
    ) as numberOfParticipant
  FROM party
  JOIN user ON user.id = party.ownerID
  JOIN book ON book.id = party.bookID
  WHERE user.nickname=?
  AND party.title=?`,
};

export const getPartyByTitleQuery: IQuery<PartyEntity, UserEntity> = {
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
    party.isOnline,
    party.region,
    party.city,
    party.town,
    user.id as ownerID,
    user.nickname,
    user.profileImage,
    book.id as bookID,
    book.title as bookTitle,
    book.thumbnail as bookThumbnail,
    book.authors,
    (SELECT 
      COUNT(*) 
    FROM participant
    JOIN party ON party.id = participant.partyID
    ) as numberOfParticipant
  FROM party
  JOIN user ON user.id = party.ownerID
  JOIN book ON book.id = party.bookID
  `,
};
