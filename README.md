Assignment 3 - Persistence: Two-tier Web Application with Database, Express server, and CSS template
===
## Flow Space
http://a3-breanna-lee.render.me

The goal of this application is to have a very simple workspace that allows users to keep track of tasks to complete, feel encouraged to get started, and stay on track. 
- the biggest challenge was trying to debug issues in Render. I tried both using Vercel and Leprd. These are both really cool tools for web development, but for something like this, it would've been more complicated than necessary.
- I initially tried using github passport
- I was looking for a CSS framework that would be very minimal and not distracting. 
  - The only CSS I changed was structure, and hover features.
- a list of Express middleware packages you used and a short (one sentence) summary of what each one does. If you use a custom function, please add a little more detail about what it does.

## Technical Achievements
- **Tech Achievement 1**: I implemented my server using Express, and stored data related to logged in users with MongoDB
- **Tech Achievement 2**: OAuth authentication via the GitHub strategy

### Design/Evaluation Achievements
Got 100% in all four lighthouse tests - Performance, Best Practices, Accessibility, and SEO
*Design/UX*
[resources and hints available from the W3C](https://www.w3.org/WAI/).
WRITING
  1. I included headers and subheaders to define tasks, focus timers, and notes
  2. The login page has very clear instructions, and error pop ups. I have placeholder text like "Add task..", and under Notes "What are you working on today?" and "Is there anything distracting you?" 
  3. The text and instructions are easy to read
DESIGINING
  4. Contrast btwn text and background are clear, and the contrast of completed tasks is less
  5. I use both color and symbol to identify completed tasks and checkmarks
  6. Tasks and buttons are clearly highlighted when the mouse hovers over it
  7. All form elements include clearly associated labels - login and register, and notes
  8. Alerts the user when username and password are mismatched or account don't exist
  9. I use whitespace and flex boxes to separate the task list, focus timer, and notes. The tasks have a wider box on the left to highlight the priority, and the timer and temporary notes are put to the side to highlight
DEVELOPMENT
  10. Included "for" and "id" attributes
  11. I added identification for page language
  12. Help users avoid and correct mistakes, by providing specific explanations, placeholders
  13. Reflected reading order in the code with headers marking the start of sections
  14. Keyboard accessibility needs to be added
  15. No CAPTCHA
 
*(5 pts) Describe how your site uses the CRAP principles in the Non-Designer's Design Book readings.*
Contrast: The element that receives the most contrast besides the headers is the blue "add task" button, and blue checkbox for completed tasks. The less urgent buttons are light grey. As the cursor hovers over buttons or tasks, they get darker to show that they are highlighted. The delete button for tasks only appear when a task is highlighted to avoid overcrowding. I wanted the checkboxes for tasks to have more contrast. If the delete button was always visible, then the size of the button to keep the text large enough would draw too much attention. Once tasks are completed, they are moved to the bottom of the list, and changed to a lighter font. This decreases the contrast so that the user can focus on the current ones, while still being able to look back at and celebrate what they have completed. 

Proximity + alignment: As mentioned above in the desigining resources, the three different sections are separated into flex boxes. The main one should be for adding, editing, deleting, and displaying tasks. Therefore this box took up 2/3 of the left side of the page. The timer and note features will only be used when the user plans to start working on the task. The timer is at the top to emphasize the importance of just starting a task. I included a box for focus and distraction notes so that the user can write down important thoughts to come back to later, and stay on track. 

Design elements: The simplicity of the website and the bold font for the timer and headings help highlight the features, without being distracting. The font for the timer is bold, but the text to show completed focus sessions is smaller. 
