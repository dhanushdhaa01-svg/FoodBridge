import { HttpErrorResponse } from '@angular/common/http';

export class HttpErrorMapper {
  static map(status: number, errorBody: any): string {
    if (errorBody?.message) {
      return errorBody.message;
    }

    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Invalid email or password.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data. Please try again.';
      case 500:
        return 'Something went wrong on the server. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
