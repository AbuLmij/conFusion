import { Component, OnInit, Inject } from '@angular/core';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { visibility, flyInOut, expand } from '../animations/app.animation';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Comment } from './../shared/comment';

import 'rxjs/add/operator/switchMap';
import { validateBasis } from '@angular/flex-layout';
import { ThrowStmt } from '@angular/compiler';
import { inject } from '@angular/core/testing';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]' : 'true',
    'style' : 'display: block'
  },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})


export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishCopy: any;
  dishIds: number[];
  prev: number;
  next: number;
  commentForm: FormGroup;
  comment: Comment;
  date = new Date();
  errMess: string;
  visibility: string;

  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Author Name is required.',
      'minlength': 'Author Name must be at least 2 characters long.',
    },
    'comment': {
      'required': 'Comment is required.',
    }
  };

  constructor(private dishService: DishService, private route: ActivatedRoute,
    private location: Location, private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
    this.createCommentForm();
  }

  ngOnInit() {
    this.dishService.getDishIds().subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params.switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishService.getDish(+params['id']) })
      .subscribe(dish => { this.dish = dish; this.dishCopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown' },
        errmess => this.errMess = <any>errmess.message);
  }

  onSubmit(): void {
    this.comment = this.commentForm.value;
    this.comment.date = this.date.toISOString();
    this.dishCopy.comments.push(this.comment);
    this.dishCopy.save().subscribe(dish => this.dish = dish);
    this.comment = null;
    this.commentForm.reset({
      rating: 5,
      comment: '',
      author: ''
    });
  }

  createCommentForm(): void {
    this.commentForm = this.fb.group({
      rating: [5, []],
      comment: ['', [Validators.required]],
      author: ['', [Validators.required, Validators.minLength(2)]]
    });
    this.commentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    } else if (this.commentForm.invalid) {
      this.comment = null;
      const form = this.commentForm;
      for (const field in this.formErrors) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            this.formErrors[field] += messages[key] + '\n';
          }
        }
      }
    } else {
      this.comment = data;
      for (const field in this.formErrors) {
        this.formErrors[field] = '';
      }
    }
  }

  setPrevNext(dishId: number) {
    let index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }
}
