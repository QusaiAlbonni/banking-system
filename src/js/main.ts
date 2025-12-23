import Alpine from '@alpinejs/csp';
import * as AlpineTypes from 'alpinejs';
import '../css/styles.css';
import loginForm from './login';

document.addEventListener('alpine:init', () => {
  (Alpine as AlpineTypes.Alpine).data('login', loginForm);
});

window['Alpine'] = Alpine;
Alpine.start();
