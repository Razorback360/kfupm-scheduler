import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import makeFetchCookie from 'fetch-cookie'
import {parse} from "node-html-parser"

const randomGen = () => {
  let random = ""
  for (let i = 0; i < 14; i++) {
    random = random + Math.floor(Math.random() * (11 - 0) + 0)
  }
  return random
}

const getTime = (times: { u: boolean, m: boolean, t: boolean, w: boolean, r: boolean }) => {
  let type = ""
  for (const [key, value] of Object.entries(times)) {
    if (value) type = type + key
  }
  return type
}
export const postRouter = createTRPCRouter({
  getSubjects: publicProcedure
    .input(z.object({ term: z.string() }))
    .mutation(async ({ input }) => {
      const random = randomGen()
      const req = await fetch(`https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/classSearch/get_subject?searchTerm=&term=${input.term}&offset=1&max=50&_=${random}&uniqueSessionId=tqqwr${random}`, {next: {revalidate: 3600}})
      const res: { code: string, description: string }[] = await req.json() as { code: string, description: string }[]
      return {
        subjects: res,
      };
    }),

  getTerms: publicProcedure
    .query(async ({ }) => {
      const random = randomGen()
      const req = await fetch(`https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/classSearch/getTerms?searchTerm=&offset=1&max=5&_=${random}`, {next: {revalidate: 3600}})
      const res: { code: string, description: string }[] = await req.json() as { code: string, description: string }[]
      const semesters: string[] = []
      res.forEach(semester => {
        semesters.push(semester.code)
      });
      return {
        semesters: semesters,
      };
    }),

  getCourses: publicProcedure
    .input(z.object({ term: z.string(), subject: z.string(), gender: z.string() }))
    .mutation(async ({ input }) => {
      const fetchCookie = makeFetchCookie(fetch)
      const random = randomGen()
      let req = await fetchCookie("https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/registration")
      req = await fetchCookie("https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/term/termSelection?mode=search")
      req = await fetchCookie(`https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/classSearch/getTerms?searchTerm=&offset=1&max=10`)
      const formData = new FormData()
      formData.append("term", input.term)
      formData.append("uniqueSessionId", random)
      req = await fetchCookie("https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/term/search?mode=search", {
        method: "POST",
        body: formData,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
        }
      })
   
      // req = await fetchCookie("https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/classSearch/classSearch")
      // req = await fetchCookie(`https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/classSearch/get_subject?searchTerm=&term=${input.term}&offset=1&max=10`)
      req = await fetchCookie(`https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=${input.subject}&txt_term=${input.term}&txt_campus=${input.gender}&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=100&sortColumn=subjectDescription&sortDirection=asc`, {
        cache: "force-cache",
        headers:{
          "Cache-Control": "max-age=120"
        }
      })

      let res = await req.json()
      const data = []

      res.data.forEach(course => {
        let data2 = {}
        data2.crn = course.courseReferenceNumber
        data2.course = course.subjectCourse + "-" + course.sequenceNumber
        data2.credits = course.creditHours
        data2.maxSeats = course.maximumEnrollment
        data2.takenSeats = course.enrollment
        data2.open = course.openSection
        data2.maxWait = course.waitCapacity
        data2.takenWait = course.waitCount
        data2.startTime = course.meetingsFaculty[0].meetingTime.beginTime
        data2.endTime = course.meetingsFaculty[0].meetingTime.endTime
        data2.area = course.meetingsFaculty[0].meetingTime.building + "-" + course.meetingsFaculty[0].meetingTime.room
        data2.times = getTime({
          u: course.meetingsFaculty[0].meetingTime.sunday,
          m: course.meetingsFaculty[0].meetingTime.monday,
          t: course.meetingsFaculty[0].meetingTime.tuesday,
          w: course.meetingsFaculty[0].meetingTime.wednesday,
          r: course.meetingsFaculty[0].meetingTime.thursday
        })
        data2.meetingType = course.meetingsFaculty[0].meetingTime.meetingScheduleType
        data2.instructor = course.faculty[0] ? course.faculty[0].displayName : ""
        let data3 = {}
        course.meetingsFaculty.map((meeting, i) => {
          if (i !== 0) {
            data3.crn = course.courseReferenceNumber
            data3.course = course.subjectCourse + "-" + course.sequenceNumber
            data3.credits = course.creditHours
            data3.maxSeats = course.maximumEnrollment
            data3.takenSeats = course.enrollment
            data3.open = course.openSection
            data3.maxWait = course.waitCapacity
            data3.takenWait = course.waitCount
            data3.startTime = meeting.meetingTime.beginTime
            data3.endTime = meeting.meetingTime.endTime
            data3.area = meeting.meetingTime.building + "-" + meeting.meetingTime.room
            data3.times = getTime({
              u: meeting.meetingTime.sunday,
              m: meeting.meetingTime.monday,
              t: meeting.meetingTime.tuesday,
              w: meeting.meetingTime.wednesday,
              r: meeting.meetingTime.thursday
            })
            data3.meetingType = meeting.meetingTime.meetingScheduleType
            data3.instructor = course.faculty[i] ? course.faculty[i].displayName ?  course.faculty[i].displayName : "" : course.faculty[0] ? course.faculty[0].displayName : ""
            data3.linkedCourse = data2
            data.push(data3)
            const Detached = JSON.parse(JSON.stringify(data3))
            Detached.linkedCourse = null
            data2.linkedCourse = Detached
          }
        })
        data.push(data2)
      });
      console.log("oioioioi")
      return {
        data: data,
      };
    }),
    getSubjectsRegistrar: publicProcedure
    .query(async () => {
      const random = randomGen()
      const req = await fetch(`https://registrar.kfupm.edu.sa/courses-classes/course-offering1/`)
      const res = await req.text()
      const root = parse(res);
      const subjects = []
      root.querySelector("#dept_code")?.childNodes.forEach(node => {
        if(node.innerText.trim() !== "SELECT DEPARTMENT" && node.rawAttrs){
          subjects.push({code: `${node.rawAttrs}`.split('"')[1], description: node.innerText.trim().replace("&amp;", "&")})
        }
      })
      // const res: { code: string, description: string }[] = await req.json() as { code: string, description: string }[]
      return {
        subjects: subjects,
      };
    }),
    getCoursesRegistrar: publicProcedure
    .input(z.object({ term: z.string(), subject: z.string(), gender: z.string() }))
    .mutation(async ({ input }) => {
      const fetchCookie = makeFetchCookie(fetch)
      const random = randomGen()
      const formData = new FormData()
      let req = await fetchCookie("https://registrar.kfupm.edu.sa/courses-classes/course-offering1/")
      const csrfToken = req.headers.getSetCookie()[0]?.split(";")[0]?.split("=")[1]
      formData.append("term_code", input.term)
      formData.append("dept_code", input.subject)
      formData.append("csrfmiddlewaretoken", csrfToken)
      formData.append("page_choice", "CO")
      req = await fetchCookie("https://registrar.kfupm.edu.sa/course-offerings", {
          method: "POST",
          body: formData,
        })

      let res = await req.text()
      const root = parse(res)
      const data = []
      root.getElementsByTagName("tbody")[0]?.childNodes.forEach(parentNode =>{
        const data2 = {}
        parentNode.childNodes.forEach((node, i) => {
          switch(i){
            case 1: 
              data2.course = node.innerText.trim()
              break;
            case 3:
              data2.meetingType = node.innerText.trim()
              break;
            case 5:
              data2.crn = node.innerText.trim()
              break;
            case 9:
              data2.instructor = node.innerText.trim()
              break;
            case 11:
              data2.times = node.innerText.trim()
              break;
            case 13:
              data2.startTime = node.innerText.trim().split("-")[0]
              data2.endTime = node.innerText.trim().split("-")[1]
              break;
            case 15:
              data2.area = node.innerText.trim()
              break;
            case 17:
              data2.open = node.innerText.trim()
              break;
          }
        })
        if(data2.course){
        data2.maxSeats = 0
        data2.takenSeats = 0
        data2.maxWait = 0
        data2.takenWait = 0

        data.push(data2)}
      })
      return {
        data: data,
      };
    }),
});
