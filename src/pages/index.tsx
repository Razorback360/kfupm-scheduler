import Head from "next/head";
import { Scheduler } from "@aldabil/react-scheduler";
import { api } from "@/utils/api";
import { useRef } from "react";
import { type SchedulerRef } from "@aldabil/react-scheduler/types";
import Select from 'react-select'
import { useState } from "react";
import Row from "@/components/Row";
import React,{ useEffect }from "react";
import { Tooltip } from "react-tooltip";
import usePersistState from "@/utils/usePersistState";
import { flushSync } from "react-dom";
import Script from "next/script";

export default function Home() {
  const terms = api.post.getTerms.useQuery();
  const subjects = api.post.getSubjects.useMutation();
  // const subjects = api.post.getSubjectsRegistrar.useQuery();
  const courses = api.post.getCourses.useMutation();
  // const courses = api.post.getCoursesRegistrar.useMutation();
  const [term, setTerm] = useState("")
  const [gender, setGender] = useState("")
  const [subject, setSubject] = useState("")
  const [events, setEvents] = usePersistState("events", [])
  const [addedList, setAddedList] = useState([])
  const [firstFetch, setFirstFetch] = useState({events: true, addedList:true})
  const [rows, setRows] = useState([])
  const [items, setItems] = useState(10)
  const [disable, setDisable] = useState(false)
  const [filter, setFilter] = useState("")
  
  // useEffect(() => {
  //   const loadedEvents = JSON.parse(localStorage.getItem('events'))
  //   if(loadedEvents){
  //   loadedEvents.forEach(element => {
  //     element.start = Date.parse(element.start)
  //     element.end = Date.parse(element.end)
  //   });
  //   setEvents(loadedEvents);
  // }

  
  

  // const loadedList = JSON.parse(localStorage.getItem('addedList'))
  //   if(loadedList) {
  //     setAddedList(loadedList)
  //   }
  // }, []);

  const handleScroll = async () => {
    if(!disable){
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) {
      return;
    }
    await loadRows();}
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  useEffect(() => {
  //   if(!firstFetch.events){
  //   window.localStorage.setItem('events', JSON.stringify(events));
  // }
  setFirstFetch({events: false, addedList:false})
  }, [events]);
  

  useEffect(() =>{
    if(filter){
      filterCourses(filter)
    } else {
      setDisable(false)
      if(!firstFetch.addedList){
      window.scrollTo(0,0)
      window.scrollTo(0,100000)
    }
      window.document.getElementById("filter").value = ""
    }
  }, [filter])

  const genderSelect = [{
    value: "F", label: "Female"
  }, {
    value: "C", label: "Male"
  }]

  const termSelect = []
  const subjectSelect = []
  if (terms.data) {
    terms.data.semesters.forEach(semester => termSelect.push({ value: semester, label: semester }))
  }

  const loadSubjects = (termParam: string) => {
    subjects.mutate({ term: termParam })
  }

  const loadCourses = async (subjectParam: string) => {
    await courses.mutateAsync({ term: term, subject: subjectParam, gender: gender })
    setItems(10)
    flushSync(() => {
      setRows([])
    })
    await loadRows()
  }

  const filterCourses = (filter: string) => {
    if(filter){
      
    const tempData = courses.data.data.filter(course => course.course.includes(filter))
    const tempRows = []
    tempData.forEach((course, i) => {
      console.log(course)
      tempRows.push(<Row courseName={course.course}
        key={i}
        crn={course.crn}
        location={course.area}
        time={course.startTime && course.endTime ? course.startTime.slice(0, 2) + ":" + course.startTime.slice(2, 4) + "-" + course.endTime.slice(0, 2) + ":" + course.endTime.slice(2, 4) : "Unavailable"}
        seats={course.takenSeats + "/" + course.maxSeats}
        waitlist={course.takenWait + "/" + course.maxWait}
        index={i}
        status={course.open ? "Open" : "Closed"}
        days={course.times.toUpperCase()}
        type={course.meetingType}
        instructor={course.instructor}
        scheduleRef={calendarRef}
        useStateFunc={setEvents}
        setadd={setAddedList}
        add={addedList}
        linkedCourse={course.linkedCourse}
      />
    )})
    setRows([...tempRows])
    setDisable(true)
  } else {
    setDisable(false)
  }
  }
  
  const loadRows = async () => {
    if(courses.data){
    const tempRows = []
    courses.data.data.forEach((course, i) => {
      if(i<=items){
        console.log(course)
      tempRows.push(<Row courseName={course.course}
        key={i}
        crn={course.crn}
        location={course.area}
        time={course.startTime && course.endTime ? course.startTime.slice(0, 2) + ":" + course.startTime.slice(2, 4) + "-" + course.endTime.slice(0, 2) + ":" + course.endTime.slice(2, 4) : "Unavailable"}
        seats={course.takenSeats + "/" + course.maxSeats}
        waitlist={course.takenWait + "/" + course.maxWait}
        index={i}
        status={course.open ? "Open" : "Closed"}
        days={course.times.toUpperCase()}
        type={course.meetingType}
        instructor={course.instructor}
        scheduleRef={calendarRef}
        useStateFunc={setEvents}
        setadd={setAddedList}
        add={addedList}
        linkedCourse={course.linkedCourse}
      />)}
        else{
          return
        }
    })
    setRows([...tempRows])
    setItems(items+10)
  }
  }

  if (subjects.data) {
    subjects.data.subjects.forEach(subject => subjectSelect.push({ value: subject.code, label: subject.description.replace("&amp;", "&") }))
  }


  
  const calendarRef = useRef<SchedulerRef>(null);
  
  const handleDelete = async(id): Promise<void> =>  {
    
    return new Promise((res, rej) => {
      res()})
  }
  return (
    <>
      <Head>
        <title>KFUPM Scheduler</title>
        <meta name="description" content="Plan for your upcoming term at KFUPM using KFUPM Scheduler!" />
        <link rel="icon" href="/icon.png" />
      </Head>
      <Script src="/tracking.js"></Script>
      <div className="flex flex-row items-center w-20 h-auto m-2">
      <img src="/icon.png" className=""></img>
      <p>KFUPM Scheduler</p>
      </div>
      <div className="flex-col flex w-screen min-w-full max-w-full justify-center items-center overflow-x-hidden overflow-y-auto scrollbar">
        <div className="flex-col w-3/4 p-5 bg-secondary rounded-xl mt-5">
          <Scheduler ref={calendarRef}
            week={{
              weekDays: [0, 1, 2, 3, 4],
              weekStartOn: 0,
              startHour: 7,
              endHour: 18,
              step: 60,
              disableGoToDay: true,
              navigation: false
            }}
            navigation={false}
            disableViewNavigator={true}
            editable={false}
            events={events}
            onDelete={async(id) => {
              await handleDelete(id)
              const filter = calendarRef.current?.scheduler.events.filter(event => !event.event_id.toString().includes(id))
              setEvents([...filter])
            }}
          />
          
        </div>
        <div className="flex-col flex w-3/4 flex-wrap p-3 m-5 bg-secondary rounded-xl mb-20">
          <div className="flex flex-row justify-evenly font-semibold">
            <Select placeholder="Select Semester"  options={termSelect} onChange={(e) => {
              if (e.value) {
                setTerm(e.value)
                loadSubjects(e.value)
              }
            }} className="text-black w-1/4 m-2" />
            <Select placeholder="Select Gender" options={genderSelect} onChange={(e) => {
              if (e.value) {
                setGender(e.value)
              }
            }} isDisabled={term ? false : true} className="text-black w-1/4 m-2 font-semibold" />
            <Select placeholder="Select Subject" options={subjectSelect} isDisabled={gender ? false : true} onChange={async(e) => {
              if (e.value) {
                setSubject(e.value)
                setRows([])
                setFilter("")
                await loadCourses(e.value)
                window.scrollTo(0,0)
                window.scrollTo(0,300)
              }
            }} className="text-black w-1/4 m-2 font-semibold" />
            <div className={"relative block w-1/4 m-2 h-1/4"}>

			<input
				className="w-full p-[0.45rem] text-[#808080] disabled:bg-[#f2f2f2] bg-[#ffffff] transition outline-none rounded-md"
        disabled={courses.data ? false : true}
        placeholder="Filter..."
        id="filter"
        onChange={(e) => {
          setFilter(e.target.value)
        }}
			/>
		</div>

            <Tooltip id="tooltip2" />
            <a  onClick={async (e)=> {
              const crns = []
              
              events.forEach((event, i) => {
                if(!crns.find(crn => event.event_id === crn)) crns.push(event.event_id)
              })
              await navigator.clipboard.writeText(crns.toString())
              e.view.document.getElementById("CRNS").setAttribute("data-tooltip-content", "Copied!")
              setTimeout(() => {e.view.document.getElementById("CRNS").setAttribute("data-tooltip-content", "Click to Copy!")}, 2000)

            }}><p id="CRNS" data-tooltip-id="tooltip2" data-tooltip-content="Click to Copy!" className="text-center cursor-pointer text-[#808090] bg-[#f2f2f2]  m-2 rounded-full text-sm  pl-12 pr-12">Copy CRNs</p></a>
          </div>
          <div className="flex flex-col ">
            <table className="table-fixed text-center bg-secondary rounded-lg m-2 border-separate border-spacing-y-px border-2 border-slate-500">
              <thead>
                <tr >
                  <th className="pt-3 pb-3">Course Symbol</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Instructor</th>
                  <th>Time</th>
                  <th>Days</th>
                  <th>CRN</th>
                  <th>Status</th>
                  <th>Seats</th>
                  <th>Waitlist</th>
                  <th>Add</th>
                </tr>
              </thead>
              <tbody >
                {rows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
