export interface IAuthor {
  name?: string;
  image?: string;
}

export interface IIssue {
  author: IAuthor;
  comment: string;
  title: string;
  type: string;
  createdAt: number;
}

export interface IReview {
  author: IAuthor;
  rating: number;
  createdAt: number;
  title: string;
  type: string;
}

export interface IStat {
  reviews: number;
  issues: number;
}

export type IStats = Record<string, IStat>;

export interface IScanResults {
  id: string;
  name: string;
  url: string;
  reviews: IReview[];
  issues: IIssue[];
  last: IStat;
}

export interface ICurrent {
  id: string;
  name: string;
  url: string;
}
