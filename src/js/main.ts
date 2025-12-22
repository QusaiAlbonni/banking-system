import Alpine from '@alpinejs/csp';
import '../css/styles.css'; 
import loginForm from './login';

window['Alpine'] = Alpine;
Alpine.start();

(window as any).loginForm= loginForm;