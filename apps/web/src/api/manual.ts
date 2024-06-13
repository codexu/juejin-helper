import request, { Response } from '@/libs/request';

type ManualArticleStarParams = {
  articleUrl: string;
  quantity: number;
  delay: number;
};

type ManualResponse = {
  jobId: string;
  jobName: string;
};

// 文章点赞
export function manualArticleStar(params: ManualArticleStarParams) {
  return request<Response<ManualResponse>>({
    method: 'get',
    url: '/manual/manualArticleStar',
    params: {
      ...params,
      priority: 100,
      delay: params.delay,
    },
  });
}

type ManualArticleCommentParams = {
  articleUrl: string;
  comments: string[];
  type?: string;
  quantity: number;
  delay: number;
};

// 文章评论
export function manualArticleComment(data: ManualArticleCommentParams) {
  return request<Response<ManualResponse>>({
    method: 'post',
    url: '/manual/manualArticleComment',
    data,
  });
}

type ManualArticleReadParams = {
  url: string;
  quantity: number;
  delay: number;
};

// 阅读文章
export function manualArticleRead(data: ManualArticleReadParams) {
  return request<Response<ManualResponse>>({
    method: 'post',
    url: '/manual/manualArticleRead',
    data,
  });
}

export type LatestArticle = {
  href: string;
  title: string;
};

// 获取用户主账号文章列表
export function getLatestArticle() {
  return request<Response<LatestArticle[]>>({
    method: 'get',
    url: '/manual/getLatestArticle',
  });
}

type ManualPinStarParams = {
  url: string;
  quantity: number;
  delay: number;
};

// 沸点点赞
export function manualPinStar(params: ManualPinStarParams) {
  return request<Response<ManualResponse>>({
    method: 'get',
    url: '/manual/manualPinStar',
    params: {
      ...params,
      priority: 100,
      delay: params.delay,
    },
  });
}

type ManualPinCommentParams = {
  url: string;
  comments: string[];
  delay: number;
};

// 沸点评论
export function manualPinComment(data: ManualPinCommentParams) {
  return request<Response<ManualResponse>>({
    method: 'post',
    url: '/manual/manualPinComment',
    data,
  });
}
