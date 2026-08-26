import React from 'react'
import { useLoaderData} from 'react-router-dom'
import './JobDetails.css';


const JobDetails = () => {
    const jobDetails = useLoaderData();
  return (
    <div className="job-details">
        <p><b>Job Title: </b>{jobDetails.title}</p> <br/>
        <p><b>Salary: </b>{jobDetails.salary}</p>    <br/>
        <p><b>Job Location: </b>{jobDetails.location}</p> <br/>
        <p><b>Job Description: </b>{jobDetails.description}</p> <br/>
        <button className="btn button1">Apply Now</button>
    </div>
  )
}

export default JobDetails


export const jobDetailsLoader = async({params}) => {
    const {id} = params;
    const res = await fetch("http://localhost:4000/jobs/" + id);
    if (!res.ok) {
      throw Error("Failed to fetch jobs data");
    }
    return res.json();
};
    