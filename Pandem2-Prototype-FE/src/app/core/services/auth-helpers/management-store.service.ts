/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ManagementStoreService {

  private user$ = new BehaviorSubject<UserModel>(undefined);
  public value = 5;

  constructor(
  ) {}

  setUser(user): void {
    this.user$.next(user);
  }

  setUserProperties(payload): void {
    this.user$.asObservable()
      .pipe(
        first()
      )
      .subscribe((currentUser: UserModel) => {
        const updatedUser: UserModel = { ...currentUser, ...payload };
        this.user$.next(updatedUser);
      });
  }

  getUser(): Observable<UserModel> {
    return this.user$.asObservable();
  }
}
