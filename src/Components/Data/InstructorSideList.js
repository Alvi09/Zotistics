import React, {useState} from "react";
import {Button, Card, Dropdown} from "react-bootstrap";
import './Data.css'

export default function InstructorSideList(props) {
    const [instructors , setInstructors] = useState(props.instructors); // condensed data

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
                            {x.map((j, i) => (
                                <p className="mb-2">{j.name} • {j.count}</p>
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