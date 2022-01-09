import React, { useEffect, useState } from 'react';
import {Row, Col, Form, Button} from "react-bootstrap";
import { Bar } from 'react-chartjs-2';
import InfoModal from './Modal'
import ClassSideList from "./ClassSideList";
import InstructorSideList from "./InstructorSideList";

export default function DataPage(props) {
    const [data, setData] = useState(JSON.parse(JSON.stringify(props.data)))
    const [instructorDisplay, setInstructorDisplay] = useState("none"); //display none or inherit
    const [classDisplay, setClassDisplay] = useState("none"); //display none or inherit
    const [sideInfoHeight, setSideInfoHeight] = useState("0px"); // max height for the side cards that changes on window resize
    const [chartSwitch, setChartSwitch] = useState(false); //true = numbers, false = percent
    const labels =  ['A', 'B', 'C', 'D', 'F', 'P', 'NP'];
    const [show, setShow] = useState(false); // Modal display
    const [excludeInstructors, setExcludeInstructors] = useState(new Set()) // instructor name
    const [excludeCourses, setExcludeCourses] = useState(new Set()) // course department and number
    const [removedClasses, setRemovedClasses] = useState(new Set()) // removed course objects

    // caps viewable side list
    const MAX_INSTRUCTORS = 500
    const MAX_CLASSES = 500

    const handleModalClose = () => setShow(false);
    const handleModalShow = () => setShow(true);

    useEffect(() => {
        let percent = dataForGraph(true);
        setGraphDataPercent(percent);
        setGraphDataPopulation(dataForGraph(false));
        setChartData({labels:labels, datasets: percent})
        // setInstructorAmount(data.map(x => Object.keys(x.instructors).length).reduce((a, b) => a + b))
        // setClassAmount(data.map(x => x.count).reduce((a, b) => a + b))
    }, [data])

    /*
      returns array of colors for use in chartjs
      [
        [Acolor, Bcolor, Ccolor, Dcolor, Fcolor, Pcolor, NPcolor],  //form 1(always blue n yellow)
        [Acolor, Bcolor, Ccolor, Dcolor, Fcolor, Pcolor, NPcolor],  //form 2
        [Acolor, Bcolor, Ccolor, Dcolor, Fcolor, Pcolor, NPcolor],  //form 3
        [Acolor, Bcolor, Ccolor, Dcolor, Fcolor, Pcolor, NPcolor]   //form 4
      ]
    */
    const getGraphColors = (numGraphs) => {
        const NUMBARS = 7;
        const OPACITY = 0.6

        //im going straight to hell
        let colors = props.HSL.map(([h, s, l]) => Array(...Array(NUMBARS)).map(() => `hsla(${h},${s}%,${l}%,${OPACITY})`))

        if (numGraphs === 1) {
            //change the first one to yellow for pnp
            let [h, s, l] = [43, 100, 67];
            colors[0][5] = `hsla(${h},${s}%,${l}%,${OPACITY})`;
            colors[0][6] = `hsla(${h},${s}%,${l}%,${OPACITY})`;
        }
        return colors;
    }

    /*
        Creates an array of objects with the grade data and colors
        to put in the graph dataset in DataPage.js
    */
    const dataForGraph = (percent) => {
        let dataset = [];
        let colors = getGraphColors(Object.keys(data).length);
        let count = 0;

        for (let d of data) {
            let dataPopulation = [d.a, d.b, d.c, d.d, d.f, d.p, d.np];
            let sum = dataPopulation.reduce((a, b) => a + b);
            let dataPercentage = dataPopulation.map(num => (100 * num / sum).toFixed(2));

            dataset.push({
                data: percent ? dataPercentage : dataPopulation,
                backgroundColor: colors[count],
                label: `${count}`
            });
            count++;
        }

        return dataset;
    }

    const [graphDataPercent, setGraphDataPercent] = useState(dataForGraph(true));
    const [graphDataPopulation, setGraphDataPopulation] = useState(dataForGraph(false));
    const [chartData, setChartData] = useState({labels:labels, datasets: graphDataPercent});

    let options = {
        responsive: true,
        maintainAspectRatio: true,
        legend: { display: false },
        animation: { duration: 1000 },
        tooltips: {
            callbacks: {
                label: function(tooltipItem) {
                    return tooltipItem.yLabel;
                }
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                },
                gridLines: {
                    color: props.nightMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)" //change later
                },
                scaleLabel: {
                    display: true,
                    labelString: chartSwitch?"Students":"Percent"
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: false,
                    labelString: 'Grade'
                },
                gridLines: {
                    color: props.nightMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)" //change later
                },
            }]
        }
        
    }


    useEffect(()=>updateChartOptions(), [chartSwitch])
    useEffect(()=>updateChartOptions(), [props.nightMode])
    useEffect(() => init(), []);
    //when gradelistpercentage changes, set chart data to it

    const init = () => {
        //stuff to run at start
        resizeSideLists();
        window.addEventListener("resize", resizeSideLists);
    }

    const resizeSideLists = () => {
        let height = document.getElementById('graphDiv').offsetHeight + document.getElementById('topDiv').offsetHeight;
        setSideInfoHeight(height.toString() + "px");
    }

    const displayInstructorList = (e) => {
        e.preventDefault();
        if (instructorDisplay === "none") {
            setInstructorDisplay("inherit");
        } else {
            setInstructorDisplay("none");
        }
    }

    const displayClassList = (e) => {
        e.preventDefault();
        if (classDisplay === "none") {
            setClassDisplay("inherit");
        } else {
            setClassDisplay("none");
        }
    }

    const updateChartOptions = () =>{
        options = {
            responsive: true,
            maintainAspectRatio: true,
            legend: { display: false },
            animation: { duration: 1000 },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: {
                        color: props.nightMode ?  "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)" //change later
                    },
                    scaleLabel: {
                        display: true,
                        labelString: chartSwitch?"Students":"Percent"
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: false,
                        labelString: 'Grade'
                    },
                    gridLines: {
                        color: props.nightMode ?  "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)" //change later
                    },
                }]
            }
        }
        setChartData({labels:labels, datasets: chartSwitch?graphDataPopulation:graphDataPercent});
    }

    return (
        <>
            <Row className="data-row">
                {/* Instructor Side List */}
                <Col sm={2} className="justify-content-center text-center px-0">
                    {props.instructorAmount <= MAX_INSTRUCTORS &&
                        <InstructorSideList
                            instructorDisplay={instructorDisplay}
                            sideInfoHeight={sideInfoHeight}
                            data={data}
                            instructors={props.instructors}
                            setData={setData}
                            queryParams={props.queryParams}
                            removedClasses={removedClasses}
                            setRemovedClasses={setRemovedClasses}
                            exludeInstructors={excludeInstructors}
                            setExcludeInstructors={setExcludeInstructors}
                            exludeCourses={excludeCourses}
                        />
                    }
                </Col>

                {/*middle section */}
                <Col sm={8}>
                    {/* Links to expand Instructor and Classes Lists */}
                    <Row className="justify-content-between mb-1 px-2" id="topDiv">
                        <Col>
                            {props.instructorAmount <= MAX_INSTRUCTORS
                                ? <Button className="side-list-toggle" onClick={displayInstructorList}>&#x2B9C; {props.instructorAmount} Instructors</Button>
                                : <p className="text-decoration-none shadow-none text-dark m-0">{props.instructorAmount} Instructors</p>
                            }
                        </Col>
                        <Col className="text-center">
                            <h5 className="main-text-color">{data.length === 1 ? data[0].quarter + ' ' + data[0].year : 'Multiple'}</h5>
                        </Col>
                        <Col className="text-end pe-0">
                            {props.classAmount <= MAX_CLASSES
                                ? <Button className="side-list-toggle" onClick={displayClassList}>{props.classAmount} Classes &#x2B9E;</Button>
                                : <p className="text-decoration-none shadow-none text-dark m-0">{props.classAmount} Classes</p>
                            }
                        </Col>

                    </Row>

                    {/* Graph */}
                    <Row className="justify-content-center" id="graphDiv">
                        <Col sm={12}>
                            <Bar
                                data={chartData}
                                width={100}
                                height={50}
                                options={options}
                            />
                        </Col>
                    </Row>

                    {/* Buttons and GPA */}
                    <Row className="">
                        <Col sm={3}>
                            {props.classAmount <= MAX_CLASSES &&
                            <Button variant="outline-secondary" size="sm" onClick={handleModalShow}>
                                Details
                            </Button>
                            }
                        </Col>
                        <Col sm={6} className="text-center">
                            <p className="main-text-color">GPA: {data.map(obj =>obj.averageGPA).join(", ")}</p>
                        </Col>
                        <Col sm={3} className="d-flex justify-content-end">
                            <Form.Switch
                                id="chartSwitch"
                                checked={chartSwitch}
                                onChange={()=>setChartSwitch(!chartSwitch)}
                                onClick={e => e.target.blur()}
                                label="Numbers"
                            />
                        </Col>
                    </Row>
                </Col>

                {/* Class Side List*/}
                <Col sm={2} className="justify-content-center text-center px-0">
                    {props.classAmount <= MAX_CLASSES &&
                        <ClassSideList
                            classDisplay={classDisplay}
                            sideInfoHeight={sideInfoHeight}
                            data={data}
                            classes={props.classes}
                            setData={setData}
                            queryParams={props.queryParams}
                            removedClasses={removedClasses}
                            setRemovedClasses={setRemovedClasses}
                            exludeCourses={excludeCourses}
                            setExcludeCourses={setExcludeCourses}
                            exludeInstructors={excludeInstructors}
                        />
                    }
                </Col>
            </Row>
            {props.classAmount <= MAX_CLASSES &&
                <InfoModal handleModalClose={handleModalClose} show={show} data={data} />
            }
        </>
    );
}