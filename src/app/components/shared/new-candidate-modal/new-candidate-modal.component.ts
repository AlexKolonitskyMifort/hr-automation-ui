import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { PageState } from '@utils/pageState';
import { ERROR_STATUS_CODES } from '@constants/errorStatusCode';
import { ROUTES } from '@src/app/routes';
import { NotificationService } from '@services/notification.service';
import { CandidatesService } from '@services/candidates.service';
import { CANDIDATE_STATUSES, ECandidateStatus } from '@constants/candidates';
import { ENotificationMode } from '@constants/notification';
import { ERROR_MESSAGE, TEXT_FIELD_ERRORS } from '@constants/strings';

interface IFormData {
  id: string;
  status: ECandidateStatus;
}

@Component({
  selector: 'app-new-candidate-modal',
  templateUrl: './new-candidate-modal.component.html',
})
export class NewCandidateModalComponent {
  statusOptions = CANDIDATE_STATUSES;

  form!: FormGroup;

  formData: IFormData | null = null;

  modalState = new PageState();

  constructor(
    private _dialogRef: MatDialogRef<NewCandidateModalComponent>,
    private _formBuilder: FormBuilder,
    private _candidateService: CandidatesService,
    private _notificationService: NotificationService,
    private _router: Router
  ) {
    this.form = this._formBuilder.group({
      id: ['', Validators.required],
    });

    this.form?.valueChanges.subscribe((data) => {
      this.formData = data;
    });
  }

  submitNewCandidate() {
    if (this.formData === null || this.form.invalid) {
      this._notificationService.show(TEXT_FIELD_ERRORS.FORM_INVALID, ENotificationMode.ERROR);
    } else {
      this.modalState.startLoading();
      this._candidateService.createNewCandidate(this.formData).subscribe({
        next: () => {
          this._router.navigate([`${ROUTES.CANDIDATES}/details/${this.formData!.id}`]);
          this.modalState.finishLoading();
          this.closeModal();
        },
        error: (error) => {
          this.modalState.finishLoading();
          this._notificationService.show(
            ERROR_MESSAGE[error?.status || ERROR_STATUS_CODES.INTERNAL_SERVER_ERROR],
            ENotificationMode.ERROR
          );
        },
      });
    }
  }

  closeModal() {
    this._dialogRef.close();
  }
}
