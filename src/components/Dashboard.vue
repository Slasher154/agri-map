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
                useSampleData: true, // change to false to fetch data from the API
                queryUrl: ``, // URL to query latest data only
                intervalQueryUrl: ``, // URL to query data for latest xx hours, should accept one JSON parameter: hours (search 'intervalQueryUrl' in this page to see the code usage)
                pollingInterval: 3000, // change poll interval
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
                        label: "Pressure (kPA)",
                        data: [],
                        fill: false,
                        borderColor: '#3498DB'
                    }],
                    isLive: true,
                },
                numberOfSamplesGenerated: 7,
            }
        },
        methods: {
            generateChartOptions(type) {
                let units =
                    {temp: 'Temperature (C)', humidity: 'Humidity (%)', pressure: 'Pressure (kPA)'}
                ;
                return {
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                displayFormats: {
                                    'millisecond': 'MMM DD HH:mm:ss',
                                    'second': 'MMM DD HH:mm:ss',
                                    'minute': 'MMM DD HH:mm:ss',
                                    'hour': 'MMM DD HH:mm:ss',
                                    'day': 'MMM DD HH:mm:ss',
                                    'week': 'MMM DD HH:mm:ss',
                                    'month': 'MMM DD HH:mm:ss',
                                    'quarter': 'MMM DD HH:mm:ss',
                                    'year': 'MMM DD HH:mm:ss',
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
                for (let i = this.numberOfSamplesGenerated; i > 0; i--) {
                    let randomTemp = 27 + this.randomBetweenTwoNumbers(-2,2);
                    this.tempDatasets.datasets[0].data.push({
                        x: this.$moment().add(-i * (this.pollingInterval / 1000), 's'),
                        y: randomTemp.toFixed(2),
                    });
                    let randomHumidity = 30 + this.randomBetweenTwoNumbers(-2,2);
                    this.humidityDatasets.datasets[0].data.push({
                        x: this.$moment().add(-i * (this.pollingInterval / 1000), 's'),
                        y: randomHumidity.toFixed(2),
                    });
                    let randomPressure = 100 + this.randomBetweenTwoNumbers(-2,2);
                    this.pressureDatasets.datasets[0].data.push({
                        x: this.$moment().add(-i * (this.pollingInterval / 1000), 's'),
                        y: randomPressure.toFixed(2),
                    });
                    this.payload = {
                        temp: randomTemp.toFixed(2),
                        humidity: randomHumidity.toFixed(2),
                        pressure: randomPressure.toFixed(2)
                    }
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

                // Otherwise, fetch historical data
                else {

                    // Generate sample data
                    if (this.useSampleData) {
                        let dataPoints = [];
                        // Generate historical data (assume 10 minutes interval)
                        for (let i = hours * 6; i > 0; i--) {
                            dataPoints.push({
                                x: this.$moment().add(-i * 10,'m'),
                                y: this.randomBetweenTwoNumbers(-2,2)
                            })
                        }
                        if (parameter == 'temp') {
                            dataPoints.forEach(d => d.y += 27);
                            this.tempDatasets = this.setData(this.tempDatasets, dataPoints);
                        }
                        else if (parameter == 'humidity') {

                            dataPoints.forEach(d => d.y += 30);
                            this.humidityDatasets = this.setData(this.humidityDatasets, dataPoints);
                        }
                        else if (parameter == 'pressure') {
                            dataPoints.forEach(d => d.y += 100);
                            this.pressureDatasets = this.setData(this.pressureDatasets, dataPoints);
                        }
                        else {}

                    }

                    // Fetch data from the server
                    else {
                        this.fetchDataFromServerAndUpdate(parameter, hours);
                    }
                }
            },
            addData(dataset, time, value) {
                let newDataset = _.clone(dataset);
                newDataset.datasets[0].data.push({
                    x: time,
                    y: value
                });
                return newDataset;
            },
            setData(dataset, dataPoints) {
                let newDataset = _.clone(dataset);
                newDataset.datasets[0].data = dataPoints;
                return newDataset;
            },
            randomBetweenTwoNumbers(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            },
        },
        components: {
            appStats: Stats,
            appChart: Charts,
        },
        created() {
            if (this.useSampleData) {
               this.generateSampleData();
                let count = this.numberOfSamplesGenerated;
                setInterval(() => {
                    // Simulate updated data
                    let randomTemp = 27 + this.randomBetweenTwoNumbers(-2,2);
                    let randomHumidity = 30 + this.randomBetweenTwoNumbers(-2,2);
                    let randomPressure = 100 + this.randomBetweenTwoNumbers(-2,2);

                    // Temperature
                    if (this.tempDatasets.isLive) {
                        this.tempDatasets = this.addData(this.tempDatasets, this.$moment(), randomTemp.toFixed(2));
                    }

                    // Humidity
                    if (this.humidityDatasets.isLive) {
                        this.humidityDatasets = this.addData(this.humidityDatasets, this.$moment(), randomHumidity.toFixed(2));
                    }

                    // Pressure
                    if (this.pressureDatasets.isLive) {
                        this.pressureDatasets = this.addData(this.pressureDatasets, this.$moment(), randomPressure.toFixed(2));
                    }

                    this.payload = {
                        temp: randomTemp.toFixed(2),
                        humidity: randomHumidity.toFixed(2),
                        pressure: randomPressure.toFixed(2)
                    };

                    count++;
                }, this.pollingInterval)
            }
            else {
                // Poll the data from the server every 'pollingInterval' second
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

                            // Set the stats number on top
                            this.payload = {
                                temp: msg.data[0].tempC,
                                humidity: msg.data[0].humidity,
                                pressure: msg.data[0].pressure
                            };
                        })
                }, this.pollingInterval);
            }
        },
        mounted() {
            
        },
        beforeDestroy() {
            clearInterval(this.pollData);
        }
    }


</script>