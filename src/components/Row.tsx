import React, { RefObject, useState } from "react";
import { type SchedulerRef } from "@aldabil/react-scheduler/types";
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { useDebouncedCallback } from "use-debounce";
import { link } from "fs";

export default function Row({ courseName, crn, location, time, seats, waitlist, index, status, days, type, instructor, scheduleRef, useStateFunc, add, setadd, linkedCourse}: { courseName: string, crn: string, location: string, time: string, seats: string, waitlist: string, index: number, status: string, days: string, type: string, instructor: string, scheduleRef: RefObject<SchedulerRef>, useStateFunc: {}, add: [], setadd: {}, linkedCourse: {} | null | undefined | void}) {
    const [added, setAdded] = useState(false)

    function getRandomColor() {
        const red = 233;
        const green = Math.floor(Math.random()*(255 - 0 + 1) + 0);
        const blue = Math.floor(Math.random()*(255 - 0 + 1) + 0);
        const hex = "#" + (red.toString(16).length == 1 ? "0" + red.toString(16) : red.toString(16)) + (green.toString(16).length == 1 ? "0" + green.toString(16) : green.toString(16)) + (blue.toString(16).length == 1 ? "0" + blue.toString(16) : blue.toString(16))
        return hex
      }
    
    const handleAction = useDebouncedCallback(() => {
        if (scheduleRef.current?.scheduler.events.find(event => crn === event.event_id)) {
            
            let copy = [...scheduleRef.current?.scheduler.events]
            let remove = copy.filter(event => !event.event_id.includes(crn))
            useStateFunc([...remove])

            setAdded(false)
                const elements = window.document.querySelectorAll("."+courseName).forEach(element => {
                    element.textContent = "+"
                })
        } else {

            const getDay = (requestedDay: number) => {
                const d = new Date(new Date());
                const day = d.getDay(), diff = d.getDate() - day + requestedDay;
                return new Date(d.setDate(diff));
            }

            

            const color = getRandomColor()
            const eventList = []
            const addLinked = () => {
                if(linkedCourse){
                for(let index = 0; index < linkedCourse.times.length; index++) {
                    let day = 0
                    console.log(linkedCourse.times, linkedCourse.times[index])
                    switch (linkedCourse.times[index].toUpperCase()) {
                        case "U":
                            
                            day = 0
                            break;
                        case "M": 
                            day = 1
                            break
                        case "T": 
                            day = 2
                            break;
                        case "W": 
                            day = 3
                            break;
                        case "R": 
                            day = 4
                            break;
                    }
                    console.log(day)
                    const linkedTime = linkedCourse.startTime && linkedCourse.endTime ?  linkedCourse.startTime.slice(0, 2) + ":" + linkedCourse.startTime.slice(2, 4) + "-" + linkedCourse.endTime.slice(0, 2) + ":" + linkedCourse.endTime.slice(2, 4) : "Unavailable"
                    if(scheduleRef.current?.scheduler.events.find(event => (new Date(new Date(getDay(day).setHours(parseInt(linkedTime.split(":")[0]))).setMinutes(parseInt(linkedTime.split(":")[1]?.split("-")[0]))) <= event.end) && (new Date(new Date(getDay(day).setHours(parseInt(linkedTime.split(":")[1]?.split("-")[1]))).setMinutes(parseInt(linkedTime.split(":")[2]))) >= event.start))){
                        test = true
                        break;
                    }else{
                    eventList.push({ event_id: linkedCourse.crn, title: linkedCourse.course +" @ " +linkedCourse.area + " - " +linkedCourse.crn, start: new Date(new Date(getDay(day).setHours(parseInt(linkedTime.split(":")[0]))).setMinutes(parseInt(linkedTime.split(":")[1]?.split("-")[0]))), end: new Date(new Date(getDay(day).setHours(parseInt(linkedTime.split(":")[1]?.split("-")[1]))).setMinutes(parseInt(linkedTime.split(":")[2]))), editable: false, color: color, deletable: true})
                }}}
            }
            let test = false
            for (let index = 0; index < days.length; index++) {
                let day = 0
                switch (days[index]) {
                    case "U": 
                        day = 0
                        break;
                    case "M": 
                        day = 1
                        break
                    case "T": 
                        day = 2
                        break;
                    case "W": 
                        day = 3
                        break;
                    case "R": 
                        day = 4
                        break;
                }
                console.log(time, time.split(":"))
                if(scheduleRef.current?.scheduler.events.find(event => (new Date(new Date(getDay(day).setHours(parseInt(time.split(":")[0]))).setMinutes(parseInt(time.split(":")[1]?.split("-")[0]))) <= event.end) && (new Date(new Date(getDay(day).setHours(parseInt(time.split(":")[1]?.split("-")[1]))).setMinutes(parseInt(time.split(":")[2]))) >= event.start))){
                    test = true
                    console.log("oi")
                    break;
                }
                
                eventList.push({ event_id: crn, title: courseName +" @ " +location + " - " +crn, start: new Date(new Date(getDay(day).setHours(parseInt(time.split(":")[0]))).setMinutes(parseInt(time.split(":")[1]?.split("-")[0]))), end: new Date(new Date(getDay(day).setHours(parseInt(time.split(":")[1]?.split("-")[1]))).setMinutes(parseInt(time.split(":")[2]))), editable: false, color: color, deletable: true})
            }
            if(!test){
                addLinked()
                console.log(eventList)
            useStateFunc([...scheduleRef.current?.scheduler.events, ...eventList])
            
                const elements = window.document.querySelectorAll("."+courseName).forEach(element => {
                    element.textContent = "x"
                })
        }}
    },500)

    return (
        <tr className={`bg-${index % 2 == 0 ? "primary" : "secondary"} border-secondary rounded-lg`}>
            <td className="p-3">
                {courseName}
            </td>
            <td>
            <span className={`pl-3 pr-3 pt-2 pb-2 rounded-full bg-${index % 2 == 0 ? "secondary" : "primary"} border border-slate-500`}>
                {type}
                </span>
            </td>
            <td>
                {location}
            </td>
            <td className="break-words">
                {instructor}
            </td>
            <td>
                {time}
            </td>
            <td>
                {days}
            </td>
            <td><a data-tooltip-id={crn+type} data-tooltip-content="Click to Copy!" className={`pl-3 pr-3 pt-2 pb-2 rounded-full cursor-pointer bg-${index % 2 == 0 ? "secondary" : "primary"} border border-slate-500`} onClick={async(e) => {
                await navigator.clipboard.writeText(crn)
                e.target.setAttribute("data-tooltip-content", "Copied!")
                setTimeout(() => {e.target.setAttribute("data-tooltip-content", "Click to Copy!")}, 2000)
            }}>{crn}</a>
                <Tooltip id={crn+type} />
            </td>
            <td>
                <p  className={`p-1 m-2 ${status === "Open" ? "bg-green-500" : status === "Closed" ? "bg-red-500" : "bg-orange-500"} rounded-full`}>{status}</p>
            </td>
            <td>
                <p className={`p-1 m-2 ${seats.split("/")[0] / seats.split("/")[1] < 0.5 ? "bg-green-500" : seats.split("/")[0] / seats.split("/")[1] === 1 ? "bg-red-500" : "bg-orange-500"} rounded-full`}>
                    {seats}
                </p>
            </td>
            <td>
                <p className={`p-1 m-2 ${waitlist.split("/")[0] / waitlist.split("/")[1] < 0.5 ? "bg-green-500" : waitlist.split("/")[0] / waitlist.split("/")[1] === 1 ? "bg-red-500" : "bg-orange-500"} rounded-full`}>
                    {waitlist}
                </p>
            </td>
            <td>
                <a onClick={handleAction} className="cursor-pointer">
                    <span className={`${ scheduleRef.current?.scheduler.events.find(event => crn === event.event_id) || added ? "pl-3 pr-3 pt-2 pb-2 bg-red-600" : "pl-[0.80rem] pr-[0.80rem] pt-2 pb-2 bg-"}${index % 2 == 0 ? "secondary" : "primary"} ${courseName} text-m rounded-full border border-slate-500`}>
                        {scheduleRef.current?.scheduler.events.find(event => crn === event.event_id) || added ? "x" : "+"}
                    </span>
                </a>
            </td>
        </tr>
    );
}
