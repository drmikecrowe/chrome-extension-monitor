export interface IAuthor {
  name?: string;
  image?: string;
}

export interface IReview {
  author: IAuthor;
  comment: string;
  rating: number;
  createdAt: number;
}

export interface IIssue {
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
  reviews: IReview[];
  issues: IIssue[];
  last: IStat;
}
