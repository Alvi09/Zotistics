import React, {useState} from "react";
import {Card, Dropdown, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import {calculateData} from "../Search/calculations";
import './Data.css'

export default function InstructorSideList(props) {
    const [instructors , setInstructors] = useState(props.data.map(x => x.instructors)); // condensed data

    // useEffect(() => {
    //     setInstructors(props.data.map(x => x.instructors))
    // }, [props.data])

    const handleSortAmount = (e) => {
        e.preventDefault();
        let result = JSON.parse(JSON.stringify(instructors)); // deep copy

        for(let i = 0; i < instructors.length; i++){
            result[i].sort((a, b) => b.count - a.count); // sorts descending
        }

        setInstructors(result);
    }

    const handleSortName = (e) => {
        e.preventDefault();
        let result = JSON.parse(JSON.stringify(instructors)); // deep copy

        for(let i = 0; i < instructors.length; i++){
            result[i].sort((a, b) => {
                let fa = a.name.toLowerCase()
                let fb = b.name.toLowerCase();

                // sorts ascending
                if (fa < fb) { return -1; }
                if (fa > fb) { return 1; }
                return 0;
            });
        }

        setInstructors(result);
    }

    const modifyInstructor = (e, idx, inst) => {
        e.preventDefault();
        let result = JSON.parse(JSON.stringify(props.data));
        let cl = result[idx].courseList;
        let removed = new Set(props.removedClasses);
        let exclude = new Set(props.exludeInstructors)

        if(e.target.checked){ // removes courses with the specified instructor
            for(let i = cl.length - 1; i >= 0; i--){
                if(cl[i].course_offering.instructors[0].shortened_name === inst){
                    removed.add(cl[i])
                    exclude.add(inst)
                    cl.splice(i, 1);
                }
            }
        } else { // adds back the courses with the specified instructor
            for(let course of props.removedClasses){
                let name = `${course.course_offering.course.department} ${course.course_offering.course.number}`
                if(course.course_offering.instructors[0].shortened_name === inst && !props.exludeCourses.has(name)) {
                    cl.push(course)
                    removed.delete(course)
                    exclude.delete(inst)
                }
            }
        }

        let final = calculateData(cl, props.queryParams, undefined, false)
        final.color = result[idx].color
        result[idx] = final
        props.setData(result);
        props.setRemovedClasses(removed)
        props.setExcludeInstructors(exclude)
    }

    return (
        <div style={{ display: props.instructorDisplay}}>
            <Card className="overflow-auto shadow-sm" style={{ maxHeight: props.sideInfoHeight }}>
                <Dropdown className="text-end">
                    <Dropdown.Toggle size="sm" className="sidelist-sort-btn">
                        Sort
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item value="amount" onClick={handleSortAmount}>Amount</Dropdown.Item>
                        <Dropdown.Item value="name" onClick={handleSortName}>Name</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Card.Body className="px-0 pt-1">
                    <h5 className="card-title mb-1">Instructors</h5>
                    {instructors.map((x, idx) => (
                        <div key={idx}>
                            {x.map(j => (
                                <ToggleButtonGroup key={`${j.name}${idx}`} type="checkbox" className="">
                                    <ToggleButton className="sidelist-item px-1 mb-1" value={1} onClick={e => e.target.blur()} onChange={e => modifyInstructor(e, idx, j.name)}>
                                        {j.name} • {j.count}
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            ))}
                            {/* Adds line divider between different query tabs*/}
                            {idx < instructors.length - 1 &&
                            <p className="p-0 m-0">-----</p>
                            }
                        </div>
                    ))}
                </Card.Body>
            </Card>
        </div>
    );
}