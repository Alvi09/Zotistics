import React, { useState, useEffect } from "react";
import "./searchform.css";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import DataPage from "../Data/DataPage";
import SearchForm from "./SearchForm";
import FormTabs from "./FormTabs"
import {useLocation} from 'react-router-dom';
const calc = require('./calculations');

//const OPACITY = 0.6
const HSL = [[204, 82, 57], //blue
    [130, 84, 73], //green
    [8, 100, 67], //orange
    [344, 68, 80]] //pink

const API_URL = 'https://api.peterportal.org/graphql'
const GRAPHQL_INSTRUCTOR_QUERY = `
    query {
      grades {
        instructors
      }
    }
`
const GRAPHQL_GRADE_QUERY = `
    query(
        $instructor: String
        $quarter: String
        $year: String
        $department: String
        $number: String
        $code: String
        $excludePNP: Boolean!
    ) {
        grades(
        instructor: $instructor
        quarter: $quarter
        year: $year
        department: $department
        number: $number
        code: $code
        excludePNP: $excludePNP
        ) {
        aggregate {
            sum_grade_a_count
            sum_grade_b_count
            sum_grade_c_count
            sum_grade_d_count
            sum_grade_f_count
            sum_grade_p_count @skip(if: $excludePNP)
            sum_grade_np_count @skip(if: $excludePNP)
            average_gpa
        }
        grade_distributions {
            grade_a_count
            grade_b_count
            grade_c_count
            grade_d_count
            grade_f_count
            grade_p_count @skip(if: $excludePNP)
            grade_np_count @skip(if: $excludePNP)
            average_gpa
            course_offering {
            year
            quarter
            instructors {
                name
                shortened_name
            }
            section {
                code
            }
            course {
                department
                number
                title
            }
            }
        }
        }
    }
`

const INITIAL_INSTRUCTORS = [
    { name: "PATTIS, R.", value: "PATTIS, R." },
    { name: "LEVIN, K.", value: "LEVIN, K." },
    { name: "SEONG, A.", value: "SEONG, A." },
    { name: "SPENCER, P.", value: "SPENCER, P." },
    { name: "WOLFF, B.", value: "WOLFF, B." }];

