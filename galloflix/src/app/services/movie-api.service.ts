import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreditsResponse,
  MediaDetails,
  MediaSummary,
  MediaType,
  PersonDetails,
  TmdbListResponse,
  VideosResponse,
} from '../models/tmdb.models';

@Injectable({ providedIn: 'root' })
export class MovieApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.tmdbBaseUrl;
  private readonly headers = new HttpHeaders({
    accept: 'application/json',
    Authorization: `Bearer ${environment.tmdbToken}`,
  });

  private get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      headers: this.headers,
      params,
    });
  }

  bannerApiData(): Observable<TmdbListResponse<MediaSummary>> {
    return this.get('/trending/all/week', this.languageParams());
  }

  trendingMovieApiData(): Observable<TmdbListResponse<MediaSummary>> {
    return this.get('/trending/movie/day', this.languageParams());
  }

  trendingSerieApiData(): Observable<TmdbListResponse<MediaSummary>> {
    return this.get('/trending/tv/day', this.languageParams());
  }

  popularActionMovieApiData(): Observable<TmdbListResponse<MediaSummary>> {
    const params = this.languageParams()
      .set('with_genres', '28')
      .set('sort_by', 'popularity.desc');

    return this.get('/discover/movie', params);
  }

  mediaDetails(type: MediaType, id: number): Observable<MediaDetails> {
    return this.get(`/${type}/${id}`, this.languageParams());
  }

  mediaTrailer(type: MediaType, id: number): Observable<VideosResponse> {
    return this.get(`/${type}/${id}/videos`, this.languageParams());
  }

  mediaCast(type: MediaType, id: number): Observable<CreditsResponse> {
    return this.get(`/${type}/${id}/credits`, this.languageParams());
  }

  personDetails(id: number): Observable<PersonDetails> {
    return this.get(`/person/${id}`, this.languageParams());
  }

  searchMedia(query: string, page = 1): Observable<TmdbListResponse<MediaSummary>> {
    const params = this.languageParams()
      .set('query', query)
      .set('include_adult', 'false')
      .set('page', page.toString());

    return this.get('/search/multi', params);
  }

  private languageParams(): HttpParams {
    return new HttpParams().set('language', 'pt-BR');
  }
}