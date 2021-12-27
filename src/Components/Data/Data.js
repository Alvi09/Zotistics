import React, { useState } from 'react';

export default function DataPage(props) {
    const [data, setData] = useState(JSON.parse(JSON.stringify(props.data)))
    const [instructorAmount] = useState(data.map(x => Object.keys(x.instructors).length).reduce((a, b) => a + b))
    const [classAmount] = useState(data.map(x => x.count).reduce((a, b) => a + b))
}