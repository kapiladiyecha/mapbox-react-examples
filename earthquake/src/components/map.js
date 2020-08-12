import React from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'
import { connect } from 'react-redux'

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

let Map = class Map extends React.Component {
    mapRef = React.createRef();
    map;

    static propTypes = {
        data: PropTypes.object.isRequired,
        active: PropTypes.object.isRequired
    };

    componentDidUpdate() {
        this.setFill();
    }

    componentDidMount() {
        this.map = new mapboxgl.Map({
            container: this.mapRef.current,
            // style: 'mapbox://styles/mapbox/dark-v10',
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [-120, 50],
            zoom: 2
        });

        this.map.on('load', () => {
            this.map.addSource('countries', {
                type: 'geojson',
                data: this.props.data
            });



            // Heatmap layers also work with a vector tile source.
            this.map.addSource('earthquakes', {
                'type': 'geojson',
                'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
            });

            this.map.addLayer({
                id: 'countries',
                type: 'fill',
                source: 'countries'
            }, 'country-label-lg'); // ID metches `mapbox/streets-v9`

            this.setFill();

            this.map.addLayer(
                {
                    'id': 'earthquakes-heat',
                    'type': 'heatmap',
                    'source': 'earthquakes',
                    'maxzoom': 9,
                    'paint': {
// Increase the heatmap weight based on frequency and property magnitude
                        'heatmap-weight': [
                            'interpolate',
                            ['linear'],
                            ['get', 'mag'],
                            0,
                            0,
                            6,
                            1
                        ],
// Increase the heatmap color weight weight by zoom level
// heatmap-intensity is a multiplier on top of heatmap-weight
                        'heatmap-intensity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            0,
                            1,
                            9,
                            3
                        ],
// Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
// Begin color ramp at 0-stop with a 0-transparancy color
// to create a blur-like effect.
                        'heatmap-color': [
                            'interpolate',
                            ['linear'],
                            ['heatmap-density'],
                            0,
                            'rgba(33,102,172,0)',
                            0.2,
                            'rgb(103,169,207)',
                            0.4,
                            'rgb(209,229,240)',
                            0.6,
                            'rgb(253,219,199)',
                            0.8,
                            'rgb(239,138,98)',
                            1,
                            'rgb(178,24,43)'
                        ],
// Adjust the heatmap radius by zoom level
                        'heatmap-radius': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            0,
                            2,
                            9,
                            20
                        ],
// Transition from heatmap to circle layer by zoom level
                        'heatmap-opacity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            7,
                            1,
                            9,
                            0
                        ]
                    }
                },
                'country-label-lg'
            );

            this.map.addLayer(
                {
                    'id': 'earthquakes-point',
                    'type': 'circle',
                    'source': 'earthquakes',
                    'minzoom': 7,
                    'paint': {
// Size circle radius by earthquake magnitude and zoom level
                        'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            7,
                            ['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
                            16,
                            ['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50]
                        ],
// Color circle by earthquake magnitude
                        'circle-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'mag'],
                            1,
                            'rgba(33,102,172,0)',
                            2,
                            'rgb(103,169,207)',
                            3,
                            'rgb(209,229,240)',
                            4,
                            'rgb(253,219,199)',
                            5,
                            'rgb(239,138,98)',
                            6,
                            'rgb(178,24,43)'
                        ],
                        'circle-stroke-color': 'white',
                        'circle-stroke-width': 1,
// Transition from heatmap to circle layer by zoom level
                        'circle-opacity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            7,
                            0,
                            8,
                            1
                        ]
                    }
                },
                'country-label-lg'
            );


        });
    }

    setFill() {
        const { property, stops } = this.props.active;
        this.map.setPaintProperty('countries', 'fill-color', {
            property,
            stops
        });
    }

    render() {
        return (
            <div ref={this.mapRef} className="absolute top right left bottom"/>
        );
    }
}

function mapStateToProps(state) {
    return {
        data: state.data,
        active: state.active
    };
}

Map = connect(mapStateToProps)(Map);

export default Map;
