export interface RestaurantLoginPayload {
  email: string;
  password: string;
}

export interface RestaurantSignupAccountValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RestaurantSignupRestaurantValues {
  restaurantName: string;
  cuisineTypes: string[];
  city: string;
  phone: string;
  fssaiLicense: string;
}

export interface RestaurantSignupFormValues
  extends RestaurantSignupAccountValues,
    RestaurantSignupRestaurantValues {}

export interface RestaurantUser {
  id: number | string;
  email: string;
  full_name: string;
  role: string;
}

export interface RestaurantAuthResponse {
  access_token: string;
  refresh_token: string;
  user: RestaurantUser;
}

