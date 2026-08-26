import React from 'react'
import { Link, useLoaderData } from 'react-router-dom'

const Jobs = () => {
    const jobsData = useLoaderData();

    return (
        <div className="jobs">
            {jobsData.map( (job) => {
                return <Link to={job.id.toString()} key={job.id}>
                        <h4>{job.title}</h4>
                        <h4>{job.location}</h4>
                </Link>
            })}
        </div>
    )
}

export default Jobs

// Run the bracket command to create API of data.json file under assets folder (npx json-server --watch data.json --port 5000)
export const jobsLoader = async () => {
    const res = await fetch("http://localhost:4000/jobs");
    if (!res.ok) {
      throw Error("Failed to fetch jobs data");
    }
    return res.json();
};

