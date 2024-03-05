export type State = {
    documentText: Signal<string>;
    references: Signal<never[]>;
};

export type Source = {
  paperId: string;
  corpusId?: number;
  externalIds?: Object;
  url?: string;
  title: string;
  abstract?: string|null;
  venue?: string;
  publicationVenue?: Object;
  year?: number;
  referenceCount?: number;
  citationCount?: number;
  influentialCitationCount?: number;
  isOpenAccess?: boolean;
  openAccessPdf?: {
    url: string;
    status: string;
  }|null;
  fieldsOfStudy?: Array<string>;
  s2FieldsOfStudy?: Array<{category: string; source: string;}>;
  publicationTypes?: Array<string>;
  publicationDate?: string;
  journal?: {
    name: string;
    pages: string;
    volume: string;
  };
  citationStyles?: {
    [key: string]: string;
  };
  authors?: {authorId: string; name: string;}[];
  tldr?: {model: string; text:string}|null;
  embedding?: {model: string, vector: Array}|null;
};

export type Suggestion = {
  id: string;
  snippet: string;
  terms: string;
}

export type Support = {
  docs: any[],
  response: string,
  citations: any[]
}

export type TaskStatus = {
  key: string,
  ready: bool,
  successful: boolean,
  state: string,
  value: Support|null
}