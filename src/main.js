import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './App.vue';

Vue.use(VueResource);

// Configure Vue Momentjs
const moment = require('moment');
Vue.use(require('vue-moment'), {
    moment
});

new Vue({
  el: '#app',
  render: h => h(App)
})
