import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IPartyRepository, IPartyService } from './interface';

@injectable()
export default class PartyService implements IPartyService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.Partyrepository) private partyRepository: IPartyRepository;

  public getMainCardList = async () => {
    this.logger.debug(`PartyService, getMainCardList`);
    return await this.partyRepository.getPartyList();
  };

  public getPartyDetail = async (nickname: string, partyTitle: string, userID?: number) => {
    this.logger.debug(`PartyService, getPartyDetail, nickname: ${nickname}, partyTitle: ${partyTitle}`);
    const foundParty = await this.partyRepository.getPartyDetail(nickname, partyTitle);

    if (!foundParty) throw new Error('Not Found');

    const availableDay = await this.partyRepository.getAvailableDay(foundParty.id);
    const participantList: any[] = await this.partyRepository.getParticipant(foundParty.id);

    let isParticipant = false;

    const foundParticipant = participantList.find((participant) => participant.userID === userID);
    if (foundParticipant) isParticipant = true;

    return {
      party: {
        ...foundParty,
        availableDay,
        participant: isParticipant ? foundParticipant : undefined,
      },
    };
  };

  public getRelationPartyList = async (bookID: string) => {
    const partyList = await this.partyRepository.getPartyListByBookID(bookID);
    return partyList;
  };

  public registParty = async () => {};
}
