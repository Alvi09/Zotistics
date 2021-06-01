import React, {useState} from "react";
import './Data.css'
import {Accordion, Button, Card, Dropdown} from "react-bootstrap";

export default function ClassSideList({classDisplay, sideInfoHeight, data}){
    const [courses , setCourses] = useState(data);

    const handleSortAmount = (e) => {
        e.preventDefault();
        let result = JSON.parse(JSON.stringify(courses));

        for(let i = 0; i < courses.length; i++){
            result[i].sort((a, b) => b.count - a.count);
        }

        setCourses(result);
    }

    const handleSortName = (e) => {
        e.preventDefault();
        let result = JSON.parse(JSON.stringify(courses));

        for(let i = 0; i < courses.length; i++){
            result[i].sort((a, b) => {
                let fa = a.name.toLowerCase()
                let fb = b.name.toLowerCase();

                if (fa < fb) { return -1; }
                if (fa > fb) { return 1; }
                return 0;
            });
        }

        setCourses(result);
    }

    return (
        <Card className="overflow-auto shadow-sm" style={{ display: classDisplay, maxHeight: sideInfoHeight }} id="cardList">
            <Card.Body className="px-0">
                <h5 className="card-title mb-0">Classes</h5>
                <p className="mb-0" style={{ fontSize: "0.75rem" }}><i>Click class to expand</i></p>
                <Dropdown>
                    <Dropdown.Toggle size="sm" className="sidelist-sort-btn">
                        Sort
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item value="amount" onClick={handleSortAmount}>Amount</Dropdown.Item>
                        <Dropdown.Item value="name" onClick={handleSortName}>Name</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                {courses.map((x, idx) => (
                    <>
                    {x.map((c, idx) => (
                                <Accordion key={idx}>
                                    <Accordion.Toggle className="text-decoration-none shadow-none text-dark" as={Button}
                                                      variant="link" eventKey="0">
                                        {c.name} • {c.count}
                                    </Accordion.Toggle>
                                    <Accordion.Collapse eventKey="0">
                                        <div>
                                            {c.courses.map((j, idx) => (
                                                    <Card.Text key={idx} style={{fontSize: '0.7rem'}}>{j.year} {j.quarter} - {j.code}</Card.Text>
                                                )
                                            )}
                                        </div>
                                    </Accordion.Collapse>
                                </Accordion>
                            )
                        )}
                        {idx < courses.length - 1 &&
                        <p key={idx} className="p-0 m-0">---</p>
                        }
                    </>
                ))}
            </Card.Body>
        </Card>);
}