/*
  Handles all the searchforms, and keeps track of state of each form
  Also handles fetching instructors list, fetching results, and setting page to data
*/
export default function Search({ nightMode }) {
    const [instructors, setInstructors] = useState(INITIAL_INSTRUCTORS);

    const [currentForm, setCurrentForm] = useState(1);
    const [lastFormID, setLastFormID] = useState(0);
    const [results, setResults] = useState([]);
    // const [resultsPercent, setResultsPercent] = useState([]);
    // const [resultsPopulation, setResultsPopulation] = useState([]);
    const [queryParams, setQueryParams] = useState();
    const [showFormTabs, setShowFormTabs] = useState(false) // only show after first search
    let query = new URLSearchParams(useLocation().search);

    const EMPTY_STATE = {
        formID: 1, //make sure to change this when using this
        color: `hsl(${HSL[0][0]}, ${HSL[0][1]}%, ${HSL[0][2]}%)`,
        instructor: query.get("instructor") || "",
        quarters: query.get("quarters")?query.get("quarters").split(","):[],
        years: query.get("years")?query.get("years").split(","):[],
        department: query.get("department") || "",
        classNumber: query.get("classNumber") || "",
        classCode: query.get("classCode") || "",
        advancedVisible: query.get("advancedVisible") || false,
        excludePNP: query.get("excludePNP") || false,
        covid19: query.get("covid19") || false,
        lowerDiv: query.get("lowerDiv") || false,
        upperDiv: query.get("upperDiv") || false
    }
    const [forms, setForms] = useState({
        1: EMPTY_STATE
    }); // {formID: formState}

    //on component mount, fetch instructors and add a form
    useEffect(() => fetchInstructors(), []);
    //check currentform in forms and update lastformid on change of forms{}
    useEffect(() => updateFormNumbers(), [forms]);

    // useEffect(()=> {
    //     setResultsPercent(dataForGraph(results, true));
    //     setResultsPopulation(dataForGraph(results, false));
    // }, [results])


    /*
      checks if currentForm is in forms{}
      if not, set currentforms to last formID
      also updates lastFormID
      called on every change of forms
    */
    const updateFormNumbers = () => {
        if (!(currentForm in forms)) {
            const formIDs = Object.keys(forms);
            const id = formIDs[formIDs.length - 1];
            setCurrentForm(id);
            console.log("updating currentformid to " + id);
        }
        setLastFormID(lastFormID + 1)
        return null;
    }
    /*
      called by SearchForm component with currentFormID
    */
    const handleFormValueChange = ({ formID, name, value }) => {
        if (!(formID in forms)) {
            console.log("Form " + formID + " not found in forms");
            console.log(Object.keys(forms));
            return;
        }
        let formState = forms[formID];
        formState[name] = value;
        setForms({ ...forms, [formID]: formState });
    }

    /*
      Adds a new form and formstate
    */
    const addForm = () => {
        let newFormID = lastFormID + 1;
        const i = Object.keys(forms).length //index in HSL array
        let newState = {
            formID: newFormID, //make sure to change this when using this
            color: `hsl(${HSL[i][0]}, ${HSL[i][1]}%, ${HSL[i][2]}%)`,
            instructor: "",
            quarters: [],
            years: [],
            department: "",
            classNumber: "",
            classCode: "",
            advancedVisible: false,
            excludePNP: false,
            covid19: false,
            lowerDiv: false,
            upperDiv: false
        }
        var newForms = Object.assign({ [newFormID]: newState }, forms);
        setForms(newForms);
        setCurrentForm(newFormID);
    }

    /*
      Removes form with given formID
    */
    const removeForm = (formID) => {
        //copy forms
        var newForms = Object.assign({}, forms);
        delete newForms[formID];

        //reassign colors
        newForms = reassignColors(newForms);

        setCurrentForm(Object.keys(newForms).length - 1);
        setForms(newForms);
        updateFormNumbers();

    }

    const reassignColors = (formStates) => {
        let i = 0;
        for (let f in formStates) {
            formStates[f].color = `hsl(${HSL[i][0]}, ${HSL[i][1]}%, ${HSL[i][2]}%)`
            i++;
        }
        return formStates;
    }

    const fetchInstructors = async () => {
        fetch(API_URL, {
            body: JSON.stringify({'query': GRAPHQL_INSTRUCTOR_QUERY}),
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            }})
            .then(res => res.json())
            .then(res => {
                setInstructors(
                    res.data.grades.instructors.map((teacher) => ({
                        name: teacher,
                        value: teacher,
                    })))
            }).then(addForm());
    }

    /*
    fetches results for one particular form as JSON
    */
    const fetchDataFromForm = async (formID) => {
        return fetch(API_URL, {
            body: JSON.stringify({"query": GRAPHQL_GRADE_QUERY, "variables": calc.getQueryVariables(forms[formID])}),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'Zotistics-48e7d5db47d3bf0ebfef45fe0aea7b3df77d0c77b243ee4bc9b780df6c9dd91f'
            }})
            .then(res => res.json())
            .then(data => {
                let params = forms[formID];
                let filtered = calc.filter(data.data.grades.grade_distributions, params.covid19, params.lowerDiv, params.upperDiv);
                let classList = filtered.reverse() // reversed to order it from most recent to oldest
                let result = calc.calculateData(classList, params, data)
                setQueryParams(params);
                setShowFormTabs(true);

                return Object.assign({ color: forms[formID].color }, result);
            });
    }

    /*
    Runs when submit button is clicked
    For each formID in formStates, fetches from /search
    and adds to results a new key/value pair where
    key=formID and value=allTheDataForThatForm
    */
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setResults([]);
        console.log("form submitted");
        const getResultData = async () => {
            return Promise.all(
                Object.keys(forms).map(async (formID) => {
                    return await fetchDataFromForm(formID);
                })
            );
        };
        getResultData().then((res) => {
            setResults(res);
        });
    };


    return (
        <div className="search-content-wrapper">
            <Container>
                <Form>
                    <Row>
                        {currentForm in forms ?
                            <SearchForm
                                formID={currentForm}
                                instructors={instructors}
                                handleFormValueChange={handleFormValueChange}
                                state={forms[currentForm]}
                                onSubmit={handleFormSubmit}
                            /> : null}
                    </Row>
                    {showFormTabs &&
                    <Row className="justify-content-center">
                        <Col sm={2} />
                        <Col sm={8}>
                            {lastFormID > 0 &&
                            <FormTabs
                                currentForm={currentForm}
                                forms={forms}
                                setCurrentForm={setCurrentForm}
                                removeForm={removeForm}
                                addForm={addForm}
                            />
                            }
                        </Col>
                        <Col sm={2} />
                    </Row>
                    }
                </Form>

                {results.length !== 0 &&
                <DataPage
                    data={results}
                    nightMode={nightMode}
                    setResults={setResults}
                    queryParams={queryParams}
                    HSL={HSL}
                />
                }
            </Container>
        </div>
    );
}