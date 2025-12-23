import { AlpineComponent } from "alpinejs";

export default function loginForm(): AlpineComponent<any> {
  const component: AlpineComponent<any> =  {
    email: '',
    password: '',
    showPassword: false,
    touched: { email: false, password: false },
    submitting: false,
    serverError: '', // you can inject server error text into this from server if you render conditionally
    submitLabel: 'Sign in',

    // validators
    get emailValid(){
      // simple but practical email test
      return /^\S+@\S+\.\S+$/.test(this.email);
    },
    get passwordValid(){
      return this.password.length >= 8;
    },
    get formValid(){
      return this.emailValid && this.passwordValid;
    },
    get emailError(){
      if(!this.touched.email) return '';
      if(!this.email) return 'Email is required.';
      if(!this.emailValid) return 'Please enter a valid email address.';
      return '';
    },
    get passwordError(){
      if(!this.touched.password) return '';
      if(!this.password) return 'Password is required.';
      if(!this.passwordValid) return 'Password must be at least 8 characters.';
      return '';
    },

    handleSubmit(){
      // mark fields touched to show errors
      this.touched.email = true;
      this.touched.password = true;
      this.serverError = '';

      if(!this.formValid) {
        // keep user on page so they can correct mistakes
        return;
      }

      // If you want to do AJAX login, do it here.
      // For a standard POST to the server, just submit the form.
      this.submitting = true;
      this.submitLabel = 'Signing in...';

      // use the native form submit through $refs to avoid adding/removing listeners
      this.$refs.form.submit();
    }
  };

  return component;
}