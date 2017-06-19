<template>
    <div>
        <h1>AgriTech Demo</h1>
        <hr>
        <app-stats
            :payload="payload"
        >

        </app-stats>
        <hr>
        <app-chart
            title="Temperature"
            parameter="temp"
            :chartDatasets="tempDatasets"
            :chartOptions="generateChartOptions('temp')"
            @timeChanged="reloadData"
        >
        </app-chart>
        <app-chart
                title="Humidity"
                parameter="humidity"
                :chartDatasets="humidityDatasets"
                :chartOptions="generateChartOptions('humidity')"
                @timeChanged="reloadData"
        >
        </app-chart>
        <app-chart
                title="Pressure"
                parameter="pressure"
                :chartDatasets="pressureDatasets"
                :chartOptions="generateChartOptions('pressure')"
                @timeChanged="reloadData"
        >
        </app-chart>
    </div>

</template>

<script>
    import Stats from './Stats.vue';
    import Charts from './Charts.vue';
    import _ from 'lodash';
    export default {
        data() {
            return {
                useSampleData: true,
                queryUrl: ``, // URL to query latest data only
                intervalQueryUrl: ``, // URL to query data for latest xx hours
                pollData: '',
                payload: {
                    temp: 27,
                    humidity: 30,
                    pressure: 10,
                },
                tempDatasets: {
                    datasets: [
                        {
                            label: "Temperature (C)",
                            data: [],
                            fill: false,
                            borderColor: '#E74C3C'
                        }
                    ],
                    isLive: true,
                },
                humidityDatasets: {
                    datasets: [{
                        label: "Humidity (%)",
                        data: [],
                        fill: false,
                        borderColor: '#28B463'
                    }],
                    isLive: true
                },
                pressureDatasets: {
                    datasets: [{
                        label: "Pressure (PA)",
                        data: [],
                        fill: false,
                        borderColor: '#3498DB'
                    }],
                    isLive: true,
                },
            }
        },
        methods: {
            generateChartOptions(type) {
                let units =
                    {temp: 'Temperature (C)', humidity: 'Humidity (%)', pressure: 'Pressure (PA)'}
                ;
                return {
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                displayFormats: {
                                    'millisecond': 'MMM DD HH:mm',
                                    'second': 'MMM DD HH:mm',
                                    'minute': 'MMM DD HH:mm',
                                    'hour': 'MMM DD HH:mm',
                                    'day': 'MMM DD HH:mm',
                                    'week': 'MMM DD HH:mm',
                                    'month': 'MMM DD HH:mm',
                                    'quarter': 'MMM DD HH:mm',
                                    'year': 'MMM DD HH:mm',
                                }
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Time',
                            }
                        }],
                        yAxes: [
                            {
                                scaleLabel: {
                                    display: true,
                                    labelString: units[type],
                                }
                            }
                        ]
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }

            },
            generateSampleData(){
                for (let i = 0; i < 4; i ++) {
                    this.tempDatasets.datasets[0].data.push({
                        x: this.$moment().add(i, 'h'),
                        y: Math.random(),
                    });
                    this.humidityDatasets.datasets[0].data.push({
                        x: this.$moment().add(i, 'h'),
                        y: Math.random(),
                    });
                    this.pressureDatasets.datasets[0].data.push({
                        x: this.$moment().add(i, 'h'),
                        y: Math.random(),
                    });
                }
            },
            fetchDataFromServerAndUpdate(parameter, hoursBackFromPresent) { // Fetch the data from server
                this.$http.get(this.intervalQueryUrl, { hours: hoursBackFromPresent })
                    .then(response => {
                    return response.json();
                    }, error => {
                        alert('Error fetching data from server');
                    })
                    .then(msg => {
                        // Update the graph based on given parameter
                        if (parameter === 'temp') {
                            this.tempDatasets = this.updateData(this.tempDatasets, msg.data, 'tempC');
                        }
                        else if (parameter === 'humidity') {
                            this.humidityDatasets = this.updateData(this.humidityDatasets, msg.data, 'humidity');
                        }
                        else if (parameter === 'pressure') {
                            this.pressureDatasets = this.updateData(this.pressureDatasets, msg.data, 'pressure');
                        }
                        else {

                        }
                    })
            },
            clearData(dataset) {
               let newDataset = _.clone(dataset);
               newDataset.datasets[0].data = [];
               return newDataset;
            },
            updateData(dataset, arrayOfNewData, paramName) {
                let dataPoints = arrayOfNewData.map(d => {
                    return {
                        x: d.t_stamp,
                        y: d[paramName],
                    };
                });
                let newDataset = _.clone(dataset);
                newDataset.datasets[0].data = dataPoints;
                return newDataset;
            },
            reloadData(parameter, hours) {

                // Set the dataset we want to be working with based on the emitted events, which is generated when
                // user clicks the button 'Live', '1 Hour', '24 Hour', etc.
                // Emitted events send 2 parameters: 'parameter' tells us which graph user is clicking and 'hour' tells which button user is clicking
                let dataset = [];
                if (parameter == 'temp') dataset = this.tempDatasets;
                if (parameter == 'humidity') dataset = this.humidityDatasets;
                if (parameter == 'pressure') dataset = this.pressureDatasets;

                // Set the isLive status of dataset according to given input. The non-live data will not be refreshed.
                dataset.isLive = hours == 0 ? true : false;

                // If user selects 'Live', clear the data from the graph to view the latest data only
                if (dataset.isLive) {
                    dataset = this.clearData(dataset);
                }

                // Otherwise, fetch data from the server
                else {
                    this.fetchDataFromServerAndUpdate(parameter, hours);
                }

                // Hours = 0 means live data
                /*if (parameter === 'temp') {
                   this.tempDatasets.isLive = hours == 0 ? true : false;
                   if (this.tempDatasets.isLive) {
                       // Clear the data to prepare for new live data
                       this.tempDatasets = this.clearData(this.tempDatasets);
                   }
                   else {
                       // Fetch the data based on given time
                       this.fetchDataFromServerAndUpdate('temp', hours);
                   }
                }
                else if (parameter === 'humidity') {
                    this.humidityDatasets.isLive = hours == 0 ? true : false;


                }
                else if (parameter === 'pressure') {
                    this.pressureDatasets.isLive = hours == 0 ? true : false;

                }
                else {

                }*/
            },
            addData(dataset, time, value) {
                let newDataset = _.clone(dataset);
                newDataset.datasets[0].data.push({
                    x: time,
                    y: value
                });
                return newDataset;
            }
        },
        components: {
            appStats: Stats,
            appChart: Charts,
        },
        created() {
            if (this.useSampleData) {
               this.generateSampleData();
                let count = 4;
                setInterval(() => {
                    // Simulate updated data

                    // Temperature
                    this.tempDatasets = this.addData(this.tempDatasets, this.$moment().add(count, 'h'), Math.random());

                    // Humidity
                    this.humidityDatasets = this.addData(this.humidityDatasets, this.$moment().add(count, 'h'), Math.random());

                    // Pressure
                    this.pressureDatasets = this.addData(this.pressureDatasets, this.$moment().add(count, 'h'), Math.random());

                    count++;
                }, 2000)
            }
            else {
                // Poll the data from the server every 3 second
                this.pollData = setInterval(() => {
                    this.$http.get(this.queryUrl)
                        .then(response => {
                            return response.json();
                        }, error => {
                            alert(`There is an error while querying data from ${this.queryUrl}` );
                            return error;
                        })
                        .then(msg => {
                            // Push the new data to the dataset if 'isLive' is true (means user is watching the live data, not history data)
                            // Refer to agri-tech.json generated by Seksit Y. Assuming when querying the live data,
                            // the returned object contains the array called data with the first element being the most updated data
                            // TODO: To check whether the newest data timestamp is same as the previous one (no updated data in this poll), discard the data

                            // According to vue-chartjs docs, we need to set the dataset to the new object in order to make chart reactive
                            // http://vue-chartjs.org/#/home?id=reactive-data
                            if (this.tempDatasets.isLive) {
                                this.tempDatasets = this.addData(this.tempDatasets, msg.data[0].t_stamp, msg.data[0].tempC);
                            }
                            if (this.humidityDatasets.isLive) {
                                this.humidityDatasets = this.addData(this.humidityDatasets, msg.data[0].t_stamp, msg.data[0].humidity);
                            }
                            if (this.pressureDatasets.isLive) {
                                this.pressureDatasets = this.addData(this.pressureDatasets, msg.data[0].t_stamp, msg.data[0].pressure);
                            }
                        })
                }, 3000);
            }
        },
        mounted() {
            
        }
    }


</script>