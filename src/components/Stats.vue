<template>
    <div class="row">
        <div class="col-3">
            <p class="text-left stats-number temp-stats">{{ payload.temp }}</p>
            <p class="text-left stats-title temp-stats">Temperature (C)</p>
        </div>
        <div class="col-3">
            <p class="text-left stats-number humidity-stats">{{ payload.humidity}}</p>
            <p class="text-left stats-title humidity-stats">Humidity (%)</p>
        </div>
        <div class="col-3">
            <p class="text-left stats-number pressure-stats">{{ payload.pressure }}</p>
            <p class="text-left stats-title pressure-stats">Preesure (kPA)</p>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {

            }
        },
        props: {
            payload: Object
        }
    }
</script>

<style>
    .stats-number {
        font-size: 36px;
        margin-bottom: auto;
    }
    .stats-title {
        font-size: 24px;
    }
    .temp-stats {
        color: red;
    }
    .humidity-stats {
        color: green;
    }
    .pressure-stats {
        color: blue
    }
</style>