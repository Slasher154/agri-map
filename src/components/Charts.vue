<template>
    <div class="row">
        <div class="col-sm-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="float-left">{{title}}</h3>
                    <div class="float-right">
                        <div class="btn-group" data-toggle="buttons">
                            <label v-for="hour in hourOptions" @click="toggleTimeChange(parameter, hour.hours)" class="btn btn-primary" :class="{ active: hour.isChecked }">
                                <input type="radio" :name="optionsName" autocomplete="off" :checked="hour.isChecked"> {{hour.label}}
                            </label>
                        </div>
                    </div>
                    <div class="clearfix"></div>


                </div>
                <div class="card-block">
                    <div style="height: 450px" width="100%">
                        <app-line-chart
                                :chartData="chartDatasets"
                                :options="chartOptions"
                        >
                        </app-line-chart>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import LineChart from './LineChart';
    export default {
        props: {
            title: String,
            parameter: String,
            chartDatasets: Object,
            chartOptions: Object,
        },
        data() {
            return {
                hourOptions: [
                    { hours: 0, label: 'Live', isChecked: true },
                    { hours: 1, label: '1 Hour', isChecked: false },
                    { hours: 24, label: '24 Hour', isChecked: false}
                ],
            }
        },
        methods: {
            toggleTimeChange(parameter, hours) {
                //console.log(`Set graph view of ${parameter} to ${hours} hours`);

                // Emit this update to the parent so the parent template can re-load data to the graph
                this.$emit('timeChanged', parameter, hours);
            }
        },
        components: {
            appLineChart: LineChart,
        },
        computed: {
            optionsName() {
                return `options-${this.parameter}`;
            }
        },
    }
</script>