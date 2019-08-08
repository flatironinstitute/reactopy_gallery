import { PythonInterface } from 'reactopya';
import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import InputSlider from './InputSlider';

export default class InteractivePlotlyExample extends Component {
    static title = 'Interactive plotly example'
    render() {
        return (
            <AutoSizer>
                <InteractivePlotlyExampleInner {...this.props} />
            </AutoSizer>
        );
    }
}

class InteractivePlotlyExampleInner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            noise_level: ('noise_level' in this.props) ? this.props.noise_level : 1,
            num_points: ('num_points' in this.props) ? this.props.num_points : 40,
            series: null
        }
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, require('./InteractivePlotlyExample.json'));
        this.pythonInterface.start();
    }
    componentDidUpdate() {
        this.pythonInterface.update();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    render() {
        const { series } = this.state;

        window.React3 = require('react');

        if (!series) {
            return <div>Loading...</div>;
        }
        let data = [];
        let all_amplitudes = [];
        for (let i = 0; i < series.length; i++) {
            let S = series[i];
            let x = [];
            let y = [];
            let color = 'green';
            for (let j = 0; j < S.times.length; j++) {
                x.push(S.times[j]);
                y.push(S.amplitudes[j]);
                all_amplitudes.push(S.amplitudes[j]);
            }
            data.push({
                x: x, y: y,
                color: color,
                type: 'scatter',
                mode: 'markers',
                hoverinfo: 'none'
            })
        }

        // let yrange = [Math.min(...all_amplitudes), Math.max(...all_amplitudes)];
        // yrange = [Math.min(yrange[0], 0), Math.max(yrange[1], 0)];
        let yrange = [-50, 150];

        return (
            <div>
                <InputSlider
                    label={'Noise level'}
                    min={0} max={20}
                    value={this.state.noise_level}
                    step={1}
                    onChange={(val) => {this.setState({noise_level: val})}}
                />
                <InputSlider
                    label={'Num. points'}
                    min={1} max={400}
                    value={this.state.num_points}
                    step={1}
                    onChange={(val) => {this.setState({num_points: val})}}
                />
                <Plot
                    data={data}
                    layout={{
                        width: this.props.width || '100%',
                        height: 500,
                        title: '',
                        showlegend: false,
                        xaxis: {
                            autorange: true,
                            // range: [0, numTimepoints - 1],
                            showgrid: false,
                            zeroline: false,
                            showline: false,
                            ticks: '',
                            showticklabels: false
                        },
                        yaxis: {
                            autorange: false,
                            range: yrange,
                            showgrid: true,
                            zeroline: true,
                            showline: false,
                            // ticks: '',
                            showticklabels: true
                        },
                        margin: {
                            l: 50, r: 50, b: 50, t: 50
                        }
                    }}
                    config={(
                        {
                            displayModeBar: false,
                            responsive: true
                        }
                    )}
                />
            </div>
        )
    }
}

class AutoSizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: null
        };
    }

    async componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.resetWidth);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resetWidth);
    }

    resetWidth = () => {
        this.setState({
            width: null
        });
    }

    async componentDidUpdate(prevProps, prevState) {
        if (!this.state.width) {
            this.updateDimensions();
        }
    }

    updateDimensions() {
        if (this.state.width !== this.container.offsetWidth) {
            this.setState({
                width: this.container.offsetWidth // see render()
            });
        }
    }

    render() {
        let { width } = this.state;
        if (!width) width=300;

        const elmt = React.Children.only(this.props.children)

        return (
            <div className="determiningWidth" ref={el => (this.container = el)}>
                <elmt.type {...elmt.props} width={this.state.width}>{elmt.children}</elmt.type>
            </div>
        );
    }
}