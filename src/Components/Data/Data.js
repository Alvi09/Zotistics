import React, { useState } from 'react';
import DataPage from './DataPage';
import {classList, instructorList} from "../Search/calculations";

export default function Data(props) {
    const [data, setData] = useState(JSON.parse(JSON.stringify(props.data)))
    const [classes] = useState(props.data.map(x => classList(x.courseList)))
    const [instructors] = useState(props.data.map(x => instructorList(x.courseList)))
    const [instructorAmount] = useState(instructors.map(arr => arr.length).reduce((a, b) => a + b))
    const [classAmount] = useState(classes.map(arr => arr.map(obj => obj.count).reduce((a, b) => a + b))[0])
    const [gpa, setGPA] = useState(0.00)

    let excludeCourses = new Set() // course department and number

    const removeCourse = (e, formID, dept, num) => {
        e.preventDefault();
        let result = [];

        excludeCourses.add(`${dept} ${num}`)

        if(e.target.checked){
            for(let course of data[formID].courseList) {
                const title = `${course.course_offering.course.department} ${course.course_offering.course.number}`
                if(title in excludeCourses){

                }
            }
        } else {

        }
    }

    return (
        <>
            <DataPage
                data={data}
                classes={classes}
                instructors={instructors}
                nightMode={props.nightMode}
                setResults={props.setResults}
                queryParams={props.queryParams}
                HSL={props.HSL}
                instructorAmount={instructorAmount}
                classAmount={classAmount}
            />
        </>
    )
}