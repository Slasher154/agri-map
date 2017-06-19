<template>
  <div id="app">
    <app-header></app-header>
    <div class="container">
      <dashboard></dashboard>
    </div>
  </div>
</template>

<script>
    import Header from './components/Header.vue';
    import Dashboard from './components/Dashboard.vue';
    export default {
        name: 'app',

        components: {
            appHeader: Header,
            dashboard: Dashboard,
        },
    }
</script>

<style>
  /* Show it is fixed to the top */
  body {
    min-height: 75rem;
    padding-top: 4.5rem;
  }
</style>
