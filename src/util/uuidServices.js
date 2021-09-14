export const UINT_32 = 'Uint32';
export const UINT_16 = 'Uint16';
export const STRING = 'String';
export const FLOAT = 'Float';
export const UINT_8 = 'Uint8';
export const BYTE_ARRAY = 'Byte Array';
export const services = [
    {
        serviceName: 'Configuration Profile',
        serviceId: 'a970fd30',
        servicesList: [
            {
                name: 'Data Rate',
                id: 'a970fd31',
                format: UINT_32
            },
            {
                name: 'Resolution',
                id: 'a970fd32',
                format: UINT_8
            },
            {
                name: 'Battery Threshold',
                id: 'a970fd33',
                format: FLOAT
            },
            {
                name: 'View PIN',
                id: 'a970fd34',
                format: STRING
            },
            {
                name: 'Serial Number',
                id: 'a970fd35',
                format: UINT_32
            },
            {
                name: 'Data Tag',
                id: 'a970fd36',
                format: UINT_16
            },
            {
                name: 'Battery Value',
                id: 'a970fd37',
                format: FLOAT,
                properties:  {"Read": "Read"} // read
            },
            {
                name: 'System Zero',
                id: 'a970fd38',
                format: FLOAT
            },
            {
                name: 'Configuration PIN',
                id: 'a970fd39',
                format: UINT_32
            },
            {
                name: 'Model Name',
                id: 'a970fd3a',
                format: STRING,
                properties:  {"Read": "Read"} // read
            },
            {
                name: 'Firmware Version',
                id: 'a970fd3b',
                format: FLOAT,
                properties:  {"Read": "Read"} // read
            },
        ],
    },
    {
        serviceName: 'Data Profile',
        serviceId: 'a9712440',
        servicesList: [
            {
                name: 'Status',
                id: 'a9712441',
                format: UINT_8,
                properties: {"Notify": "Notify", "Read": "Read"} // read and notification
            },
            {
                name: 'Data Value',
                id: 'a9712442',
                format: FLOAT,
                properties: {"Notify": "Notify", "Read": "Read"} // read and notification
            },
            {
                name: 'Data Units',
                id: 'a9712443',
                format: UINT_8
            }
        ],
    },
    {
        serviceName: 'Calibration Profile',
        serviceId: 'a9717260',
        servicesList: [
            {
                name: 'Sensitivity Range',
                id: 'a9717261',
                format: UINT_8
            },
            {
                name: 'Coefficient Index',
                id: 'a9717262',
                format: FLOAT
            },
            {
                name: 'Linearisation Index',
                id: 'a9717263',
                format: UINT_8
            },
            {
                name: 'Linearisation Repeat',
                id: 'a9717264',
                format: UINT_8
            },
            {
                name: 'Linearisation Points',
                id: 'a9717265',
                format: UINT_8
            },
            {
                name: 'Base Value',
                id: 'a9717266',
                format: FLOAT
            },
            {
                name: 'Base Units',
                id: 'a9717267',
                format: UINT_8
            },
            {
                name: 'Data Gain',
                id: 'a9717268',
                format: FLOAT
            },
            {
                name: 'Data Offset',
                id: 'a9717269',
                format: FLOAT
            },
            {
                name: 'Calibration PIN',
                id: 'a971726a',
                format: UINT_32
            },
            {
                name: 'Calibration Units',
                id: 'a971726b',
                format: UINT_8
            },
            {
                name: 'Advanced Index',
                id: 'a971726c',
                format: UINT_8
            },
            {
                name: 'Advanced Data',
                id: 'a971726d',
                format: BYTE_ARRAY
            }
        ],
    },
];
