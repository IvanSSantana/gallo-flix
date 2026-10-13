import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, map, switchMap } from 'rxjs';
import { PersonDetails } from '../../models/tmdb.models';
import { MovieApiService } from '../../services/movie-api.service';

@Component({
  selector: 'app-person',
  imports: [DatePipe],
  templateUrl: './person.component.html',
  styleUrl: './person.component.css',
})
export class PersonComponent implements OnInit {
  private readonly movieApi = inject(MovieApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly person = signal<PersonDetails | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        switchMap((id) =>
          Number.isInteger(id) && id > 0
            ? this.movieApi.personDetails(id)
            : EMPTY,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((person) => this.person.set(person));
  }
}