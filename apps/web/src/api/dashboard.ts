import device from 'current-device';
import request, { Response } from '@/libs/request';

const isMoble = device.mobile();

export interface TopUser {
  id: number;
  username: string;
  userId: string;
  avatar: string;
  contribution: number;
  userArticleLike: number;
  userPinLike: number;
  totalArticle: number;
  articleShow: number;
  articleRead: number;
  articleLike: number;
  articleComment: number;
  articleCollect: number;
  totalPin: number;
  totalPinLike: number;
  totalPinComment: number;
  lastUpdated: string;
}

interface TotalJobCount {
  active: number;
  completed: number;
  delayed: number;
  failed: number;
  paused: number;
  waiting: number;
}

interface StatisticData {
  userCount: number;
  enableUserCount: number;
  articleLikeCount: number;
  articleCommentCount: number;
  pinLikeCount: number;
  createdAt: string;
}

export interface DashboardInfo {
  adminAccountCount: number;
  userAccountCount: number;
  totalAccountCount: number;
  offlineAccountCount: number;
  onlineAccountCount: number;
  userArticleLikeCount: number;
  userPinLikeCount: number;
  topUser: TopUser[];
  totalJobCount: TotalJobCount;
  statisticData: StatisticData[];
}

export function getDashboardInfo(days = isMoble ? 7 : 15) {
  return request<Response<DashboardInfo>>({
    method: 'get',
    url: '/statistic/dashboard',
    params: {
      days,
    },
  });
}
