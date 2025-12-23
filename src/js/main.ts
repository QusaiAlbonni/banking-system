import Alpine from '@alpinejs/csp';
import * as AlpineTypes from 'alpinejs';
import '../css/styles.css';
import loginForm from './login';

window['Alpine'] = Alpine;
Alpine.start();
(Alpine as AlpineTypes.Alpine).data('login', loginForm);
