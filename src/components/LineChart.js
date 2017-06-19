/**
 * Created by thana on 6/19/2017.
 */

// From vue-chartjs documentation
import {Line, mixins } from 'vue-chartjs'

export default Line.extend({
    mixins: [mixins.reactiveProp],
    props: ["chartData", "options"],
    computed: {

    },
    methods: {
        newDate(days) {
            return this.$moment().add(days, 'd');
        },
    },
    mounted () {
        // Overwriting base render method with actual data.
        this.renderChart(this.chartData, this.options);
    },
})