import { Component, Inject, OnInit } from '@angular/core';
import { Exercise } from 'src/app/models/exercise';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime, Subject, take } from 'rxjs';
import { Category } from 'src/app/models/category';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Dispatcher } from 'src/app/services/dispatcher.service';
import { ExerciseActions } from '../state/exercise.actions';
import { CategorySelector } from 'src/app/category/state/category.selector';

@Component({
  selector: 'app-edit-exercise',
  templateUrl: './edit-exercise.component.html',
  styleUrls: ['./edit-exercise.component.css'],
})
export class EditExerciseComponent implements OnInit {
  editForm!: FormGroup;
  exercise!: Exercise;
  private categories!: Category[];
  exerciseEdited$: Subject<any> = new Subject<any>();

  constructor(
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditExerciseComponent>,
    private categorySelector: CategorySelector,
    private dispatcher: Dispatcher,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.exercise = data.exercise;
    this.categorySelector.selectCategories()
    .pipe(take(1)).subscribe((categories) => {
      this.categories = categories;
    });
  }

  ngOnInit(): void {
    this.editForm = new FormGroup({
      name: new FormControl(this.exercise.name, [Validators.required]),
      category: new FormControl(this.resolveCategory(), [Validators.required]),
      numberOfSets: new FormControl(this.exercise.numberOfSets, [
        Validators.required,
      ]),
      unit: new FormControl(this.exercise.unit, [Validators.required]),
      numberOfReps: new FormControl(this.exercise.numberOfReps, [
        Validators.required,
      ]),
      primaryMuscles: new FormControl(this.exercise.primaryMuscles, [
        Validators.required,
      ]),
      description: new FormControl(this.exercise.description),
    });

    this.exerciseEdited$.pipe(debounceTime(500), take(1))
    .subscribe(() => 
      this.openSnackBar()
    );
  }

  resolveCategory(): string {
    if (!this.categories) {
      return '';
    }
    const id = this.categories
      .find((category) => category.caption == this.exercise.category)
      ?.id.toString();
    return id ?? '';
  }

  editExercise() {
    this.exercise.name = this.editForm.controls['name'].value;
    this.exercise.category = parseInt(this.editForm.controls['category'].value);
    this.exercise.numberOfSets = parseInt(
      this.editForm.controls['numberOfSets'].value
    );
    this.exercise.unit = this.editForm.controls['unit'].value;
    this.exercise.numberOfReps = parseInt(
      this.editForm.controls['numberOfReps'].value
    );
    this.exercise.primaryMuscles =
      this.editForm.controls['primaryMuscles'].value;
    const description = this.editForm.controls['description'].value;
    this.exercise.description = Array.isArray(description)
      ? description
      : description.split('. ');

    this.dispatcher.dispatch(ExerciseActions.editExercise({exercise: this.exercise}));
  }

  openSnackBar() {    
    this._snackBar.open('Exercise edited successfully', 'Okay', { 
      horizontalPosition: 'end', 
      verticalPosition: 'bottom',
      duration: 4000,
      panelClass: ['snackbar'] });
  }

  getErrorMessage() {
    return 'You must enter a value';
  }
}
