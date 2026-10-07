export type MediaType = 'movie' | 'tv';

export interface TmdbListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MediaSummary {
  id: number;
  media_type?: MediaType;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  last_air_date?: string;
  origin_country?: string[];
  popularity: number;
  status: string;
  genres: Genre[];
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  published_at: string;
}

export interface VideosResponse {
  id: number;
  results: TmdbVideo[];
}

export interface CastMember {
  id: number;
  original_name: string;
  character: string;
  profile_path: string | null;
}

export interface CreditsResponse {
  id: number;
  cast: CastMember[];
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
}