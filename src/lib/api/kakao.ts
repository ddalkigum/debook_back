import axios from 'axios';
import { KakaoSearchBookResponse } from '../../domain/party/interface';
import * as config from '../../config';

const KAKAO_BOOK_BASE_URL = 'https://dapi.kakao.com/v3/search/book';
const SEARCH_SIZE = 50;

export const getBookInfo = async (bookName: string, page: number) => {
  const encodedBookName = encodeURIComponent(bookName);
  const response = await axios.get<KakaoSearchBookResponse>(
    `${KAKAO_BOOK_BASE_URL}?target=title&query=${encodedBookName}&page=${page}&size=${SEARCH_SIZE}`,
    {
      headers: { Authorization: `KakaoAK ${config.serverConfig.kakaoRestKey}` },
    }
  );
  return response.data;
};
