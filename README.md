# Capstone Project
## Project Description
College can be an exciting but overwhelming experience at first. Moving to a new city and school without knowing anyone there is an intimidating prospect. Being able to connect instantly with other students based on the interest areas that you usually connect with friends on would ease the process. That’s what Campus Connect is for! When users sign up, they input their school email and choose their respective campus. Users can customize their profile page with information about their interests, such as movies, TV shows, music, and hobbies. Dropdown option data for these categories will be pulled from external APIs. Users can connect their Spotify account to collect their music tastes. They can also upload photos for matches to scroll through and add photos from their Instagram account. Users will be matched based on a similarity percentage calculated through custom logic that I will develop using metrics that are asosciated with strong frienships. Then, users can navigate to the matching page on which they will be shown one match at a time. Users will see their match’s basic information, interests, and can scroll through their media. To match, users can click the heart button. If two users both match with each other, the match will show up on their, additional actions will now become available. If a user likes another user, the user they liked will be able to see their private contact information, such as phone number and Instagram handle. Matches can view more details, such as suggested activities to do together based on similarities and popular nearby activity. Users can also unmatch at any time.

## Getting Started
1. Clone the repository on your local machine
2. Change directory into frontend folder (React)<br/>
`$ cd capstone-ui`
3. Install required dependencies<br/>
`$ npm install`
4. Start the development server<br/>
`$ npm start`
5. In a different terminal, change directory into backend folder (NodeJS/Express)<br/>
`$ cd capstone-backend`
6. Run the backend server<br/>
`$ npm start`

## Relevant Documentation
[Demo Video](https://youtu.be/jewolQkwE00)<br/>
[Matching Algorithm Explanation](https://docs.google.com/document/d/1--g7Vf_NjiCX2FCV-mtEOeLF15B1s_q0vrWOC7ffhLE/edit?usp=sharing)<br/>
[Code Explanations](https://docs.google.com/document/d/1ilYLq371p1IQOr4JNLo6QwvZKE0D7P9o1bA-kBHjrTE/edit?usp=sharing)<br/>
Database Schema:<br/>
<img width="677" alt="Screen Shot 2022-08-11 at 11 57 27 AM" src="https://user-images.githubusercontent.com/34526502/184218085-734a9eb3-f5de-4e32-bf16-0762b49ac594.png">


## User Stories
1. Users Roles
- "college student": a user who is looking for a friend on their college campus
2. User Personas
- Myra is a 20 year old student at UC Berkeley who’s first year was online due to the pandemic. This will be her first time away from her hometown in Ohio, so she would really like to make some friends before she gets to school. Having an app to match her with someone she has a high similarity with can take some of the pressure off. She also doesn’t know exactly what kinds of activities or places are most popular around her area, so having personalized suggestions of activity ideas to do together would make her more motivated to reach out.
- Jake is an 18 year old college student at UT Austin. It is currently New Student Orientation, and people always seem to be going out and making new friends. He has talked to a few people, but is introverted and nervous about reaching out to make plans. This app would allow him to make an instant connection with someone who shares similar interests and receive suggested opening lines along with meetup ideas so that he feels better about reaching out.
3. User Stories
- As a college student, I want to choose what categories are used to calculate my similarity so that I can make friends based on the interests that I usually connect with people on.
- As a college student, I want an easy way to find other students to explore the campus with.
- As a college student, I want to try all the most popular places around my area.
- As a college student, I want to eliminate the awkwardness of first meeting someone by having similar interests to talk about.
- As a college student, I want to connect with other students on social media before arriving on campus.
- As a college student, I want a safe way to make new friends.
