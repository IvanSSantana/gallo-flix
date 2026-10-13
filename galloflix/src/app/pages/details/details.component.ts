import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, forkJoin, map, switchMap } from 'rxjs';
import {
  CastMember,
  MediaDetails,
  MediaType,
  TmdbVideo,
} from '../../models/tmdb.models';
import { MovieApiService } from '../../services/movie-api.service';

type TrailerViewModel = TmdbVideo & { safeUrl: SafeResourceUrl };

@Component({
  selector: 'app-details',
  imports: [DatePipe, RouterLink],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  private readonly movieApi = inject(MovieApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  readonly media = signal<MediaDetails | null>(null);
  readonly trailers = signal<TrailerViewModel[]>([]);
  readonly cast = signal<CastMember[]>([]);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => ({
          type: params.get('type'),
          id: Number(params.get('id')),
        })),
        switchMap(({ type, id }) => {
          if (!this.isMediaType(type) || !Number.isInteger(id) || id <= 0) {
            return EMPTY;
          }

          return forkJoin({
            media: this.movieApi.mediaDetails(type, id),
            videos: this.movieApi.mediaTrailer(type, id),
            credits: this.movieApi.mediaCast(type, id),
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ media, videos, credits }) => {
        this.media.set(media);
        this.cast.set(credits.cast);
        this.trailers.set(
          videos.results.map((trailer) => ({
            ...trailer,
            safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.youtube.com/embed/${trailer.key}`,
            ),
          })),
        );
      });
  }

  private isMediaType(value: string | null): value is MediaType {
    return value === 'movie' || value === 'tv';
  }
}